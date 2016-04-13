/* FILE: application.js
 * Custom application definition.
 */


function Application(){
	
	this.monkeySpeed = 0;
	
	this.setupData = function(){
		// 3D models
		//dataLoader.addOBJmodel("demo/models/old/grass/grass.obj");

		//models with textures:
        var objNames = ["chess", "kitchen", "tutorialroom"];
        objNames.forEach(function(name){
           dataLoader.addOBJmodel("demo/models/"+name+"/Model.obj");
        });
        //
        ////models without textures:
        //var objNames = [ "computer", "fishtank"];
        //objNames.forEach(function(name){
        //    dataLoader.addOBJmodel("demo/models/"+name+"/Model.obj");
        //});

		// textures
		//dataLoader.addTexture("demo/textures/gaza.jpg");
        //dataLoader.addTexture("demo/models/chess/chess.jpg");
        //dataLoader.addTexture("demo/models/kitchen/kitchen.jpg");
	}
	
	this.initScene = function(){
		//// monkey
		//sceneObjects[0].addTexture(textures[0]);
		//sceneObjects[0].scale(0.5);
		//sceneObjects[0].transY = 2;
		//sceneObjects[0].transZ = -5;
		//sceneObjects[0].update = function(elapsedTime){
		//	this.rotY += degToRad((App.monkeySpeed * elapsedTime) / 1000.0);
		//}

        //chess
        var chess = sceneObjects[0];
        //chess.addTexture(textures[0]);
        chess.rotX += degToRad(180);
        chess.rotY += degToRad(180);
        chess.scale(10);
        chess.transX = -2;
        chess.transY = 3;
        chess.transZ = -8;

        //kitchen
        var kitchen = sceneObjects[1];
        kitchen.rotX += degToRad(180);
        kitchen.transX = -2;
        kitchen.transY = 3;
        kitchen.transZ = -1;

        //tutorial room
        var tutorialRoom = sceneObjects[2];
        tutorialRoom.rotX += degToRad(180);
        tutorialRoom.transX = -15;
        tutorialRoom.transY = 6;
        tutorialRoom.transZ = -5;



    }
	
	this.initCamera = function(){
		viewPosZ = -5;
		viewPosY = -1.5;
	}
	
	this.initLighting = function(){
		// set up directional lights
		//var dl1 = new DirectionalLight(0, -1.5, -1.0, 0.4, 0.4, 0.4);
		var dl1 = new DirectionalLight(2, 1.0, -1.0, 0.8, 0.0, 0.0);
		directionalLights.push(dl1);
		//var dl2 = new DirectionalLight(-2, 1.0, -1.0, 0.0, 0.8, 0.0);
		//directionalLights.push(dl2);
		
		//var dl2 = new DirectionalLight(-0.25, -1.0, 1.0, 0.0, 1.0, 0.0);
		//directionalLights.push(dl2);
		
		//use ambient white light:
		ambientR = 0.6;
		ambientG = 0.6;
		ambientB = 0.6;

        //use "BELIZE HOLE" dark blue converted from rgb(41,128,185)
		backgroundR = 41/256;
		backgroundG = 128/256;
		backgroundB = 185/256;
	}
	
	this.handleInput = function(){
		defaultInputHandler();
		
		// SPACE (up)
		if(keysPressed[32])
			viewPosY -= 0.05;
		
		// X (down) (limit to -0.25)
		if(keysPressed[88]){
			viewPosY += 0.05;
			if(viewPosY >= -1.5)
				viewPosY = -1.5;
		}
		
		// ESC (reset position to home)
		if(keysPressed[27]){
			viewPosX = 0;
			viewPosY = -1.5;
			viewPosZ = -5;
			viewRotateY = 0;
			viewRotateX = 0;
		}
		
		// 1 (spin monkey to the right)
		if(keysPressed[49]){
			this.monkeySpeed -= 2;
		}
		// 2 (spin monkey to the left)
		else if(keysPressed[50]){
			this.monkeySpeed += 2;
		}
		// otherwise, wind down the monkey
		else{
			if(Math.abs(this.monkeySpeed) <= 2)
				this.monkeySpeed = 0;
			else if(this.monkeySpeed < 0)
				this.monkeySpeed += 2;
			else if(this.monkeySpeed > 0)
				this.monkeySpeed -= 2;
		}
	}
	
	this.setTimeOfDay = function(id){
		if(id == "day"){
			ambientR = 0.2;
			ambientG = 0.2;
			ambientB = 0.2;
			backgroundR = 0.2;
			backgroundG = 0.7;
			backgroundB = 0.8;
			directionalLights[0].setRGB(0.3, 0.3, 0.3);
		}
		else if(id == "sunset"){
			ambientR = 0.4;
			ambientG = 0.1;
			ambientB = 0.2;
			backgroundR = 0.9;
			backgroundG = 0.3;
			backgroundB = 0.4;
			directionalLights[0].setRGB(0.3, 0.2, 0.1);
		}
		else if(id == "moon"){
			backgroundR = 0;
			backgroundG = 0;
			backgroundB = 0.1;
			ambientR = 0;
			ambientG = 0;
			ambientB = 0.1;
			directionalLights[0].setRGB(0.1, 0.1, 0.1);
		}
		else{ // pitch black
			backgroundR = 0;
			backgroundG = 0;
			backgroundB = 0.05;
			ambientR = 0.025;
			ambientG = 0.025;
			ambientB = 0.05;
			directionalLights[0].setRGB(0, 0, 0);
		}
		GL.clearColor(backgroundR, backgroundG, backgroundB, 1.0);
	}
}
Application.prototype = new ApplicationClass();