var GL;
var shaderProgram;

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

var lastTime = 0;

var loadedObjs = [];
var showWireFrames = false;

//user input
var keysPressed = [];
var mousePressed = false;
var lastMouseX = 0;
var lastMouseY = 0;

//camera
var viewRotateX = 0;
var viewRotateY = 0;
var viewRotateZ = 0;
var viewPosX = 0;
var viewPosY = 0;
var viewPosZ = 0;

//lighting
var directionalLights = [];
var ambientR = 1.0;
var ambientG = 1.0;
var ambientB = 1.0;
var backgroundR = 0.0;
var backgroundG = 0.0;
var backgroundB = 0.0;

var App;

function main() {
    App = new WorldExplorer();

    var canvas = document.getElementById("gl-canvas");
    initGL(canvas);
    loadShaders();
    App.prepareToLoadModels();
    dataLoader.loadModels();
}

function startApp() {
    //remove loading text
    document.getElementById("loadingText").innerHTML = "";

    App.initScene();
    App.initCamera();
    App.initLighting();

    GL.clearColor(backgroundR, backgroundG, backgroundB, 1.0);
    GL.enable(GL.DEPTH_TEST);

    //enable interaction with user
    document.onkeydown = keyDownFunc;
    document.onkeyup = keyUpFunc;
    document.getElementById("gl-canvas").onmousedown = mouseDownFunc;
    document.onmouseup = mouseUpFunc;
    document.onmousemove = mouseMoveFunc;
    frame();
}

function keyDownFunc(event) {
    keysPressed[event.keyCode] = true;
    if (event.keyCode == 32 ||	// SPACE
        event.keyCode == 38 ||	// UP
        event.keyCode == 40 ||	// DOWN
        event.keyCode == 37 ||	// LEFT
        event.keyCode == 39		// RIGHT
    ) event.preventDefault();

}

function keyUpFunc(event) {
    keysPressed[event.keyCode] = false;
}

function mouseDownFunc(event) {
    mousePressed = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}


// handle mouse release events: toggle mousePressed as false.
function mouseUpFunc(event) {
    mousePressed = false;
}

// handle mose movement events: only when pressed (dragging) - calculate
//	delta since last event and modify camera view angles accordingly
function mouseMoveFunc(event) {
    if (mousePressed) {
        var curX = event.clientX;
        var curY = event.clientY;

        var dX = curX - lastMouseX;
        var dY = curY - lastMouseY;
        lastMouseX = curX;
        lastMouseY = curY;

        viewRotateY += dX / 300;
        viewRotateX += dY / 300;
    }
}


// Attempt to initialize the global GL context.
//	RETURNS 0 on success, -1 if failed.
function initGL(canvas) {
    try {
        GL = canvas.getContext("experimental-webgl");
        GL.viewportWidth = canvas.width;
        GL.viewportHeight = canvas.height;
    } catch (e) {
        // catch handled below (if GL not created)
    }
    if (!GL) {
        return -1;
    }
    return 0;
}


// Attempt to load the shader programs (which must be declared in script
//	tags in the implementing HTML file).
// RETURNS 0 on success, -1 if loading shaders failed.
function loadShaders() {
    // get the shader scripts (using helper function, below)
    var fshader = getShader(GL, "shader-fs");
    var vshader = getShader(GL, "shader-vs");

    // create the shader program
    shaderProgram = GL.createProgram();
    GL.attachShader(shaderProgram, vshader);
    GL.attachShader(shaderProgram, fshader);
    GL.linkProgram(shaderProgram);

    // check for success, return -1 if loading shaders failed
    if (!GL.getProgramParameter(shaderProgram, GL.LINK_STATUS))
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
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript)
        return null;

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment")
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (shaderScript.type == "x-shader/x-vertex")
        shader = gl.createShader(gl.VERTEX_SHADER);
    else
        return null;

    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


// frame loop - this function is called each frame as long as the application
//	is running.
function frame() {
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
//	the WorldExplorer object.
function update() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        // update the WorldExplorer object
        App.update(elapsed);
        // update all scene objects
        for (var i = 0; i < loadedObjs.length; i++) {
            loadedObjs[i].update(elapsed);
        }
    }
    lastTime = timeNow;
}


// Sets up the OpenGL scene rendering mode, adjusts camera position,
//	and loops through each individual object of the scene and renders it.
//	Also applies lighting to the scene.
function renderScene() {
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
    for (var i = 0; i < directionalLights.length; i++) {
        directionalLights[i].render();
    }


    /*** DRAW SCENE OBJECTS ***/
    // draw all individual elements to the screen
    for (var i = 0; i < loadedObjs.length; i++) {
        loadedObjs[i].render(GL);
    }
}


function setMatrixUniforms() {
    GL.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    GL.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    GL.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0)
        throw "Invalid popMatrix!";
    mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


$(document).ready(main);