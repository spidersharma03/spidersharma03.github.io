/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Kinematics3DView(kinematics_lab) {
    this.kinematics_lab = kinematics_lab;
    this.time_snap_objects = [];
    this.objects_3d = [];
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cubeMaterial = null;
    this.groundMaterial = null;
    this.sphereMaterial = null;
    this.projector = new THREE.Projector();
    this.projectedCoords = new THREE.Vector3();
    this.init();
    this.makeBaseGeometry();
    
    var map = THREE.ImageUtils.loadTexture( "../../img/sprite.png" );
    this.spriteMaterial = new THREE.SpriteMaterial( { map: map, transparent:true } );
}

Kinematics3DView.prototype = {
    constructor : Kinematics3DView,
    
    getObject3D: function(modelObject) {
        return this.objects_3d[modelObject.id];
    },
    
    addObject3D : function(modelObject, position, scale) {
        if(modelObject.type === "SIMULATIONBODY") {
            var sprite = this.createSpriteObject();
            sprite.position.copy(position);
            sprite.scale.x = scale;
            sprite.scale.y = scale;            
            this.objects_3d[modelObject.id] = sprite;
            this.scene.add(sprite);
            return sprite;
        }
        if(modelObject.type === "PHYSICALBODY") {
            var bodyOnTrack = this.createMassGeometryStraightTrack(1,1, this.sphereMaterial);
            this.objects_3d[modelObject.id] = bodyOnTrack;
            bodyOnTrack.position.y = 0.05;
            this.scene.add(bodyOnTrack);
            return bodyOnTrack;
        }
    },
    
    updateObject3D: function(modelObject) {
        var object3d = this.objects_3d[modelObject.id];
        if(object3d) {
            object3d.position.x = modelObject.position.x;
        }
    },
    
    makeBaseGeometry: function() {
        var trackLength = 240.0;
        var trackGeometryPath = [];
        var trackSize = 1.0;

        trackGeometryPath.push(new THREE.Vector2(trackSize / 2, 0));
        trackGeometryPath.push(new THREE.Vector2(0, trackSize / 2 * Math.sqrt(3.0)));
        trackGeometryPath.push(new THREE.Vector2(-trackSize / 2, 0));

        var extrudeSettings = {
            amount: trackLength,
            steps: 2,
            material: 1,
            extrudeMaterial: 0,
            bevelEnabled: false
        };

        var shape = new THREE.Shape(trackGeometryPath);
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var mesh = new THREE.Mesh(geometry, this.groundMaterial);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.y = Math.PI / 2;
        mesh.position.x = -trackLength / 2;
        mesh.position.y -= trackSize - 0.7 * 0.5;
        this.scene.add(mesh);

        var baseGroup = new THREE.Object3D();
        var baseGeometry1 = new THREE.BoxGeometry(trackLength, trackSize, 0.1);
        var baseMesh1 = new THREE.Mesh(baseGeometry1, this.groundMaterial);
        baseMesh1.castShadow = false;
        baseMesh1.receiveShadow = true;
        var baseMesh2 = baseMesh1.clone();
        baseMesh1.position.z = trackSize / 2;
        baseMesh2.position.z = -trackSize / 2;
        baseGroup.position.y = -trackSize / 2;
        baseGroup.add(baseMesh1);
        baseGroup.add(baseMesh2);
        baseGroup.position.y -= trackSize - 0.7 * 0.5;
        this.scene.add(baseGroup);    
    },
    
    createMassGeometryStraightTrack : function(size, mass, material) {
        var width = 0.1;
        var height = 0.7;
        var length = size;
        var geometryGroup = new THREE.Object3D();
        var geometry1 = new THREE.BoxGeometry(length, height, width);
        var mesh1 = new THREE.Mesh(geometry1, material);
        mesh1.castShadow = true;
        mesh1.receiveShadow = true;
        geometryGroup.add(mesh1);
        var mesh2 = mesh1.clone();
        var mesh3 = mesh1.clone();
        geometryGroup.add(mesh2);
        mesh1.rotation.x = Math.PI / 6;
        mesh2.rotation.x = -Math.PI / 6;
        mesh1.position.z = -height / 4.0;
        mesh2.position.z = height / 4.0;
        mesh3.position.y += height * 0.9;
        geometryGroup.add(mesh3);
        return geometryGroup;
    },
    
    init: function() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
        this.camera.position.z = 22;
        this.camera.position.y = 4;
        var controls = new THREE.OrbitControls(this.camera);
        controls.addEventListener('change', render);

        // scene
        this.scene = new THREE.Scene();
        var ambient = new THREE.AmbientLight(0x101030);
        this.scene.add(ambient);
        var light = new THREE.DirectionalLight(0xffeedd);
        light.position.set(50, 200, -100);
        light.castShadow = true;
        light.shadowMapWidth = 1024;
        light.shadowMapHeight = 1024;

        var d = 20;
        light.shadowCameraLeft = -d;
        light.shadowCameraRight = d;
        light.shadowCameraTop = d;
        light.shadowCameraBottom = -d;
        light.shadowCameraFar = 1000;
        light.shadowDarkness = 0.5;
        this.scene.add(light);
        var hemiLight = new THREE.HemisphereLight(0xaabbff, 0x111111, 4.0);
        this.scene.add(hemiLight);

        var manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        var path = "../../img/pisa/";
        var format = '.png';
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
        reflectionCube.format = THREE.RGBFormat;
        var texture = THREE.ImageUtils.loadTexture("../../img/dark-metal-texture.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        var sphereTexture = THREE.ImageUtils.loadTexture("../../img/billboard.jpeg");

        this.cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, envMap: reflectionCube, ambient: 0xaaaaaa, combine: THREE.MixOperation});
        this.groundMaterial = new THREE.MeshPhongMaterial({envMap: reflectionCube, map: texture, color: 0xffffff, specular: 0xffffff, combine: THREE.MixOperation, bumpScale: 0.010, bumpMap: texture, ambient: 0x555555, reflectivity: 0.5, metal: true, shininess: 1000});
        this.sphereMaterial = new THREE.MeshPhongMaterial({envMap: reflectionCube, map: sphereTexture, color: 0xff0000, specular: 0xffffff, combine: THREE.MixOperation, ambient: 0x555555, reflectivity: 0.8, shininess: 10});

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('mousewheel', onDocumentMouseWheel, false);
        window.addEventListener('resize', onWindowResize, false);
        //renderer.shadowMapEnabled = true;
        //renderer.shadowMapSoft = true;
    },
    
    appendToParent: function(parent) {
          parent.appendChild(this.renderer.domElement);
    },
    
    render: function() {
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.render(this.scene, this.camera);
    },
    
    projectToScreenSpace: function(object) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var widthHalf = w / 2, heightHalf = h / 2;

        this.projector.projectVector( this.projectedCoords.setFromMatrixPosition( object.matrixWorld ), this.camera );
        this.projectedCoords.x = ( this.projectedCoords.x * widthHalf ) + widthHalf;
        this.projectedCoords.y = - ( this.projectedCoords.y * heightHalf ) + heightHalf;
        return this.projectedCoords;
    },
    
    createSpriteObject: function() {
        var sprite = new THREE.Sprite( this.spriteMaterial );
        return sprite;
    },
    
    addSpriteToScene: function(position, scale) {
        var spriteObject = this.createSpriteObject();
        spriteObject.position.x = position.x;
        spriteObject.position.y = position.y;
        spriteObject.position.z = position.z;
        spriteObject.scale.x = scale;
        spriteObject.scale.y = scale;
        this.scene.add(spriteObject);
    }
};