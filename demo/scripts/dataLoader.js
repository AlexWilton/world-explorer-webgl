/* FILE: dataLoader.js
 * Contains the object that is responsible for loading data through
 *	HTTP requests - data is anything the application needs before running,
 *	including textures, models, images and sounds.
 */


// DataLoader global variable: used by App and main() to load data
var dataLoader = new DataLoader();


/*** DataLoader object definition: ***/
function DataLoader(){
	
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
	this.addTexture = function(url){
		this.textureList.push(url);
		this.textureCount += 1;
	}
	
	
	// add an OBJ (wavefront) model to the unloaded items list
	this.addOBJmodel = function(url){
		this.modelOBJlist.push(url);
		this.modelOBJcount += 1;
	}
	
	
	// call to load all data that is currently on the loading wait list
	this.loadAll = function(){
		this.loadModelsThenTextures();
	}
	
	// load step 1: load the models
	this.loadModelsThenTextures = function(){
		// if all models have been loaded, continue to loading textures
		if(this.modelOBJindex >= this.modelOBJcount){
			this.loadTextures();
		}
		else{
			// load and process the next OBJ file from the list;
			//	(OBJ file gets translated to a "graphicsObject" and pushed
			//	to the "sceneObjects" list)
			var request = new XMLHttpRequest();
			request.open("GET", this.modelOBJlist[this.modelOBJindex]);
			request.dataURL = this.modelOBJlist[this.modelOBJindex];
			this.modelOBJindex += 1;
			request.onreadystatechange = function(){
				if(request.readyState == 4){
					try{
						dataLoader.makeOBJobject(request.responseText,
							request.dataURL);
					} catch(e) {
						// TODO - remove alert and change to error log
						console.log(e);
						alert("makeOBJobject failed");
					}
					dataLoader.loadModelsThenTextures();
				}
			}
			request.send();
		}
	}
	
	// load step 2: load the textures
	this.loadTextures = function(){
		// if all textures have been loaded, finish loading sequence
		if(this.textureIndex >= this.textureCount){
			this.finish();
		}
		else{
			// load and process the next texture from the list;
			//	(texture GL object gets pushed into "textures" list)
			var newTexture = GL.createTexture();
			newTexture.image = new Image();
			this.textureIndex += 1;
			newTexture.image.onload = function(){
				dataLoader.bindLoadedTexture(newTexture);
				dataLoader.loadTextures();
			}
			newTexture.image.src = this.textureList[this.textureIndex-1];
			textures.push(newTexture);
		}
	}
	
	// load step X: reset variables and finish loading
	this.finish = function(){
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
	this.onload = function(){}
}




/*** BIND GL TEXTURE ***/
// After texture is loaded from img file, bind the texture to GL
//	so that it will be usable. This function also contains GL
//	texture properties.
dataLoader.bindLoadedTexture = function(texture){
	GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);

	GL.bindTexture(GL.TEXTURE_2D, texture);
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, texture.image);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
	GL.generateMipmap(GL.TEXTURE_2D);
	
	GL.bindTexture(GL.TEXTURE_2D, null);
}


/*** MAKE OBJ OBJECT ***/
// Translates raw OBJ file data (text) into a graphicsObject and pushes it as the
//	next item in the sceneObjects list.
// If .obj file contains texture data, textures will be searched for in the same
//	directory in which the .obj file is located.
// WARNING: Textures must be Javascript readable (i.e. JPEG, PNG, GIF, etc.),
//	otherwise they will fail to load.
dataLoader.makeOBJobject = function(objFileData, dataURL){
	// find path to file name
	var fnameIndex = dataURL.lastIndexOf("/");
	var path = dataURL.substring(0, fnameIndex);
	
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
	var curTextureOffset = 0;
	
	var numTextures = 0;
	var lastTexture;
	
	// read file data line-by-line
	for(var i in lines){
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
            var coord_1 = [vals[1].split("/")[0], vals[1].split("/")[0], vals[1].split("/")[0]];
            // push x,y,z vertex values of this coordinate
            vertexPositions.push(vertexList[parseInt(coord_1[0]) - 1][0]);
            vertexPositions.push(vertexList[parseInt(coord_1[0]) - 1][1]);
            vertexPositions.push(vertexList[parseInt(coord_1[0]) - 1][2]);
            // push x,y texture values of this coordinate
            vertexTextureCoords.push(textureList[parseInt(coord_1[1]) - 1][0]);
            vertexTextureCoords.push(textureList[parseInt(coord_1[1]) - 1][1]);
            // push x,y,z normal values of this coordinate
            vertexNormalCoords.push(normalsList[parseInt(coord_1[2]) - 1][0]);
            vertexNormalCoords.push(normalsList[parseInt(coord_1[2]) - 1][1]);
            vertexNormalCoords.push(normalsList[parseInt(coord_1[2]) - 1][2]);


            // vertex #2
            var coord_2 = [vals[2].split("/")[0], vals[2].split("/")[0], vals[2].split("/")[0]];
            // push x,y,z vertex values of this coordinate
            vertexPositions.push(vertexList[parseInt(coord_2[0]) - 1][0]);
            vertexPositions.push(vertexList[parseInt(coord_2[0]) - 1][1]);
            vertexPositions.push(vertexList[parseInt(coord_2[0]) - 1][2]);
            // push x,y texture values of this coordinate
            vertexTextureCoords.push(textureList[parseInt(coord_2[1]) - 1][0]);
            vertexTextureCoords.push(textureList[parseInt(coord_2[1]) - 1][1]);
            // push x,y,z normal values of this coordinate
            vertexNormalCoords.push(normalsList[parseInt(coord_2[2]) - 1][0]);
            vertexNormalCoords.push(normalsList[parseInt(coord_2[2]) - 1][1]);
            vertexNormalCoords.push(normalsList[parseInt(coord_2[2]) - 1][2]);

            // vertex #3
            var coord_3 = [vals[3].split("/")[0], vals[3].split("/")[0], vals[3].split("/")[0]];
            // push x,y,z vertex values of this coordinate
            vertexPositions.push(vertexList[parseInt(coord_3[0]) - 1][0]);
            vertexPositions.push(vertexList[parseInt(coord_3[0]) - 1][1]);
            vertexPositions.push(vertexList[parseInt(coord_3[0]) - 1][2]);
            // push x,y texture values of this coordinate
            vertexTextureCoords.push(textureList[parseInt(coord_3[1]) - 1][0]);
            vertexTextureCoords.push(textureList[parseInt(coord_3[1]) - 1][1]);
            // push x,y,z normal values of this coordinate
            vertexNormalCoords.push(normalsList[parseInt(coord_3[2]) - 1][0]);
            vertexNormalCoords.push(normalsList[parseInt(coord_3[2]) - 1][1]);
            vertexNormalCoords.push(normalsList[parseInt(coord_3[2]) - 1][2]);

            // add 3 to face vertex count
            faceVertexCount += 3;
        }

        // if usemtl (use material) line appears, load textures after
        //	the faces have been added on using vertex counts
        else if (vals[0] == "usemtl") {
            if (numTextures > 0) {
                obj.loadTextureFromURL(path + "/" + lastTexture,
                    faceVertexCount, curTextureOffset);
                curTextureOffset += faceVertexCount;
                faceVertexCount = 0;
            }
            lastTexture = vals[1];
            numTextures += 1;
        }
	}
	
	// add any remaining texture for the last set of faces (if any)
	if(numTextures > 0){
		obj.loadTextureFromURL(path + "/" + lastTexture,
			faceVertexCount, curTextureOffset);
		curTextureOffset += faceVertexCount;
		faceVertexCount = 0;
	}
	
	// add all vertices to the graphicsObject
	obj.initPositionBuffer(GL, vertexPositions);
	obj.initTextureBuffer(GL, vertexTextureCoords);
	obj.initNormalBuffer(GL, vertexNormalCoords);
	if(indexVertexCoords.length != 0) obj.initIndexBuffer(GL, indexVertexCoords);
	
	// push the object to the sceneObjects list
	sceneObjects.push(obj);
}