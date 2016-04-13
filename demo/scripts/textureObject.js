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
		this.texture.image.onload = function(){
			dataLoader.bindLoadedTexture(this.textureObject.texture);
		}
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