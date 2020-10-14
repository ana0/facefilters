const THREE = require("three");
const { loadModel, predictionLoop } = require("./detectFaces.js");

var camera, scene, renderer, video;

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function init() {

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.z = 7;

  scene = new THREE.Scene();

  video = document.getElementById( 'video' );

  var texture = new THREE.VideoTexture( video );

  var geometry = new THREE.PlaneBufferGeometry( 16, 9 );
  geometry.scale( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { map: texture } );


    var mesh = new THREE.Mesh( geometry, material );
    mesh.position = new THREE.Vector3( 5, 6, 7 );
    // mesh.lookAt( camera.position );
    scene.add( mesh );

  loadModel();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  //

  if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {

    var constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };

    navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {

      // apply the stream to the video element used in the texture

      video.srcObject = stream;
      video.play();
      predictionLoop(video);

    } ).catch( function ( error ) {

      console.error( 'Unable to access the camera/webcam.', error );

    } );

  } else {

    console.error( 'MediaDevices interface not available.' );

  }

}

function animate() {

  requestAnimationFrame( animate );
  renderer.render( scene, camera );

}

module.exports = { init, animate };