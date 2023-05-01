import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const _VS = `
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform mat4 bindMatrix;
    uniform mat4 bindMatrixInverse;
    uniform mat4 boneMatrices[46];
    void main() {
        mat4 skinMatrix = mat4(0.0);
        skinMatrix += boneMatrices[int(skinIndex.x)] * skinWeight.x;
        skinMatrix += boneMatrices[int(skinIndex.y)] * skinWeight.y;
        skinMatrix += boneMatrices[int(skinIndex.z)] * skinWeight.z;
        skinMatrix += boneMatrices[int(skinIndex.w)] * skinWeight.w;
        vec4 skinVertex = bindMatrix * vec4(position, 1.0);
        skinVertex = skinMatrix * skinVertex;
        vUv = uv;
        vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * skinVertex;
    }
`;

const _FS = `
// Define material properties
uniform vec3 uColor;
uniform float uShininess;
uniform float uReflectivity;

// Define lighting parameters
uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform vec3 uLightDirection;
varying vec3 vNormal;

void main() {
  
    vec3 color = uColor;
    vec3 light = normalize(uLightDirection);
    float diffuse = max(dot(vNormal, light), 0.0);
    vec3 ambient = uAmbientColor * color;
    vec3 specular = uSpecularColor * pow(
        max(
            dot(
                reflect(-light, vNormal), normalize(-vNormal)
            ), 0.0
        ), uShininess);
  
    // Combine lighting and material properties
    vec3 finalColor = mix(ambient + color * diffuse, specular, uReflectivity);
    gl_FragColor = vec4(finalColor, 1.0);
}
  
`;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enablePan = true;
controls.enableKeys = true;
controls.enableRotate = true;
controls.update();

const PI = 3.141592653589793238462643383279502884197169399;

var root, frog, armature, eyes, spine0, spine1, head, material;
const loader = new GLTFLoader();
loader.load('model.gltf', function (gltf) {

    gltf.scene.rotation.set(0, 0, PI);
    armature = gltf.scene.children[0];
    eyes = armature.children[0];
    frog = armature.children[1];
    root = armature.children[2];
    spine0 = root.children[0];
    spine1 = spine0.children[0];
    head = spine1.children[1];

    initials([root, spine0, spine1, head, eyes, frog]);
    material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(0x79ab67) },
            uShininess: { value: 0.5 },
            uReflectivity: { value: 0.3 },
            uAmbientColor: { value: new THREE.Color(0x9ac78a) },
            uSpecularColor: { value: new THREE.Color(0xfafafa) },
            uLightDirection: { value: new THREE.Vector3(0, -1, 0) },
            boneMatrices: { value: new Array(frog.skeleton.bones.length) }
        },

        vertexShader: _VS,
        fragmentShader: _FS
    });
    material.skinning = true;
    let x = [];
    for (let i = 0; i < 46; i++) {
        const m = new THREE.Matrix4();
        for (let j = i * 16; j < i * 16 + 16; j++) {
            m.elements[j % 16] = frog.skeleton.boneMatrices[j];
        }
        x.push(m);
    }
    material.uniforms.boneMatrices.value = x;
    frog.material = material;
    frog.rotation.set(0, 0, PI);

    const eyeMaterial = material.clone();
    eyeMaterial.uniforms.uColor.value = new THREE.Color(0xb7b7b7);
    eyeMaterial.uniforms.uAmbientColor.value = new THREE.Color(0xb7b7b7);
    eyeMaterial.uniforms.uSpecularColor.value = new THREE.Color(0xffffff);
    eyeMaterial.uniforms.uShininess.value = 0.8;
    eyeMaterial.uniforms.uReflectivity.value = 0.5;
    eyes.material = eyeMaterial;
    eyes.rotation.set(0, 0, PI);
    scene.add(gltf.scene);
    // frog.add(frog.skeleton.bones[0]);
    // frog.bind(frog.skeleton); // 
    // scene.add(frog);
    // scene.add(eyes);

}, undefined, function (error) {
    console.error(error);
});
// scene.add(cube);

//add light
// const light = new THREE.AmbientLight(0xFFFFFF); // soft white light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// const light2 = new THREE.PointLight(0xffffff, 1, 100);
// light2.position.set(2, 10, 2);
// scene.add(light2);
// scene.add(light);
scene.add(directionalLight);
// scene.add(cube);

camera.position.z = 10;
// camera.position.x = 1;
// camera.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), PI / 8);

var counter = 1;
function animate() {
    counter += 0.4;
    requestAnimationFrame(animate);
    // frog.material.uniforms.time.value = counter;
    updateBones();
    // 
    head.rotation.x = PI / 10 + 0.2 * Math.cos(counter);
    head.rotation.y = head.sRot.y + 0.2 * Math.sin(0.5 * counter);
    // console.log(spine1.rotation);
    renderer.render(scene, camera);
}
animate();

function updateBones() {
    frog.skeleton.update();
    for (let i = 0; i < frog.skeleton.bones.length; i++) {
        for (let j = i * 16; j < i * 16 + 16; j++) {
            material.uniforms.boneMatrices.value[i].elements[j % 16] = frog.skeleton.boneMatrices[j];
        }
    }
}

function initials(obj) {
    obj.forEach(e => {
        e.sPos = e.position.clone();
        e.sRot = e.rotation.clone();
        e.sSca = e.scale.clone();
    });
}