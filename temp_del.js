	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam, edgeCam;  // we have two cameras in the main scene
	var avatar;
	var suzanne;
	var brs;   //big red sphere
	// here are some mesh objects ...

	var cone;
	var npc;

	var endScene, endCamera, endText;

	// Here is the main game control
  init(); //
	initControls();
	animate();  // start the animation loop!

	//To initialize the scene, we initialize each of its components
	function init(){
      initPhysijs();
			scene = initScene();
			createEndScene();
			initRenderer();
			createMainScene();
	}

	function createMainScene(){
      // setup lighting
			// create main camera
			// create the ground and the skybox
			// create the avatar
				// there was nothing here... :(

			initSuzanneJSON();
			initSuzanneOBJ();
	}


	//function initScene(){

var suzyOBJ;
var theObj;

	function initSuzanneOBJ(){
		var loader = new THREE.OBJLoader();
		loader.load("../models/suzyA.obj",
					function ( obj) {
						console.log("loading obj file");
						console.dir(obj);
						//scene.add(obj);
						obj.castShadow = true;
						suzyOBJ = obj;
						theOBJ = obj;
						// you have to look inside the suzyOBJ
						// which was imported and find the geometry and material
						// so that you can pull them out and use them to create
						// the Physics object ...
						var geometry = suzyOBJ.children[0].geometry;
						var material = suzyOBJ.children[0].material;
						suzyOBJ = new Physijs.BoxMesh(geometry,material);
						suzyOBJ.position.set(20,20,20);
						scene.add(suzyOBJ);
						console.log("just added suzyOBJ");
						//suzyOBJ = new Physijs.BoxMesh(obj);

						//
					},
					function(xhr){
						console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

					function(err){
						console.log("error in loading: "+err);}
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
						suzanne = new Physijs.BoxMesh( geometry, material );

						avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
						gameState.camera = avatarCam;

						avatarCam.position.set(0,6,-15);
						avatarCam.lookAt(0,4,10);
						suzanne.add(avatarCam);
						suzanne.position.set(-40,20,-40);
						suzanne.castShadow = true;
						scene.add( suzanne  );
						avatar=suzanne;
					},
					function(xhr){
						console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
					function(err){console.log("error in loading: "+err);}
				)
	}

	function updateSuzyOBJ(){
		var t = clock.getElapsedTime();
		suzyOBJ.material.emissive.r = Math.abs(Math.sin(t));
		suzyOBJ.material.color.b=0
	}

	function animate() {
		requestAnimationFrame( animate );
		switch(gameState.scene) {
			case "youwon":
			case "main":
				updateAvatar();
				updateNPC();
				updateSuzyOBJ();
				if (brs.position.y < 0){
					// when the big red sphere (brs) falls off the platform, end the game
					gameState.scene = 'youwon';
				}
        edgeCam.lookAt(avatar.position);
				avatarCam.rotation.set(0,controls.avatarCamAngle,0);
	    	scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				break;

			default:
			  console.log("don't know the scene "+gameState.scene);
		}

		//draw heads up display ..
	}
