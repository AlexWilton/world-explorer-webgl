

function WorldExplorer(){

	this.objRotationSpeed = 0;

    this.selectedModels = ["chess", "kitchen"];

	this.prepareToLoadModels = function(){
		//models with textures:
        //var objNames = ["chess", "kitchen", "tutorialroom", "banana", "cat", "gun"];
        this.selectedModels.forEach(function(name){
           dataLoader.addOBJmodel({"url":"models/"+name+"/Model.obj", "name": name});
        });
	};

	this.initScene = function(){
        loadedObjs.forEach(function(obj){
           switch(obj.name){
               case "chess":
                    var chess = obj;
                    chess.rotX = degToRad(180);
                    chess.rotY = degToRad(180);
                    chess.scale(10);
                    chess.transX = -2;
                    chess.transY = 4;
                    chess.transZ = -8;
                    chess.update = function(elapsedTime){
                        this.rotY += degToRad((App.objRotationSpeed * elapsedTime) / 1000.0);
                    }
                    break;
               case "kitchen":
                   var kitchen = obj;
                   //kitchen.addTexture(textures[1]);
                   kitchen.rotX = degToRad(180);
                   kitchen.transX = -2;
                   kitchen.transY = 4;
                   kitchen.transZ = -1;
                   break;
               case "tutorialRoom":
                    var tutorialRoom = obj;
                    tutorialRoom.rotX = degToRad(180);
                    tutorialRoom.transX = -15;
                    tutorialRoom.transY = 7;
                    tutorialRoom.transZ = -5;
                    break;
               case "banana":
                    var banana = obj;
                    banana.transX = 1;
                    banana.transY = 0;
                    banana.transZ = -11;
                    break;
               case "cat":
                    var cat = obj;
                    cat.transX = -5;
                    cat.transZ = -2;
                    break;
               case "gun":
                    var gun = obj;
                    gun.transY = 1;
                    gun.transZ = -10;
                   break;
               default:
                   console.log("no default placement settings for " + obj.name);
           }
        });
    };

	this.initCamera = function(){
        viewPosX = 0;
		viewPosY = -3;
		viewPosZ = -7;
        viewRotateX = 0;
        viewRotateY = 0;
	};

	this.initLighting = function(){
		// set up directional lights
		var dl1 = new DirectionalLight(0, -1.5, -1.0, 0.4, 0.4, 0.4);
		//var dl1 = new DirectionalLight(2, 1.0, -1.0, 0.8, 0.0, 0.0);
		directionalLights.push(dl1);
		//var dl2 = new DirectionalLight(-2, 1.0, -1.0, 0.0, 0.8, 0.0);
		//directionalLights.push(dl2);

		//var dl2 = new DirectionalLight(-0.25, -1.0, 1.0, 0.0, 1.0, 0.0);
		//directionalLights.push(dl2);

		//use ambient white light:
		ambientR = 0.6;
		ambientG = 0.6;
		ambientB = 0.6;

        //use white background
		backgroundR = 1;
		backgroundG = 1;
		backgroundB = 1;
	};

	this.handleInput = function(){
        // move forward (W or UP arrow keys)
        if (keysPressed[87] || keysPressed[38]) {
            viewPosZ += 0.1 * Math.cos(viewRotateY);
            viewPosX -= 0.1 * Math.sin(viewRotateY);
        }
        // move backwards (S or DOWN arrow keys)
        if (keysPressed[83] || keysPressed[40]) {
            viewPosZ -= 0.1 * Math.cos(viewRotateY);
            viewPosX += 0.1 * Math.sin(viewRotateY);
        }

        // rotate left (LEFT arrow key)
        if (keysPressed[37])
            viewRotateY -= 0.03;

        // rotate right (RIGHT arrow key)
        if (keysPressed[39])
            viewRotateY += 0.03;

        // move/strafe left (A or Q keys)
        if (keysPressed[65] || keysPressed[81]) {
            viewPosZ += 0.1 * Math.sin(viewRotateY);
            viewPosX += 0.1 * Math.cos(viewRotateY);
        }

        // move/strafe right (D or E keys)
        if (keysPressed[68] || keysPressed[69]) {
            viewPosZ -= 0.1 * Math.sin(viewRotateY);
            viewPosX -= 0.1 * Math.cos(viewRotateY);
        }

		// SPACE (up)
		if(keysPressed[32])
			viewPosY -= 0.1;

		// X (down)
		if(keysPressed[88]){
			viewPosY += 0.1;
		}

		// ESC (reset to start camera position)
		if(keysPressed[27]){
            App.initCamera();
		}
	};
    this.update = function(elapsedTime){};
}

$(document).ready(main);