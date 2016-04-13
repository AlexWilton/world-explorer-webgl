/* FILE: lights.js
 * Contains ...
 */


function DirectionalLight(xPos, yPos, zPos, r, g, b){

	/* xPos -	positive moves light to the left,
	 *			negative moves light to the right (0 = center).
	 * yPos -	positive moves light down,
	 *			negative movies light up (0 = center).
	 */
	this.xPos = xPos;
	this.yPos = yPos;
	this.zPos = zPos;
	this.red = r;
	this.green = g;
	this.blue = b;
	
	this.setDirection = function(xPos, yPos, zPos){
		this.xPos = xPos;
		this.yPos = yPos;
		this.zPos = zPos;
	}
	
	this.setRGB = function(r, g, b){
		this.red = r;
		this.green = g;
		this.blue = b;
	}
	
	this.render = function(){
		/* NOTE: this portion was tweeked:
		 *	vector/matrix objects provided by glMatrix.js
		 *	vec4 is not defined (not fully, at least)
		 *	- quat4.normalize is identical to a vec4 normalize function
		 *	- vec3.scale is the same as vec4.scale but leaves out index 3 (ignored anyway)
		 */
		var lightDir = vec4.create([this.xPos, this.yPos, this.zPos, 0]);
		mat4.multiplyVec4(mvMatrix, lightDir); // multiplty into lightDir
		// hack for "var adjustedLD4 = vec4.normalize(lightDir);"
		var adjustedLD4 = quat4.normalize(lightDir);
		// hack for "vec4.scale(adjustedLD4, -1);"
		vec3.scale(adjustedLD4, -1);
		GL.uniform3f(shaderProgram.lightingDirectionUniform,
			adjustedLD4[0], adjustedLD4[1], adjustedLD4[2]);
		GL.uniform3f(shaderProgram.directionalColorUniform,
			this.red, this.green, this.blue);
		
		// OLD CODE: does not adjust for camera rotations
		/*
		var adjustedLD = vec3.create();
		vec3.normalize([this.xPos, this.yPos, this.zPos], adjustedLD);
		vec3.scale(adjustedLD, -1);
		GL.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
		GL.uniform3f(shaderProgram.directionalColorUniform,
			this.red, this.green, this.blue);
		*/
	}
}