/*
Final Game
This is a ThreeJS program which implements a simple game
The user collects 20 balls to win.

*/


	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var textMesh;
	var camera, avatarCam, edgeCam;  // we have three cameras in the main scene
	var avatar; var suzanne; var monkey;
	// here are some mesh objects ...

	var npc, npc2;
	var startBall = 20;
	var endScene, endCamera, endText;
	var loseScene, loseCamera, loseText;





	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, scene:'start', camera:'none' }


	// Here is the main game control
  init(); //
	initControls();
	animate();  // start the animation loop!




	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);

	}
	function createLoseScene(){
		loseScene = initScene();
		loseText = createSkyBox('youlose.png',6);
		//endText.rotateX(Math.PI);
		loseScene.add(loseText);
		var light2 = createPointLight();
		light2.position.set(0,200,20);
		loseScene.add(light2);
		loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		loseCamera.position.set(0,50,1);
		loseCamera.lookAt(0,0,0);

	}
	function createStartScene(){
		startScene = initScene();
		startText = createSkyBox('start.png',4);
		startScene.add(startText);
		var light3 = createPointLight();
		light3.position.set(0,200,20);
		startScene.add(light3);
		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 10000 );
		startCamera.position.set(0,50,1);
		startCamera.lookAt(0,0,0);
	}

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
      initPhysijs();
			scene = initScene();
			createEndScene();
			initTextMesh();
			createStartScene();
			createLoseScene();
			initRenderer();
			createMainScene();
	}


	function createMainScene(){

      // setup lighting
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);



			// create the ground and the skybox
			var ground = createGround('grass.png');
			scene.add(ground);
			var skybox = createSkyBox('sky.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

			initSuzanne();
			initSuzanneJSON();
			//avatar = createAvatar();
			//avatar.translateY(20);
			avatarCam.translateY(-4);
			avatarCam.translateZ(3);
			//scene.add(avatar);
			gameState.camera = avatarCam;

      edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
      edgeCam.position.set(20,20,10);


			addBalls();

			npc = createTorusKnot(0x0000ff,1,2,4);

			npc.position.set(30,10,-30);
			scene.add(npc);
      npc.addEventListener('collision',function(other_object){
      	if (other_object==avatar){
					gameState.health --;
					soundEffect('bad.wav');
					if (gameState.health == 0){
						gameState.scene='youlose';
						soundEffect('lose.wav');
					}
					this.__dirtyPosition = true;
      		this.position.set(randN(80)-50,5,randN(80)-50);
					}

      })
			npc2 = createTorusKnot(0xFF69B4,1,2,4);

			npc2.position.set(-30,10,30);
			scene.add(npc2);
			npc2.addEventListener('collision',function(other_object){
				if (other_object==avatar){
					gameState.health ++;
					soundEffect('good.wav');
					this.__dirtyPosition = true;
					this.position.set(randN(80)-50,5,randN(80)-50);
					}

			})

			//playGameMusic();

	}

	function randN(n){
		return Math.random()*n;
	}
	function initTextMesh(){
		var loader = new THREE.FontLoader();
		loader.load( '/fonts/helvetiker_regular.typeface.json',
								 createTextMesh);
		console.log("preparing to load the font");

	}
	function createTextMesh(font) {
		var textGeometry =
			new THREE.TextGeometry( 'Collect 20 Balls to win!',
					{
						font: font,
						size: 5,
						height: 0.2,
						curveSegments: 12,
						bevelEnabled: true,
						bevelThickness: 0.01,
						bevelSize: 0.08,
						bevelSegments: 5
					}
				);

		var textMaterial =
			new THREE.MeshLambertMaterial( { color: 0xaaaaff } );

		textMesh =
			new THREE.Mesh( textGeometry, textMaterial );

		// center the text mesh
		textMesh.translateX(-35);
		textMesh.translateY(10);

		scene.add(textMesh);

		console.log("added textMesh to scene");
	}

	function addBalls(){
		var numBalls = startBall;


		for(i=0;i<numBalls;i++){
			var ball = createBall();
			ball.position.set(randN(80)-50,30,randN(80)-50);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("ball "+i+" hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score==numBalls) {
							gameState.scene='youwon';
						}
            //scene.remove(ball);  // this isn't working ...
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){
		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

  function initPhysijs(){
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
  }
	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}

	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}

	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createTorusKnot(color) {
		var geometry = new THREE.TorusKnotGeometry(1.25, .375, 12.5, 2 );
		var material = new THREE.MeshLambertMaterial( { color: color} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.BoxMesh(geometry, pmaterial);
		mesh.castShadow = true;
		return mesh;
	}

	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}

	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical

	}

	function initSuzanne() {
		// Adds a Suzanne object exported as an 'obj' file from Blender.
		// Note- this is *heavily* adapted from the code from in class.
		var loader = new THREE.OBJLoader();
		loader.load("../models/suzanne_for_pa02.obj",
				function ( obj ) {
					console.log("loading suzanne.obj file");
					//console.dir( obj );
					//console.add( obj );
					//obj.castShadow = true;
					suzanne = obj;

					var geometry = suzanne.children[0].geometry;
					var material = suzanne.children[0].material;
					suzanne = new Physijs.BoxMesh(geometry, material);

					avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
					gameState.camera = avatarCam;

					avatarCam.position.set(0,6,-15);
					avatarCam.lookAt(0,4,10);
					suzanne.add(avatarCam);
					suzanne.position.set(-40,20,-40);
					suzanne.castShadow = true;
					scene.add( suzanne  );
					avatar=suzanne;

					console.log("suzanne has been added");
				},

				function(xhr) {
					console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
				},

				function(err) {
					console.log("error in loading: "+err);
				}
			)
	}
	function initSuzanneJSON(){
	//load the monkey avatar into the scene, and add a Physics mesh and camera
		var loader = new THREE.JSONLoader();
		loader.load("../models/suzanne.json",
			function ( geometry, materials ) {
				console.log("loading suzanne");
				var material = //materials[ 0 ];
				new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
				//geometry.scale.set(0.5,0.5,0.5);
				monkey = new Physijs.BoxMesh( geometry, material );

				monkey.position.set(0,4,0);
				monkey.castShadow = true;
				scene.add( monkey  );

				monkey.addEventListener('collision',function(other_object){
					if (other_object == avatar){
						gameState.scene='youlose';
						soundEffect('lose.wav');
					}
					this.__dirtyPosition = true;
				})
			},
			function(xhr){
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
			function(err){console.log("error in loading: "+err);}
		)
	}

	function createAvatar(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.BoxGeometry( 5, 5, 6);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;

		avatarCam.position.set(0,4,0);
		avatarCam.lookAt(0,4,10);
		mesh.add(avatarCam);


		return mesh;
	}

	function createBall(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}

	var clock;

	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		console.log("Keydown: '"+event.key+"'");
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'start' && event.key=='p')	{
			gameState.scene = 'main';
			return;
		}
		if (gameState.scene == 'youwon' && event.key=='r') {
			avatar.__dirtyRotation = true;
			avatar.rotation.set(0,0,0);
			avatar.__dirtyPosition = true;
			avatar.position.set(-40,20,-40);
			avatarCam.lookAt(0,4,10);
			npc.position.set(30,10,-30);
			npc2.position.set(-30,10,30);
			monkey.position.set(0,4,0);
			gameState.scene = 'main';
			startBall = gameState.score;
			addBalls();
			gameState.score = 0;
			gameState.health = 10;
			return;
		} else if (gameState.scene == 'youlose' && event.key=='r') {
			avatar.__dirtyRotation = true;
			avatar.rotation.set(0,0,0);
			avatar.__dirtyPosition = true;
			avatar.position.set(-40,20,-40);
			avatarCam.lookAt(0,4,10);
			npc.position.set(30,10,-30);
			npc2.position.set(-30,10,30);
			monkey.position.set(0,4,0);
			gameState.scene = 'main';
			startBall = gameState.score;
			addBalls();
			gameState.score = 0;
			gameState.health = 10;
			return;
		}

		// this is the regular scene
		switch (event.key){
			// change the way the avatar is moving
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "z": controls.up = true; break;
			case "x": controls.down = true; break;
			case "m": controls.speed = 30; break;
      case " ": controls.fly = true;
          console.log("space!!");
          break;
      case "r": controls.reset = true; break;


			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;
      case "3": gameState.camera = edgeCam; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1);break;
			case "ArrowRight": avatarCam.translateY(-1);break;
			case "ArrowUp": avatarCam.translateZ(-1);break;
			case "ArrowDown": avatarCam.translateZ(1);break;
			case "q": avatarCam.rotateY(0.5) = true; break;
			case "e": avatarCam.rotateY(-0.5) = true; break;
		}

	}

	function keyup(event){
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key){
			case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "z": controls.up    = false; break;
			case "x": controls.down  = false; break;
			case "m": controls.speed = 10; break;
      case " ": controls.fly = false; break;
      case "r": controls.reset = false; break;
		}
	}

	function updateNPC(){
		npc.lookAt(avatar.position);
		npc.__dirtyPosition = true;
		var distance = npc.position.distanceTo( avatar.position );
		if (distance <= 100){
		npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(8));
	}
}

  function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

		if (controls.reset){
			avatar.__dirtyRotation = true;
			avatar.rotation.set(0,0,0);
			avatar.__dirtyPosition = true;
			avatar.position.set(-40,20,-40);
			avatarCam.lookAt(0,4,10);
			npc.position.set(30,10,-30);
			npc2.position.set(-30,10,30);
			monkey.position.set(0,4,0);
			gameState.scene = 'main';
			startBall = gameState.score;
			addBalls();
			gameState.score = 0;
			gameState.health = 10;
		}

	}
	function updateMonkeyJSON(){
		var t = clock.getElapsedTime();
		monkey.lookAt(avatar.position);
		monkey.__dirtyPosition = true;
		var distance = monkey.position.distanceTo( avatar.position );
		if (distance <= 100){
			monkey.setLinearVelocity(monkey.getWorldDirection().multiplyScalar(4));
			monkey.material.emissive.r = Math.abs(Math.sin(t));
			monkey.material.color.b=0
		}
	}


	function animate() {

		requestAnimationFrame( animate );

		if (textMesh){
			textMesh.translateX(35);
			textMesh.rotateY(-0.01);
			textMesh.translateX(-35);
		}

		switch(gameState.scene) {

			case "youwon":
				//endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
				break;
			case "youlose":
				renderer.render( loseScene, loseCamera );
				break;
			case "start":
				renderer.render( startScene, startCamera );
				break;
			case "main":
				updateAvatar();
				updateNPC();
				updateMonkeyJSON();
        edgeCam.lookAt(avatar.position);
	    	scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				break;

			default:
			  console.log("don't know the scene "+gameState.scene);

		}

		//draw heads up display ..
	  var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: '
    + gameState.score
    + " Health: "+gameState.health
    + '</div>';

	}
