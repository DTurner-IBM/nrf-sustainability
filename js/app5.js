import * as THREE from "./lib/three.module.js";
//import { OrbitControls } from './lib/jsm/OrbitControls.js';

import {EffectComposer} from './lib/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './lib/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from './lib/jsm/postprocessing/ShaderPass.js';
import { AbberationShader2} from "./shader/AbberationShader2.js";
import { UnrealBloomPassAlpha} from "./shader/UnrealBloomPassAlpha.js";
import { DefaultShader } from "./shader/DefaultShader.js";
import { TintShader } from "./shader/TintShader.js";



const threescene = () => {
  const scene = new THREE.Scene();
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(70, aspect, 0.001, 1000);
  const renderer = new THREE.WebGLRenderer( { alpha: true });
  var clock = new THREE.Clock();
  var vertices =[];
  var origins=[];
  var spheres = [];
  var fade = null;
  var ribbon,helper,nodecolor, nodepercent,intersects,intersection, intersected,nodepass,mesh,composer,renderScene,AbberationShader,tintPass,bloomPass,bloomPass2,material,geometry,geometry2= null;
  var time = 0;
  var progress=0;
  var thisDiv = null;
  var toggle=0;
  var spheresIndex = 0;
  var doRender3D = false;
  var pointer3D = new THREE.Vector2();
  var particleSize = 50;
  var isRetina = window.devicePixelRatio;
  var maxWidth = 3200;
  var minWidth = 300;
  var settingsRetina = {
    progress: 0,
    bloomThreshold:0.00001, //0.3
    bloomStrength:9.4, //4.1
    bloomRadius:1.1, //0.54
    tintColor:'#161616',
    tintIntensity:0,
    particleSize:9,
  };
  var settings = {
    progress: 0,
    bloomThreshold:0.1, //0.3
    bloomStrength:4.0, //4.1
    bloomRadius:.5, //0.54
    tintColor:'#161616',
    tintIntensity:0,
    particleSize:1,
  };
  if(isRetina > 1 && window.innerWidth > 450){
    if (navigator.userAgent.indexOf('Mac OS X') != -1) {
      particleSize = settingsRetina.particleSize;
      console.log("Mac")
    } else {
      isRetina = 1;
      particleSize = settings.particleSize;
      console.log("PC")
    }
    particleSize = settingsRetina.particleSize;
    console.log("retina display desktop")
  }else if(isRetina > 1){
      particleSize = 7; //custom for smaller iphones
      console.log("retina display mobile")
  }else{
    particleSize = settings.particleSize;
    console.log("desktop display")
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  }

  function setup(){


    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x111111, 0);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    //const controls = new OrbitControls(camera, renderer.domElement);
    //controls.update();
    camera.position.set(-1.7, 1, 2);
    thisDiv = document.createElement("div");
    thisDiv.id= 'container';
    document.body.appendChild(thisDiv);
    thisDiv.appendChild( renderer.domElement );
    window.addEventListener("resize", resize);
  }


  function initpost(){

    composer = new EffectComposer(renderer);
    renderScene = new RenderPass(scene,camera);
    AbberationShader = new ShaderPass(AbberationShader2);
    tintPass = new ShaderPass(TintShader);
    bloomPass = new UnrealBloomPassAlpha(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.9, 0.9,0.85);
    tintPass.uniforms['color'].value = new THREE.Color( 0x111111);
    //tintPass.uniforms['opacity'].value =0.3;
    tintPass.uniforms['opacity'].value =0.5;
    composer.addPass(renderScene);
    composer.addPass(AbberationShader);
    composer.addPass(bloomPass);
    composer.addPass(tintPass);
  }

  function addEvents(){

  window.addEventListener("particlePosition", function(e) {
    if(e.detail){
      if(e.detail === 1){
        camera.position.set(0, 0.5, 2);
      }else if (e.detail === 2){
        camera.position.set(-1.7, 1, 2);
      }else if(e.detail=== 3){
        camera.position.set(3,1,2);
      }else if(e.detail=== 4){
        camera.position.set(-1.7, 1, 2);
      }
    }else{
      camera.position.set(-1.7, 1, 2);
    }
    resize();
  });
  
  window.addEventListener("particleOpacity", function(e) {
    let thisPercent = 35;
    if(e.detail === 0){
      thisPercent=0;
      if(thisDiv){
        doRender3D=false;
        thisDiv.style.visibility = "hidden";
      }
    }else{
      if(thisDiv){
        doRender3D=true;
        thisDiv.style.visibility = "visible";
      }
    }
    
    if(isNaN(e.detail)){thisPercent = 35}
    if(Number(e.detail)>100){thisPercent =100}else{thisPercent = Number(e.detail)}
    if(Number(e.detail)< 0){thisPercent = 0}else{thisPercent = Number(e.detail)}
    let adjustedPercent = (100 - Number(thisPercent))/100;
    if(isRetina > 1){
      //tintPass.uniforms['opacity'].value =adjustedPercent;
      tintPass.uniforms['opacity'].value =adjustedPercent;
    }else{
      tintPass.uniforms['opacity'].value =adjustedPercent;
      //tintPass.uniforms['opacity'].value =adjustedPercent/2;
    }

  });
  
  }
  function addObjects(){


    // Tests for interaction
    const sphereGeometry = new THREE.SphereGeometry( 0.01, 32, 32 );
		const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    for ( let i = 0; i < 40; i ++ ) {
      const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
      //scene.add( sphere );
      //spheres.push( sphere );
    }

    //Material Shader

    //console.log("isRetina:",isRetina )
   // console.log("particleSize:",particleSize );
    //setTimeout(()=>{
    //  particleSize = 1;
    //  console.log("setting particle size");
    //  material.uniforms.particleSize = 1;
   // }, 5000)
    //var particlePerc = window.innerWidth / maxWidth;
    ///console.log("particleWidth:",particlePerc);
    //var aspectParticle = window.innerWidth / window.innerHeight;
   // var totalPix = window.innerWidth * window.innerHeight;
   // console.log("aspect:",aspectParticle)
    //console.log("total px:",totalPix)
    //particleSize = (settingsRetina.particleSize / 100000) * totalPix;
    //particleSize = settingsRetina.particleSize * aspectParticle * particlePerc;
   //particleSize = settingsRetina.particleSize * particlePerc * window.devicePixelRatio;
   console.log("particle size is:", particleSize)
    material = new THREE.ShaderMaterial({
      extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
      side: THREE.DoubleSide,
      uniforms: {
        time: {value: 0 },
        progress:{value:0},
        particleSize:{value:particleSize},
        uColor1:{value:new THREE.Color(0x002DFF)},
        uColor2:{value:new THREE.Color(0x202861)}, //293583
        uColor3:{value:new THREE.Color(0x2400FF)},
        resolution: {value: new THREE.Vector4() },
      },
      transparent: true,
      vertexShader: DefaultShader.vertexShader,
      fragmentShader: DefaultShader.fragmentShader,
      depthTest:false,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    });

    //Primary Geometry
    geometry = new THREE.BufferGeometry();
    var geometryNumber = 90000; //Must be divisible by 3
    let positions= new Float32Array(geometryNumber);
    let randoms= new Float32Array(geometryNumber/3);
    let colorRandoms = new Float32Array(geometryNumber/3);
    let animationOffset = new Float32Array(geometryNumber/3);

    let row = 100;
    for(let t=0;t<geometryNumber/3;t++){
      randoms.set([Math.random()],t);
      colorRandoms.set([Math.random()],t);
      animationOffset.set([Math.random()],t);

      let theta = 0.0025 * Math.PI *2* (Math.floor(t/row)); //controls height rate of spiral
      let radius = 0.03 * ((t%row)-(row/2)); // radius of spiral
      let x = radius * Math.cos(theta);
      let y = 0.02 * (Math.floor(t/row)) -2;
      let z = radius * Math.sin(theta);

      positions.set([x,y,z],t*3);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('offset', new THREE.BufferAttribute(animationOffset, 1));
    geometry.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1));
    geometry.computeVertexNormals();
    ribbon = new THREE.Points(geometry, material);
    ribbon.position.y = -1;
    scene.add(ribbon);

    //Secondary Geometry Particles

    geometry2 = new THREE.BufferGeometry();
    vertices = [];
    for(var c =0;c<2000;c++){
      let theta = Math.random() * 2 * Math.PI;
      let phi = Math.acos(2 * Math.random() - 1);
      let r = Math.pow(Math.random(), 1 / 3);
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);
      vertices.push(x, y,z);
    }

    geometry2.setAttribute('randoms', new THREE.BufferAttribute(randoms, 1));
    geometry2.setAttribute('colorRandoms', new THREE.BufferAttribute(colorRandoms, 1));
    geometry2.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    mesh = new THREE.Points(geometry2, material);
    mesh.scale.set(3, 3, 3);
    mesh.position.y = -3;
    scene.add(mesh);
    
  }


  var frameCount = 0;

  function render() {
    if(doRender3D){
      time += -0.05/10;
      progress = 1;
      toggle += clock.getDelta();
      if(ribbon){
        ribbon.rotation.y = time/45;
      }
      if(mesh){
        
        mesh.rotation.y = time/45;
      }
      if(isRetina > 1){
        bloomPass.threshold=settingsRetina.bloomThreshold;
        bloomPass.strength = settingsRetina.bloomStrength;
        bloomPass.radius = settingsRetina.bloomRadius;
      }else{
        bloomPass.threshold=settings.bloomThreshold;
        bloomPass.strength = settings.bloomStrength;
        bloomPass.radius = settings.bloomRadius;
      }

      material.uniforms.time.value = time;
      material.uniforms.progress.value = progress;
      requestAnimationFrame(render);
      if (frameCount > 10) {
        composer.render();
        frameCount = 0;
      }
      frameCount++;
    }else{
      requestAnimationFrame(render);
    }
  }


  resize();
  setup();
  addEvents();
  initpost();
  addObjects();
  render();
};

threescene();
