function TextureObject(){
	this.offset = 0;
	this.size = 0;
	this.texture;

	this.loadTexture = function(url){
		this.texture = GL.createTexture();
		this.texture.image = new Image();
		this.texture.image.onload = function(){ bindLoadedTexture(this.textureObject.texture);}
		this.texture.image.textureObject = this;
		this.texture.image.src = url;
	};

	this.render = function(gl, bufferSize){
		gl.bindTexture(gl.TEXTURE_2D, (showWireFrames) ? null : this.texture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);
		gl.drawArrays( (showWireFrames) ? gl.LINES : gl.TRIANGLES, this.offset, this.size);
	};
}

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

function isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
}