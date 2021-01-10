var CreateTriangle = pc.createScript('createTriangle');

CreateTriangle.attributes.add('material', {type: 'asset', assetType: 'material', array: false, title: 'Wall_Material'});

CreateTriangle.prototype.initialize = function() {
    this.createTriangle();
};

CreateTriangle.prototype.createTriangle = function() {
    var meshes = [];
    var meshInstance = [];
    /*
    var coordinates = [
        [-50,0,-25,-57.071,7.071,-32.071,-57.071,7.071,-25    ],
        [-50,0,-25,-50    ,7.071,-32.071,-57.071,7.071,-32.071],
        [-50,0, 25,-57.071,7.071, 32.071,-50    ,7.071, 32.071],
        [-50,0, 25,-57.071,7.071, 25    ,-57.071,7.071, 32.071],
        [ 50,0, 25, 57.071,7.071, 32.071, 57.071,7.071, 25    ],
        [ 50,0, 25, 50    ,7.071, 32.071, 57.071,7.071, 32.071],
        [ 50,0,-25, 57.071,7.071,-25    , 57.071,7.071,-32.071],
        [ 50,0,-25, 57.071,7.071,-32.071, 50    ,7.071,-32.071]
    ];
    */
    var coordinates = [
        [-50,0,-25,-64.142, 14.142,-39.142,-64.142, 14.142,-25    ],
        [-50,0,-25,-50    , 14.142,-39.142,-64.142, 14.142,-39.142],
        [-50,0, 25,-64.142, 14.142, 39.142,-50    , 14.142, 39.142],
        [-50,0, 25,-64.142, 14.142, 25    ,-64.142, 14.142, 39.142],
        [ 50,0, 25, 64.142, 14.142, 39.142, 64.142, 14.142, 25    ],
        [ 50,0, 25, 50    , 14.142, 39.142, 64.142, 14.142, 39.142],
        [ 50,0,-25, 64.142, 14.142,-25    , 64.142, 14.142,-39.142],
        [ 50,0,-25, 64.142, 14.142,-39.142, 50    , 14.142,-39.142]
    ];
    var normals = [
        [ 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [ 0, 1, 1, 0, 1, 1, 0, 1, 1],
        [ 0, 1,-1, 0, 1,-1, 0, 1,-1],
        [ 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [-1, 1, 0,-1, 1, 0,-1, 1, 0],
        [ 0, 1,-1, 0, 1,-1, 0, 1,-1],
        [-1, 1, 0,-1, 1, 0,-1, 1, 0],
        [ 0, 1, 1, 0, 1, 1, 0, 1, 1]
    ];
    var node = new pc.GraphNode();
    var material = new pc.StandardMaterial();
    for(var i = 0; i < coordinates.length; i++) {
        meshes[i] = pc.createMesh(this.app.graphicsDevice, coordinates[i], {   
            normals: normals[i]
        });
        meshInstance[i] = new pc.MeshInstance(node, meshes[i], material);
    }

    // Create a model to hold the cube mesh instance
    var model = new pc.Model();
    model.graph = node;
    model.meshInstances = meshInstance;
    
    // Add the model to a model component on the entity
    this.entity.addComponent('model');
    this.entity.model.model = model;
    
    //Add Material
    for(i = 0; i < coordinates.length; i++) {
        meshInstance[i].material = this.material.resource;
    }
};