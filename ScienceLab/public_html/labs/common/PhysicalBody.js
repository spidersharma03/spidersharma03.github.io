/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function PhysicalBody(bodyParams) {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.mass = 1.0;
    this.e = 0.0;
    this.mu_k = 0.0;
    this.mu_d = 0.0;
    if(bodyParams) {
        
    }
}