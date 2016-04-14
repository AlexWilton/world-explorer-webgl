var dataLoader = new DataLoader();


function DataLoader() {

    // list of URLs to the unloaded objects (as files)
    this.textureList = [];
    this.modelOBJlist = [];

    // number of unloaded objects
    this.textureCount = 0;
    this.modelOBJcount = 0;

    // index of loaded objects (points to next object to be loaded
    //	in the object list)
    this.textureIndex = 0;
    this.modelOBJindex = 0;


    // add a texture to the unloaded items list
    this.addTexture = function (url) {
        this.textureList.push(url);
        this.textureCount += 1;
    }


    // add an OBJ (wavefront) model to the unloaded items list
    this.addOBJmodel = function (url) {
        this.modelOBJlist.push(url);
        this.modelOBJcount += 1;
    }


    // call to load all data that is currently on the loading wait list
    this.loadAll = function () {
        this.loadModelsThenTextures();
    }

    // load step 1: load the models
    this.loadModelsThenTextures = function () {
        // if all models have been loaded, continue to loading textures
        if (this.modelOBJindex >= this.modelOBJcount) return;
        console.log(dataLoader.modelOBJindex + " " + dataLoader.modelOBJcount);
        // load and process the next OBJ file from the list;
        //	(OBJ file gets translated to a "graphicsObject" and pushed
        //	to the "sceneObjects" list)
        var request = new XMLHttpRequest();
        request.open("GET", this.modelOBJlist[this.modelOBJindex]);
        request.dataURL = this.modelOBJlist[this.modelOBJindex];
        this.modelOBJindex += 1;
        var lastModelToLoad = this.modelOBJindex >= this.modelOBJcount;
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                try {
                    dataLoader.makeOBJobject(request.responseText, request.dataURL, lastModelToLoad);
                    dataLoader.loadModelsThenTextures();
                } catch (e) {
                    console.log(e);
                }

            }
        }
        request.send();
    }

    // load step X: reset variables and finish loading
    this.finish = function () {
        console.log('All Models loaded.');
        this.textureList = [];
        this.modelOBJlist = [];
        this.textureIndex = 0;
        this.modelOBJindex = 0;
        this.onload();
    }


    // OVERRIDE: function that is called when ALL objects are fully loaded,
    //	regardless of whether or not some failed.
    // This function should be defined to execute any necessary action
    //	after everything has been loaded.
    this.onload = function () {}
}



/*** MAKE OBJ OBJECT ***/
// Translates raw OBJ file data (text) into a graphicsObject and pushes it as the
//	next item in the sceneObjects list.
// If .obj file contains texture data, textures will be searched for in the same
//	directory in which the .obj file is located.
// WARNING: Textures must be Javascript readable (i.e. JPEG, PNG, GIF, etc.),
//	otherwise they will fail to load.
dataLoader.makeOBJobject = function (objFileData, dataURL, lastModelToLoad) {
    // find path to file name
    var fnameIndex = dataURL.lastIndexOf("/");
    var path = dataURL.substring(0, fnameIndex);

    var mtlFilepath = ""; //path to a mtl file if found

    // graphicsObject object that will contain the GL model data
    var obj = new GraphicsObject();

    // split the data into an array of separate lines
    var lines = objFileData.split("\n");

    // main buffers (to be built up)
    var vertexPositions = [];
    var vertexTextureCoords = [];
    var vertexNormalCoords = [];
    var indexVertexCoords = [];

    // temporary buffer values as read in from file
    var vertexList = [];
    var textureList = [];
    var normalsList = [];

    var faceVertexCount = 0;

    var useTexture = false;

    // read file data line-by-line
    for (var i in lines) {
        // get line values one by one
        var vals = lines[i].replace(/^\s+/, "").split(/\s+/);

        // if empty line, just continue
        if (vals.length == 0)
            continue;

        // if vertex position item, push the verticies to temp array
        if (vals[0] == "v") {
            vertexList.push([vals[1], vals[2], vals[3]]);
        }

        // if texture coordinate item, push the coordinates to temp array
        else if (vals[0] == "vt") {
            textureList.push([vals[1], vals[2], vals[3]]);
        }

        // if normal coordinate item, push the coordinates to temp array
        else if (vals[0] == "vn") {
            normalsList.push([vals[1], vals[2], vals[3]]);
        }

        // if face, push the appropriate indexed values to main buffers
        else if (vals[0] == "f") {
            // f v1/t1/n1 v2/t2/n2 v3/t3/n3
            // vertex #1
            //var coord_1 = vals[1].split("/");
            [vals[1], vals[2], vals[3]].forEach(function(faceCoord){
                dataLoader.processFaceCoord(faceCoord, vertexPositions, vertexList, vertexTextureCoords, textureList, vertexNormalCoords, normalsList);
            });

            // add 3 to face vertex count
            faceVertexCount += 3;
        }

        else if (vals[0] == "mtllib"){
            if(vals[1].endsWith(".mtl")) {
                mtlFilepath = vals[1];
            }
        }

        // if usemtl (use material) line appears, load textures after
        //	the faces have been added on using vertex counts
        else if (vals[0] == "usemtl") {
            useTexture = true;
        }
    }

    if(useTexture){

        //first get texture filepath
        $.ajax({"url" : path + "/" + mtlFilepath}).success(function(mtlFile){
            var textureFilepath = extractImageFilePathFromMtlFile(mtlFile);
            obj.loadTextureFromURL(path + "/" + textureFilepath, faceVertexCount, 0);

            // add all vertices to the graphicsObject
            obj.initPositionBuffer(GL, vertexPositions);
            obj.initTextureBuffer(GL, vertexTextureCoords);
            obj.initNormalBuffer(GL, vertexNormalCoords);
            if (indexVertexCoords.length != 0) obj.initIndexBuffer(GL, indexVertexCoords);

            // push the object to the sceneObjects list
            sceneObjects.push(obj);
            if(lastModelToLoad) dataLoader.finish();
        });
    }else{
        $.ajax({"url" : dataURL}).always(function(r){
        // add all vertices to the graphicsObject
        obj.initPositionBuffer(GL, vertexPositions);
        obj.initTextureBuffer(GL, vertexTextureCoords);
        obj.initNormalBuffer(GL, vertexNormalCoords);
        if (indexVertexCoords.length != 0) obj.initIndexBuffer(GL, indexVertexCoords);

        // push the object to the sceneObjects list
        sceneObjects.push(obj);
        if(lastModelToLoad) dataLoader.finish();
        });
    }
};

dataLoader.processFaceCoord = function(faceCoord, vertexPositions, vertexList,
                                       vertexTextureCoords, textureList,
                                        vertexNormalCoords, normalsList){
    //typically:  "f v/t/n"
    var parts = faceCoord.split("/");
    if(parts.length == 2) parts.push(parts[0]); //in cases such as "f v/t", copy first for third: "f v/t/v"

    // push x,y,z vertex values of this coordinate
    vertexPositions.push(vertexList[parseInt(parts[0]) - 1][0]);
    vertexPositions.push(vertexList[parseInt(parts[0]) - 1][1]);
    vertexPositions.push(vertexList[parseInt(parts[0]) - 1][2]);

    //if texture values, push x,y texture values
    if(parts[1] != "") {
        vertexTextureCoords.push(textureList[parseInt(parts[1]) - 1][0]);
        vertexTextureCoords.push(textureList[parseInt(parts[1]) - 1][1]);
    }

    // push x,y,z normal values of this coordinate
    vertexNormalCoords.push(normalsList[parseInt(parts[2]) - 1][0]);
    vertexNormalCoords.push(normalsList[parseInt(parts[2]) - 1][1]);
    vertexNormalCoords.push(normalsList[parseInt(parts[2]) - 1][2]);
};



function extractImageFilePathFromMtlFile(mtlFile){
    var mtlLines = mtlFile.split("\n");
    for (var mtlLineIndex in mtlLines) {
        var mtlLine = mtlLines[mtlLineIndex];
        var lineParts = mtlLine.split(" ");
        if(lineParts[0] == "map_Kd"){
            return lineParts[1];
        }
    }
}