var dataLoader = new DataLoader();

var objCache = {};

function DataLoader() {
    this.modelOBJlist = [];
    this.modelOBJcount = 0;
    this.modelOBJindex = 0;


    // add an OBJ (wavefront) model to the unloaded items list
    this.addOBJmodel = function (obj) {
        this.modelOBJlist.push(obj);
        this.modelOBJcount += 1;
    };



    this.loadModels = function () {
        if (this.modelOBJindex >= this.modelOBJcount) return; //stop recursively calling when last model loaded.

        var objName = this.modelOBJlist[this.modelOBJindex].name;
        var request = new XMLHttpRequest();
        request.open("GET", this.modelOBJlist[this.modelOBJindex].url);
        request.dataURL = this.modelOBJlist[this.modelOBJindex].url;
        this.modelOBJindex += 1;
        var lastModelToLoad = this.modelOBJindex >= this.modelOBJcount;
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                try {
                    dataLoader.makeOBJobject(objName, request.responseText, request.dataURL, lastModelToLoad);
                    dataLoader.loadModels(); //recursive call
                } catch (e) {/*console.log(e);*/}
            }
        }

        //try and load from cache if possible.
        if(objCache[objName] !== undefined){
            try {
                dataLoader.makeOBJobject(objName, "", request.dataURL, lastModelToLoad); //use cache if possible
                dataLoader.loadModels(); //recursive call
            } catch (e) {
                console.log(e);
            }
        }else {
            request.send();
        }
    };

    this.finishModelLoading = function () {
        this.modelOBJlist = [];
        this.modelOBJindex = 0;
        startApp();
    };
}


dataLoader.makeOBJobject = function (name, objFileData, dataURL, lastModelToLoad) {
    //load from cache where possible
    if(objCache[name] !== undefined){
        loadedObjs.push(objCache[name]);
        if(lastModelToLoad) dataLoader.finishModelLoading();
        return;
    }

    // find path to file name
    var fnameIndex = dataURL.lastIndexOf("/");
    var path = dataURL.substring(0, fnameIndex);
    var mtlFilepath = ""; //path to a mtl file if found

    // graphicsObject object that will contain the GL model data
    var obj = new GraphicsObject();
    obj.name = name;

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
        var linePart = lines[i].replace(/^\s+/, "").split(/\s+/);

        if (linePart.length == 0) continue;

        // vertex position item
        if (linePart[0] == "v") {
            vertexList.push([linePart[1], linePart[2], linePart[3]]);
        }

        // texture coordinate item
        else if (linePart[0] == "vt") {
            textureList.push([linePart[1], linePart[2], linePart[3]]);
        }

        // normal coordinate item
        else if (linePart[0] == "vn") {
            normalsList.push([linePart[1], linePart[2], linePart[3]]);
        }

        // face (most common form: "f v1/t1/n1 v2/t2/n2 v3/t3/n3")
        else if (linePart[0] == "f") {
            [linePart[1], linePart[2], linePart[3]].forEach(function(faceCoord){
                dataLoader.processFaceCoord(faceCoord, vertexPositions, vertexList, vertexTextureCoords, textureList, vertexNormalCoords, normalsList);
            });

            faceVertexCount += 3;
        }

        else if (linePart[0] == "mtllib"){
            if(linePart[1].endsWith(".mtl")) {
                mtlFilepath = linePart[1];
            }
        }

        else if (linePart[0] == "usemtl") {
            useTexture = true;
        }
    }

        if(!useTexture) throw "No texture detected for model";
        $.ajax({"url" : path + "/" + mtlFilepath}).success(function(mtlFile){
            var textureFilepath = extractImageFilePathFromMtlFile(mtlFile);
            obj.loadTextureFromURL(path + "/" + textureFilepath, faceVertexCount, 0);

            obj.initPositionBuffer(GL, vertexPositions);
            obj.initTextureBuffer(GL, vertexTextureCoords);
            obj.initNormalBuffer(GL, vertexNormalCoords);
            if (indexVertexCoords.length != 0) obj.initIndexBuffer(GL, indexVertexCoords);

            // push the object to the loadedObjs list
            loadedObjs.push(obj);
            if(lastModelToLoad) dataLoader.finishModelLoading();
            objCache[name] = obj;
            App.initScene();
        });
};

dataLoader.processFaceCoord = function(faceCoord, vertexPositions, vertexList,
                                       vertexTextureCoords, textureList,
                                        vertexNormalCoords, normalsList){
    //typically:  "f v/t/n"
    var parts = faceCoord.split("/");
    if(parts.length == 1) return;
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