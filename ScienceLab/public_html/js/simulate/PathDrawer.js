/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function PathDrawer(color, maxPoints) {
    this.rootNode = new THREE.Object3D();
    this.pathGeometry = new THREE.BufferGeometry();
    this.pathGeometry.dynamic = true;
    
    this.maxDrawingPoints = maxPoints > 0 ? maxPoints : 1000;
    this.currentDrawingCount = -1;
    this.positions_array = [];
    this.colors_array = [];
    this.indices_array = [];
    
    for( var i=0; i<this.maxDrawingPoints; i++)
    {
        this.positions_array.push(0,0,0);
        if(!color)
            this.colors_array.push(1,0,0);
        else
            this.colors_array.push(color.x,color.y,color.z);
    }
    for( var i=0; i<this.maxDrawingPoints-1; i++)
    {
        this.indices_array.push(i, i+1);   
    }
   
    this.pathGeometry.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array( this.indices_array ), 1 ) );
    this.pathGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.positions_array ), 3 ) );
    this.pathGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( this.colors_array ), 3 ) );

    this.pathGeometry.dynamic = true;
    var lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 5 });
    this.pathMesh = new THREE.Line( this.pathGeometry, lineMaterial, THREE.LinePieces );
    this.pathMesh.geometry.computeBoundingSphere();
    this.pathMesh.geometry.dynamic = true;
    this.pathMesh.geometry.attributes.position.needsUpdate = true;
    this.rootNode.add(this.pathMesh);
}

PathDrawer.prototype = {
    constructor: PathDrawer,
    
    pushPoint: function(point) {
        this.currentDrawingCount++;
        this.updatePathGeometry(point);
    },
    
    popPoint: function(point) {
        this.currentDrawingCount--;
    },
    
    updatePathGeometry: function(newPoint) {
        var positions = this.pathMesh.geometry.getAttribute( 'position' ).array;
        // Add point
        if( this.currentDrawingCount < this.maxDrawingPoints )
        {
            for( var i=3*this.currentDrawingCount; i<3*(this.maxDrawingPoints); i+=3 )
            {
                positions[i] = newPoint.x;
                positions[i+1] = newPoint.y;
                positions[i+2] = newPoint.z;
            }
        }
        // Remove extra point
        if(this.currentDrawingCount >= this.maxDrawingPoints )
        {
            this.currentDrawingCount = this.maxDrawingPoints;
            for( var i=0; i<3*(this.maxDrawingPoints-1); i+=3 )
            {
                positions[i] = positions[i+3];
                positions[i+1] = positions[i+4];
                positions[i+2] = positions[i+5];
            }
            positions[3*(this.currentDrawingCount-1)] = newPoint.x;
            positions[3*(this.currentDrawingCount-1)+1] = newPoint.y;
            positions[3*(this.currentDrawingCount-1)+2] = newPoint.z;
        }
        // Update Geometry
        this.pathMesh.geometry.needsUpdate = true;

        this.pathMesh.geometry.computeBoundingSphere();
        this.pathMesh.geometry.dynamic = true;
        this.pathMesh.geometry.attributes.position.needsUpdate = true;
    },
    
    getRootNode: function() {
        return this.rootNode;
    }
};