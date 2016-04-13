/* FILE: appClass.js
 * This is the template (prototype) for the Application object
 *	to be constructed by the user for each specific application.
 *	Application objects MUST contain these functions.
 * It also serves as documentation of how to create an application.
 *
 *
 ***************************************************************
 *	USAGE:
 ***************************************************************
 *
 *	function Application(){
 *		// your own application code here
 *	}
 *	Application.prototype = new ApplicationClass();
 *
 ***************************************************************
 */


// all functions are meant to be overridden
function ApplicationClass(){
	
	/* This is the first setup function called.
	 * Use this function to fill the DataLoader object
	 *	- dataLoader global variable - with all necessary
	 *	data for your application needed at startup.
	 * Request loading Textures, Models, Sounds, etc. here.
	 */
	this.selectModels = function(){}
	
	
	/* This is the second setup function called (after all data is loaded).
	 * Use this function to customize any of the objects loaded
	 *	by the DataLoader (e.g. scale models, position them) here.
	 *	If object models do not provide their own texture URLs,
	 *	manual texture linking must be done here. Also, set up any extra
	 *	app variables here.
	 * All scene objects will be saved in the "sceneObjects" global array.
	 * All textures will be saved in the "textures" global array.
	 */
	this.initScene = function(){}
	
	
	/* This is the third setup function called.
	 * Use this function to setup the camera of your scene.
	 *	Available camera values are:	 
	 *		float viewRotateX
	 *		float viewRotateY
	 *		float viewRotateZ
	 *		float viewPosX
	 *		float viewPosY
	 *		float viewPosZ
	 */
	this.initCamera = function(){}
	
	
	/* This is the fourth setup function called.
	 * Use this function to setup the lighting of your scene.
	 *	Available lighting variables are:
	 *		array directionalLights (currently, only one is supported);
	 *			Example:
	 *				var myLight = new DirectionalLight(xPos, yPos, zPos, r, g, b);
	 *				directionalLights.push(myLight)
	 *		float ambientR (range 0.0 to 1.0)
	 *		float ambientG (range 0.0 to 1.0)
	 *		float ambientB (range 0.0 to 1.0)
	 */
	this.initLighting = function(){}
	
	
	/* This function is called every frame once setup is complete.
	 * Use this function to update your application values.
	 *	NOTE: updates for all scene objects are ALREADY CALLED,
	 *	so do not call them again here.
	 * Use elapsedTime to scale update values. elapsedTime is the
	 *	number of miliseconds since last update call.
	 */
	this.update = function(elapsedTime){}
	
	
	/* This function is also called every frame once setup is complete.
	 * Use this function to check keyboard input.
	 * The keysPressed array will be toggled TRUE at the index related to
	 *	the code value of whichever ASCII key(s) is currently pushed down.
	 * This function is called BEFORE update each frame.
	 */
	this.handleInput = function(){}
}