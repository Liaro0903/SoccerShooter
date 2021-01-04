var Archive = pc.createScript('archive');

// initialize code called once per entity
Archive.prototype.initialize = function() {
    
};

// update code called every frame
Archive.prototype.update = function(dt) {
    
};

Archive.prototype.test = function() {
    console.log('When I was testing how to do createTriangle function');
    /*
    var mesh = pc.createMesh(this.app.graphicsDevice, [0,3,0,0,3,5,5,3,0], {
        normals: [0,1,0,0,1,0,0,1,0],
        uvs: [0,0,0,1,0,0]
    });
    
    // Create Material and set diffuse color to red
    var material = new pc.StandardMaterial();
    material.diffuse.set(1, 0, 0);
    this.positions = [0,0,0,3,0,0,3,0,3];
    this.uvs = [0,0,1,0,1,1];
    this.indices = [2,1,0];
    this.normals = pc.calculateNormals(this.positions, this.indices);
    var options = {
        normals: this.normals,
        uvs: this.uvs,
        indices: this.indices
    };
    var mesh = pc.createMesh(this.app.graphicsDevice, this.positions, options);
    // Create mesh instance
    var node = new pc.GraphNode();
    var meshInstance = new pc.MeshInstance(node, mesh, material);
    
    // Create model
    var model = new pc.Model();
    model.graph = node;
    model.meshInstances.push(meshInstance);
    console.log(model);
    //
    // Create entity
    var entity = new pc.Entity();

    // Add a new Model Component to the entity
    entity.addComponent("model");
    entity.model.model = model;
    
    //entity.setLocalPosition(20, 4, 0);
    
    // Add Entity to the scene hierarchy
    this.app.root.addChild(entity);
    */
    /*
    var corners = [
        [ -1, -1,  1 ],
        [  1, -1,  1 ],
        [  1,  1,  1 ],
        [ -1,  1,  1 ],
        [  1, -1, -1 ],
        [ -1, -1, -1 ],
        [ -1,  1, -1 ],
        [  1,  1, -1 ]
    ];

    var sides = [
        {
            // FRONT
            indices: [ 0, 1, 3, 1, 2, 3 ], 
            normal: [ 0,  0,  1 ]
        },
        {
            // BACK
            indices: [ 4, 5, 7, 5, 6, 7 ], 
            normal: [ 0,  0, -1 ]
        },
        {
            // TOP
            indices: [ 3, 2, 6, 2, 7, 6 ], 
            normal: [ 0,  1,  0 ]
        },
        {
            // BOTTOM
            indices: [ 1, 0, 4, 0, 5, 4 ], 
            normal: [ 0, -1,  0 ]
        },
        {
            // RIGHT
            indices: [ 1, 4, 2, 4, 7, 2 ], 
            normal: [ 1,  0,  0 ]
        },
        {
            // LEFT
            indices: [ 5, 0, 6, 0, 3, 6 ], 
            normal: [ -1,  0,  0 ]
        }
    ];
    */
    var corners = [
        [ -1, -1,  1 ], //0
        [  1, -1,  1 ], //1
        [  1,  1,  1 ], //2
        [ -1,  1,  1 ], //3
        [  1, -1, -1 ], //4
        [ -1, -1, -1 ], //5
        [ -1,  1, -1 ], //6
        [  1,  1, -1 ]  //7
    ];
    var sides = [
        /*{
            // FRONT
            indices: [ 0, 1, 3, 1, 2, 3 ], 
            normal: [ 0,  0,  1 ]
        },
        {
            // BACK
            indices: [ 4, 5, 7, 5, 6, 7 ], 
            normal: [ 0,  0, -1 ]
        },
        {
            // TOP
            indices: [ 3, 2, 6, 2, 7, 6 ], 
            normal: [ 0,  1,  0 ]
        },
        {
            // BOTTOM
            indices: [ 1, 0, 4, 0, 5, 4 ], 
            normal: [ 0, -1,  0 ]
        },
        */
        {
            // RIGHT
            indices: [1,4,2], //1,4,2,4,7,2
            normal: [ 1,  0,  0 ]
        },
        /*
        {
            // LEFT
            indices: [ 5, 0, 6, 0, 3, 6 ], 
            normal: [ -1,  0,  0 ]
        }
        */
    ];
    var positions = [];
    var normals = [];

    // Build an unindexed array of positions and normals representing the cube
    for (var s = 0; s < sides.length; s++) {
        var side = sides[s];

        for (var i = 0; i < side.indices.length; i++) {
            positions.push(corners[side.indices[i]][0], corners[side.indices[i]][1], corners[side.indices[i]][2]);
            normals.push(side.normal[0], side.normal[1], side.normal[2]);
        }
    }
    console.log(positions);
    console.log(normals);

    /*var mesh = pc.createMesh(this.app.graphicsDevice, positions, { 
        normals: normals 
    });
    */
    var mesh = pc.createMesh(this.app.graphicsDevice, [1,1,1,1,0,1,1,0,-1], { 
        normals: [1,0,0,1,0,0,1,0,0]
    });
    var node = new pc.GraphNode();
    var material = new pc.StandardMaterial();
    //var material = this.materials;
    console.log(material);
    var meshInstance = new pc.MeshInstance(node, mesh, material);

    // Create a model to hold the cube mesh instance
    var model = new pc.Model();
    model.graph = node;
    model.meshInstances = [ meshInstance ];

    // Add the model to a model component on the entity
    this.entity.addComponent('model');
    this.entity.model.model = model;
    
    var meshInstances = this.entity.model.meshInstances;
    mesh = meshInstances[0];
    material = this.materials;
    mesh.material = material.resource;
};

// swap method called for script hot-reloading
// inherit your script state here
// Archive.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/