function DiamondLoader() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    this.loader = new THREE.OBJLoader(manager);
}

DiamondLoader.prototype = {
    constructor : DiamondLoader,
    
    load: function(fileName, onObjectLoad) {
        this.loader.load(fileName, onObjectLoad);
    }
};

