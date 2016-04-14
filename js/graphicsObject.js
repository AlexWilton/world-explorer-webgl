/* FILE: graphicsObject.js
 * Contains update functions and buffers to keep track of individual graphical
 *	objects within the scene. This object contains functions that allow
 *	self-rendering and keeping track of its position, buffers, rotations,
 *	and any additional data associated with this object.
 */

/*** GraphicsObject class: **/
function GraphicsObject() {

    // object vertex buffers
    this.positionVertexBuffer;
    this.textureVertexBuffer;
    this.colourVertexBuffer;
    this.normalVertexBuffer;
    this.indexVertexBuffer;
    this.indicesEnabled = false;

    // texture values for this object
    this.textures = [];

    // blending variables for this object
    this.blending = false;
    this.alpha = 1.0; // default to 1

    this.firstRun = true;

    // rotation variables (default to 0 - no rotation)
    this.rotX = 0.0;
    this.rotY = 0.0;
    this.rotZ = 0.0;

    // translation variables (default to 0 - default position)
    this.transX = 0.0;
    this.transY = 0.0;
    this.transZ = 0.0;

    // scale variables (default to 0 - default size)
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleZ = 1.0;

    // initialize the position vertex buffer on the given GL context with
    //	the given vertices. Position vertices should be given in tripplets;
    //	that is, as coordinates of the form (x, y, z).
    this.initPositionBuffer = function (gl, vertices) {
        this.positionVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.positionVertexBuffer.itemSize = 3;
        this.positionVertexBuffer.numItems = vertices.length / 3;
    }

    // initialize the texture coordinate buffer on the given GL context with
    //	the given vertices. Texture coordinates should be given in pairs (tuplets).
    this.initTextureBuffer = function (gl, textureCoords) {
        this.textureVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        this.textureVertexBuffer.itemSize = 2;
        this.textureVertexBuffer.numItems = textureCoords.length / 2;
        gl.uniform1i(shaderProgram.useTexture, true);
    }



    // initialize the normals coordinate buffer on the given GL context with
    //	the given vertices. Normal vertices should be given in pairs tripplets;
    //	that is, as coordinates of the form (x, y, z).
    this.initNormalBuffer = function (gl, normals) {
        this.normalVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        this.normalVertexBuffer.itemSize = 3;
        this.normalVertexBuffer.numItems = normals.length / 3;
    }

    // initialize the index buffer on the given GL context with
    //	the given vertices. If set, flags indicesEnabled as TRUE, and renders
    //	the object accordingly.
    this.initIndexBuffer = function (gl, indices) {
        this.indexVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVertexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indexVertexBuffer.itemSize = 1;
        this.indexVertexBuffer.numItems = indices.length;
        this.indicesEnabled = true;
    }

    this.loadTextureFromURL = function (url, size, offset) {
        var textureObj = new TextureObject();
        textureObj.loadTexture(url);
        textureObj.size = size;
        textureObj.offset = offset;
        this.textures.push(textureObj);
    }

    this.loadTextureFromVertexRgb = function (gl, vertexColours,size) {
        var textureObj = new TextureObject();
        textureObj.loadTextureFromVertexRgb(vertexColours);
        textureObj.size = size;
        this.textures.push(textureObj);
    }



    // scale ALL coordinates (preserving aspect ratio)
    this.scale = function (val) {
        this.scaleX = val;
        this.scaleY = val;
        this.scaleZ = val;
    }


    // OVERRIDE: update function - apply custom update function for each object
    //	as necessary. Use this function to matrix translations, rotations,
    //	scaling, alpha value, etc.
    this.update = function (elapsedTime) {
    }


    // renders the object to the screen, setting all of its transformation values,
    //	blending and textures, and finally drawing the vertex buffers to the screen.
    this.render = function (gl) {
        // push identity to the matrix stack (to apply changes only to this object)
        mvPushMatrix();

        // apply translations
        mat4.translate(mvMatrix, [this.transX, this.transY, this.transZ]);

        // apply scaling
        mat4.scale(mvMatrix, [this.scaleX, this.scaleY, this.scaleZ]);

        // apply rotations
        mat4.rotate(mvMatrix, this.rotX, [1, 0, 0]);
        mat4.rotate(mvMatrix, this.rotY, [0, 1, 0]);
        mat4.rotate(mvMatrix, this.rotZ, [0, 0, 1]);

        // load position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
            this.positionVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // load normals buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
            this.normalVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);


        if(this.textures.length > 0) {
            gl.uniform1i(shaderProgram.useTexture, true);
            // load texture buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVertexBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
                this.textureVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }else {
            gl.uniform1i(shaderProgram.useTexture, false);
            // load colour buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colourVertexBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                this.colourVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }
        // load and apply the texture
        //gl.activeTexture(gl.TEXTURE0);
        //for(var i=0; i<this.textures.length; i++){
        //gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        //gl.uniform1i(shaderProgram.samplerUniform, 0);
        //	this.textures[i].render(gl);
        //}

        // if blending is turned on, apply the blending and alpha value
        if (this.blending || this.firstRun) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
            gl.uniform1f(shaderProgram.alphaUniform, this.alpha);
        }
        // otherwise, disable blending mode and render normally
        else {
            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            gl.uniform1f(shaderProgram.alphaUniform, 1.0);
        }

        // render with indices IF indices are enabled
        if (this.indicesEnabled) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVertexBuffer);
            setMatrixUniforms();
            gl.drawElements(gl.TRIANGLES,
                this.indexVertexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
        // otherwise, render normally
        else {
            setMatrixUniforms();

            for (var i = 0; i < this.textures.length; i++) {
                this.textures[i].render(gl, this.textureVertexBuffer.numItems);
            }
            //gl.drawArrays(gl.TRIANGLES, 0, this.textureVertexBuffer.numItems);
        }

        // pop the matrix stack
        mvPopMatrix();

        // unflag first run after first frame rendering
        this.firstRun = false;
    }

}