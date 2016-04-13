/* FILE: main.js
 * Contains the main function (called to start the GL application),
 *	all of the global variables needed for the application,
 *	as well as the basic initialize functions to start up the program.
 */



/*** GLOBAL VARIABLES ***/

// webGL context variable
var GL;

// 2D graphics context
var context2D;

// matricies and matrix stack
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

// OpenGL (GLSL) shader program
var shaderProgram;

// list of all textures used in the application
var textures = [];

// animation variables
var lastTime = 0;

// graphical objects list (displayed in the scene)
var sceneObjects = [];

// user input variables
var keysPressed = [];
var mousePressed = false;
var lastMouseX = 0;
var lastMouseY = 0;

// camera view variables
var viewRotateX = 0;
var viewRotateY = 0;
var viewRotateZ = 0;
var viewPosX = 0;
var viewPosY = 0;
var viewPosZ = 0;

// lighting variables
var directionalLights = [];
var ambientR = 0.0;
var ambientG = 0.0;
var ambientB = 0.0;
var backgroundR = 0.0;
var backgroundG = 0.0;
var backgroundB = 0.0;

// Application object contains all of the init functions as well as
//	all of the application-level upkeep as the main system updates them.
var App;



/*** main GL function - application starts here ***/
function main(){
	// create the main application
	try{
		App = new Application();
	} catch(e) {
		//alert("Application object not found in app/application.js");
		return 1;
	}
	
	// return value: keep track of error (0 = success)
	var retval = 0;
	
	// attempt to get the WebGL context (GL) from the canvas
	var canvas = document.getElementById("screen");
	retval = initGL(canvas);
	if (retval != 0){
		//alert("initGL failed - check Browser compatibility");
		return 2;
	}
	
	// attempt to load the shader scripts
	retval = loadShaders();
	if (retval != 0){
		//alert("loadShaders failed - a shaders were not initialized correctly");
		return 3;
	}
	
	// run setup and loader
	App.setupData();
	dataLoader.onload = function(){
		startApp();
	}
	// show loading text and load
	document.getElementById("loading_text").style.display = "block";
	dataLoader.loadAll();
	
	return 0;
}

// called after dataLoader handles loading all HTML requests:
//	this function finishes app initialization and starts the GL program
function startApp(){
	// hide loading text (loading now done)
	document.getElementById("loading_text").style.display = "none";
	
	// initialize the scene values
	App.initScene();
	App.initCamera();
	App.initLighting();
	
	// set background color to black, and enable 3D depth test
	GL.clearColor(backgroundR, backgroundG, backgroundB, 1.0);
	GL.enable(GL.DEPTH_TEST);
	
	// set up listeners for key events
	document.onkeydown = keyDownFunc;
	document.onkeyup = keyUpFunc;
	
	// set up listeners for mouse events
	document.getElementById("screen").onmousedown = mouseDownFunc;
	document.onmouseup = mouseUpFunc;
	document.onmousemove = mouseMoveFunc;
	
	// run the animation
	frame();
}


// handle key push down events: toggle that key in the array as TRUE
function keyDownFunc(event){
	keysPressed[event.keyCode] = true;
	
	if(	event.keyCode == 32 ||	// SPACE
		event.keyCode == 38 ||	// UP
		event.keyCode == 40 ||	// DOWN
		event.keyCode == 37 ||	// LEFT
		event.keyCode == 39		// RIGHT
			){
		event.preventDefault();
	}
}


// handle key release events: toggle that key in the array as FALSE
function keyUpFunc(event){
	keysPressed[event.keyCode] = false;
}

// handle mouse down events: set mousePressed as true, and register first
//	"last position" of mouse
function mouseDownFunc(event){
	mousePressed = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

// DEFAULT KEY INPUT handler (call from App class to use standard controls)
function defaultInputHandler(){
	// move forward (W or UP arrow keys)
	if(keysPressed[87] || keysPressed[38]){
		viewPosZ += 0.05 * Math.cos(viewRotateY);
		viewPosY += 0.05 * Math.sin(viewRotateX);
		viewPosX -= 0.05 * Math.sin(viewRotateY);
	}
	
	// move backwards (S or DOWN arrow keys)
	if(keysPressed[83] || keysPressed[40]){
		viewPosZ -= 0.05 * Math.cos(viewRotateY);
		viewPosY -= 0.05 * Math.sin(viewRotateX);
		viewPosX += 0.05 * Math.sin(viewRotateY);
	}
	
	// rotate left (LEFT arrow key)
	if(keysPressed[37])
		viewRotateY -= 0.02;
	
	// rotate right (RIGHT arrow key)
	if(keysPressed[39])
		viewRotateY += 0.02;
	
	// move/strafe left (A or Q keys)
	if(keysPressed[65] || keysPressed[81]){
		viewPosZ += 0.05 * Math.sin(viewRotateY);
		viewPosX += 0.05 * Math.cos(viewRotateY);
	}
	
	// move/strafe right (D or E keys)
	if(keysPressed[68] || keysPressed[69]){
		viewPosZ -= 0.05 * Math.sin(viewRotateY);
		viewPosX -= 0.05 * Math.cos(viewRotateY);
	}
}


// handle mouse release events: toggle mousePressed as false.
function mouseUpFunc(event){
	mousePressed = false;
}

// handle mose movement events: only when pressed (dragging) - calculate
//	delta since last event and modify camera view angles accordingly
function mouseMoveFunc(event){
	if(mousePressed){
		var curX = event.clientX;
		var curY = event.clientY;
		
		var dX = curX - lastMouseX;
		var dY = curY - lastMouseY;
		lastMouseX = curX;
		lastMouseY = curY;
		
		viewRotateY += dX/300;
		viewRotateX += dY/300;
	}
}


// Attempt to initialize the global GL context.
//	RETURNS 0 on success, -1 if failed.
function initGL(canvas){
	try{
		GL = canvas.getContext("experimental-webgl");
		GL.viewportWidth = canvas.width;
		GL.viewportHeight = canvas.height;
	} catch(e) {
		// catch handled below (if GL not created)
	}
	if(!GL){
		return -1;
	}
	return 0;
}


// Attempt to load the shader programs (which must be declared in script
//	tags in the implementing HTML file).
// RETURNS 0 on success, -1 if loading shaders failed.
function loadShaders(){
	// get the shader scripts (using helper function, below)
	var fshader = getShader(GL, "shader-fs");
	var vshader = getShader(GL, "shader-vs");
	
	// create the shader program
	shaderProgram = GL.createProgram();
	GL.attachShader(shaderProgram, vshader);
	GL.attachShader(shaderProgram, fshader);
	GL.linkProgram(shaderProgram);
	
	// check for success, return -1 if loading shaders failed
	if(!GL.getProgramParameter(shaderProgram, GL.LINK_STATUS))
		return -1;
	
	// setup the shaders
	GL.useProgram(shaderProgram);
	
	shaderProgram.vertexPositionAttribute = GL.getAttribLocation(shaderProgram, "aVertexPosition");
	GL.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	shaderProgram.vertexNormalAttribute = GL.getAttribLocation(shaderProgram, "aVertexNormal");
	GL.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	
	shaderProgram.textureCoordAttribute = GL.getAttribLocation(shaderProgram, "aTextureCoord");
	GL.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	
	shaderProgram.pMatrixUniform = GL.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = GL.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = GL.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = GL.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.useLightingUniform = GL.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.ambientColorUniform = GL.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.lightingDirectionUniform = GL.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform = GL.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.alphaUniform = GL.getUniformLocation(shaderProgram, "uAlpha");
	
	return 0;
}


// Attempt to retreive the shader by the given element ID (id) and compile it under
//	the given WebGL context (gl).
function getShader(gl, id){
	var shaderScript = document.getElementById(id);
	if(!shaderScript)
		return null;
		
	var str = "";
	var k = shaderScript.firstChild;
	while(k){
		if(k.nodeType == 3)
			str += k.textContent;
		k = k.nextSibling;
	}
	
	var shader;
	if(shaderScript.type == "x-shader/x-fragment")
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	else if(shaderScript.type == "x-shader/x-vertex")
		shader = gl.createShader(gl.VERTEX_SHADER);
	else
		return null;
	
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}


// frame loop - this function is called each frame as long as the application
//	is running.
function frame(){
	// set timer for next frame
	requestAnimFrame(frame);
	
	// analyze current input values (e.g. keyboard buttons pressed)
	//	and modify the world variables accordingly
	App.handleInput();
	
	// update world data
	update();
	
	// render scene with OpenGL
	renderScene();
}


// Loops through each scene object and calls its update function. Also updates
//	the Application object.
function update(){
	var timeNow = new Date().getTime();
	if(lastTime != 0){
		var elapsed = timeNow - lastTime;
		// update the Application object
		App.update(elapsed);
		// update all scene objects
		for(var i=0; i<sceneObjects.length; i++){
			sceneObjects[i].update(elapsed);
		}
	}
	lastTime = timeNow;
}


// Sets up the OpenGL scene rendering mode, adjusts camera position,
//	and loops through each individual object of the scene and renders it.
//	Also applies lighting to the scene.
function renderScene(){
	// set up general GL values
	GL.viewport(0, 0, GL.viewportWidth, GL.viewportHeight);
	GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	mat4.perspective(45, GL.viewportWidth / GL.viewportHeight, 0.1, 100.0, pMatrix);
	// perspective();
	
	// set identity matrix
	mat4.identity(mvMatrix);
	// loadIdentity();
	
	
	/*** CAMERA ***/
	// adjust camera values accordingly
	// rotations:
	mat4.rotate(mvMatrix, viewRotateX, [1, 0, 0]);
	mat4.rotate(mvMatrix, viewRotateY, [0, 1, 0]);
	mat4.rotate(mvMatrix, viewRotateZ, [0, 0, 1]);
	// translations:
	mat4.translate(mvMatrix, [viewPosX, viewPosY, viewPosZ]);
	
	
	/*** LIGHTING ***/
	// TODO - necessary? OR MOVE IT! toggle lighting enabled
	GL.uniform1i(shaderProgram.useLightingUniform, true);

	// ambient lighting
	GL.uniform3f(shaderProgram.ambientColorUniform,
		ambientR, ambientG, ambientB);
	
	// directional lighting
	for(var i=0; i<directionalLights.length; i++){
		directionalLights[i].render();
	}
	
	
	/*** DRAW SCENE OBJECTS ***/
	// draw all individual elements to the screen
	for(var i=0; i<sceneObjects.length; i++){
		sceneObjects[i].render(GL);
	}
}

	
function setMatrixUniforms(){
	GL.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	GL.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	GL.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function mvPushMatrix(){
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix(){
	if(mvMatrixStack.length == 0)
		throw "Invalid popMatrix!";
	mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees){
	return degrees * Math.PI / 180;
}