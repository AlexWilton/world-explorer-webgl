/* FILE: textureObject.js
 * ...
 */

var xyzw = 0;
/*** TextureObject class: **/
function TextureObject(){
	this.offset = 0;
	this.size = 0;
	this.texture;
	
	// other render properties here
	
	// set and load the texture ;)
	this.loadTexture = function(url){
		this.texture = GL.createTexture();
		this.texture.image = new Image();
		this.texture.image.onload = function(){ bindLoadedTexture(this.textureObject.texture);}
		this.texture.image.textureObject = this;
		this.texture.image.src = url;
	}
	
	this.setTexture = function(texture){
		this.texture = texture;
	}
	
	this.render = function(gl, bufferSize){
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);
		// ( <mode>, <start index>, <count (of current rendering)> )
		gl.drawArrays(gl.TRIANGLES, this.offset, this.size);
	}
}

// After texture is loaded from img file, bind the texture to GL
//	so that it will be usable. This function also contains GL
//	texture properties.
function bindLoadedTexture(texture) {
	GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);

	GL.bindTexture(GL.TEXTURE_2D, texture);
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, texture.image);

    if (isPowerOfTwo(texture.image.width) && isPowerOfTwo(texture.image.height)) {
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    } else {
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    }
	//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	//GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
	//GL.generateMipmap(GL.TEXTURE_2D);

	GL.bindTexture(GL.TEXTURE_2D, null);
}

function createTextureFromImage(image) {
    var texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, texture);
    if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
        // Scale up the texture to the next highest power of two dimensions.
        var canvas = document.createElement("canvas");
        canvas.width = nextHighestPowerOfTwo(image.width);
        canvas.height = nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        image = canvas;
    }
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);
    GL.bindTexture(GL.TEXTURE_2D, null);
    return texture;
}

function isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
}

function nextHighestPowerOfTwo(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}