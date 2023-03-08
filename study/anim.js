// import * as THREE from '../three_js/build/three.module.js';
import * as THREE from 'three';
import { OrbitControls } from '../three_js/examples/jsm/controls/OrbitControls.js';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { VertexNormalsHelper } from '../three_js/examples/jsm/helpers/VertexNormalsHelper.js';
// import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

// import Stats from '../three_js/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from '../three_js/examples/jsm/loaders/GLTFLoader.js';

import Stats from '../three_js/examples/jsm/libs/stats.module.js';

class App {
    constructor() {
        const divContainer = document.querySelector("#webgl-container");
        this.divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        // renderer.shadowMap.type = THREE.PCFShadowMap;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap ;
        // renderer.shadowMap.type = THREE.VSMShadowMap;
        

        divContainer.appendChild(renderer.domElement);
        this.renderer = renderer;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x7f7f7f);
        this.scene = scene;

        this.SetupCamera();
        this.SetupLight();
        this.SetupModel();
        this.SetupControls();

        window.onresize = this.resize.bind(this);
        this.resize();

        this.tSet = 0;
        requestAnimationFrame(this.render.bind(this));
        // this.SetButtons();
    }

    SetupCamera() {
        const width = this.divContainer.clientWidth;
        const height = this.divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            75,
            width/height,
            0.1,
            2000
        );
        camera.position.z = 200;
        camera.position.set(0, 100, 500);
        this.camera = camera;
        this.scene.add(camera);
    }

    SetupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const color = 0xffffff;
        const intensity = 5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(100, 200, 100);
        this.scene.add(light);

        // const lightHelper = new THREE.DirectionalLightHelper(light, 10);
        // this.scene.add(lightHelper);

        light.castShadow = true;
        // light.shadow.mapSize.width  = 1024;
        // light.shadow.mapSize.height = 1024;
        light.shadow.mapSize.width  = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.top = light.shadow.camera.right     = 700;
        light.shadow.camera.bottom = light.shadow.camera.left   = -700;
        light.shadow.camera.near    = 100;
        light.shadow.camera.far     = 1000;
        light.shadow.radius         = 5;

        // const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
        // this.scene.add(shadowCameraHelper);
        
        // this.camera.add(light);
    }

    SetupModel() {
        const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
        const planeMaterial = new THREE.MeshPhongMaterial({color: 0x878787});
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI/2;
        this.scene.add(plane);
        plane.receiveShadow = true;

        new GLTFLoader().load("./study/data/anim_model/anim_model_tmp.glb", (gltf) => {
            const model = gltf.scene;
            this.scene.add(model);

            model.traverse(child => {
                if(child instanceof THREE.Mesh){
                    // console.log(child);
                    child.castShadow = true;
                }
            });
            this.SetupAnimation(gltf);

            const box = (new THREE.Box3).setFromObject(model);
            model.position.y = (box.max.y - box.min.y) / 2 + 30;
            // model.position.y =  - box.min.y;

            // const axisHelper = new THREE.AxesHelper(1000);
            // this.scene.add(axisHelper);

            // const boxHelper = new THREE.BoxHelper(model);
            // this.scene.add(boxHelper);
            // this.boxHelper = boxHelper;

            this.model = model;
        })
    }

    ChangeAnimation(animationName){
        const prevAnimationAction = this.currentAnimationAction;
        this.currentAnimationAction = this.animationsMap[animationName];
        if(prevAnimationAction !== this.currentAnimationAction){
            prevAnimationAction.fadeOut(0.5);
            this.currentAnimationAction.reset().fadeIn(0.5).play();
        }
    }
    SetupAnimation(gltf){
        const model = gltf.scene;
        const mixer = new THREE.AnimationMixer(model);
        const gltfAnimations = gltf.animations;

        const domControls = document.querySelector("#controls");
    //    console.log(domControls);
 
        const animationsMap = {};

        gltfAnimations.forEach(animationClip => {
            const name = animationClip.name;
            console.log(name);
            const domButton = document.createElement("div");
            domButton.classList.add("button");
            domButton.textContent = name;
            // domButton.innerText = name;
            domControls.appendChild(domButton);

            domButton.addEventListener("click", (event) =>{
                console.log(event);
                const animationName = domButton.textContent;
                this.ChangeAnimation(animationName);
            });
            const animationAction = mixer.clipAction(animationClip);
            animationsMap[name] = animationAction;
        });

        this.mixer = mixer;
        this.animationsMap = animationsMap;
        // this.currentAnimationAction = animationsMap["Idle"];
        this.currentAnimationAction = animationsMap["1"];
        this.currentAnimationAction.play();
    }

    SetButtons(){
        const domControls = document.querySelector("#controls");
        const domButton = document.createElement("div");
        domButton.classList.add("button");
        // domButton.textContent = 'name';
        domButton.textContent = "name";
        // domButton.value = "button";
        domControls.appendChild(domButton);
        // domButton.type = "submit";
        console.log(domButton.type);
    }
    SetupControls(){
        this.controls = new OrbitControls(this.camera, this.divContainer);
        // this.controls.enableDamping = true;

        const stats = new Stats();
        this.divContainer.appendChild(stats.dom);
        this.fps = stats;
    }
    resize() {
        const width = this.divContainer.clientWidth;
        const height = this.divContainer.clientHeight;
        this.camera.aspect = width/height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render(time) {
        this.renderer.render(this.scene, this.camera);
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        const tSec = time * 0.001;  //msec->sec
        const dTSec = tSec - this.tSec;

        if(this.mixer){
            // console.log(dTSec);
            this.mixer.update(dTSec);
        }
        this.tSec = tSec;
        // if(this.boxHelper){
        //     this.boxHelper.update();
        // }
        this.fps.update();
    }
}

window.onload = function() {
    new App();
}