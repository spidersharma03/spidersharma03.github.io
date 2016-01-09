/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var vertexShaderPMREMLatLon = "varying vec2 vUv;\
                   void main() {\
                        vUv = uv;\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
                   }";

var fragmentShaderPMREMLatLon = "\
    varying vec2 vUv;\
    uniform samplerCube cubeTexture;\
    uniform float mipmapIndex;\
    uniform float mapWidth;\
    uniform float mapHeight;\
    uniform vec3 testColor;\
    \
    const float PI = 3.14159265358979;\
    vec3 fixSeams(vec3 vec) {\
        float scale = 1.0 - exp2(mipmapIndex) / mapWidth;\
        float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));\
        if (abs(vec.x) != M) vec.x *= scale;\
        if (abs(vec.y) != M) vec.y *= scale;\
        if (abs(vec.z) != M) vec.z *= scale;\
        return vec;\
    }\
    \
    vec4 sampleCubeMap(float phi, float theta) {\
        float sinTheta = sin(theta);\
        float cosTheta = cos(theta);\
        vec3 sampleDir = vec3(cos(phi) * sinTheta, cosTheta, sin(phi) * sinTheta);\
        vec4 color = textureCube(cubeTexture, fixSeams(sampleDir));\
        return color * vec4(testColor, 1.0);\
    }\
    void main() {\
        vec2 uv = vUv;\
        float offset = -1.0/mapWidth;\
        const float a = 0.0;\
        const float b = 1.0;\
        float c = 0.0;\
        float c1 = 0.0 + offset;\
        float d = 1.0 - offset;\
        float bminusa = b - a;\
        uv.x = (uv.x - a)/bminusa * d - (uv.x - b)/bminusa * c;\
        uv.y = (uv.y - a)/bminusa * d - (uv.y - b)/bminusa * c1;\
        vec4 color = sampleCubeMap(uv.x*2.0*PI, uv.y*PI);\
        gl_FragColor = color;\
    }\
";
var uniformsPMREMLatLon = {
                "mapWidth": {type: 'f', value: 0},
                "mipmapIndex": {type: 'f', value: 0},
                "mapHeight": {type: 'f', value: 0},
                "cubeTexture": {type: 't', value: null},
                "testColor": {type: 'v3', value: new THREE.Vector3(1,1,1)}
};

var testColor = [];
testColor.push(new THREE.Vector3(1,0,0));
testColor.push(new THREE.Vector3(0,1,0));
testColor.push(new THREE.Vector3(0,0,1));
testColor.push(new THREE.Vector3(1,1,0));
testColor.push(new THREE.Vector3(0,1,1));
testColor.push(new THREE.Vector3(1,0,1));
testColor.push(new THREE.Vector3(1,1,1));
testColor.push(new THREE.Vector3(0.5,1,0.5));

var PMREM_LatLonPacker = function(cubeTextureLods, resolution, numLods) {
    this.cubeLods = cubeTextureLods;
    this.numLods = numLods;
    var size = resolution*4;
    // Lat Lon Render Target
    this.LatLonRenderTarget = new THREE.WebGLRenderTarget(size, size,
        { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );
    this.LatLonRenderTarget.texture.generateMipmaps = false;

    this.camera= new THREE.OrthographicCamera(-size*0.5, size*0.5, -size*0.5, size*0.5, 0.0, 1000);
    
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    this.objects = [];
    var xOffset = 0;
    var yOffset = size/4;
    for(var i=0; i<numLods; i++) {
        var mipMapOffsetX = 0;
        var mipMapOffsetY = 0;
        var mipMapSize = size;
        for(var j=0; j<7; j++) { // Mip Map loop
            var material = new THREE.ShaderMaterial();
            material.vertexShader = vertexShaderPMREMLatLon;
            material.fragmentShader = fragmentShaderPMREMLatLon;
            material.uniforms = THREE.UniformsUtils.clone(uniformsPMREMLatLon);
            material.uniforms["cubeTexture"].value = this.cubeLods[i];
            material.uniforms["mapWidth"].value = mipMapSize;
            material.uniforms["mipmapIndex"].value = j;
            var color = material.uniforms["testColor"].value;
//            color.copy(testColor[j]);
            var planeMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(mipMapSize, mipMapSize/2, 0),
                    material);
            planeMesh.position.x = xOffset + mipMapOffsetX;
            planeMesh.position.y = yOffset + mipMapOffsetY;
            planeMesh.material.side = THREE.DoubleSide;
            this.objects.push(planeMesh);
            mipMapSize /= 2;
            mipMapOffsetX += mipMapSize/2;
            mipMapOffsetY -= (mipMapSize/2 + mipMapSize/4);
            this.scene.add(planeMesh);
        }
        size /= 2;
        xOffset -= size/2;
        yOffset -= (size/2 + size/4);
    }
};

PMREM_LatLonPacker.prototype = {
    constructor : PMREM_LatLonPacker,
    
    update: function(renderer) {
        renderer.render(this.scene, this.camera, this.LatLonRenderTarget, true);
    },
    
    renderToLatLonTarget: function(renderer, renderTarget) {
        
    }
};
