import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const _VS = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const _FS = `
void main() {
    vec2 uv = gl_FragCoord.xy;
    gl_FragColor = vec4( 0.4);
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


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry,
    new THREE.ShaderMaterial({

        uniforms: {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2(1, 0) }
        },

        vertexShader: _VS,
        fragmentShader: _FS

    })
);
var bone;
const loader = new GLTFLoader();
loader.load('model.gltf', function (gltf) {
    scene.add(gltf.scene);

    // const frog = gltf.scene.children[0].children[0];
    // frog.rotation.z = 3.14159;
    const armature = gltf.scene.children[0]
    bone = armature.children[4].children[1].children[0].children[2];
    // console.log(frog);
    // frog.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // frog.rotation.y = 3.14159 / 2;
    // console.log(frog);
    // console.log(armature);
    // scene.add(frog);
    // const bone = gltf.scene.children.find((child) => child.name === "bone2.027");
    // scene.add(frog);
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
// camera.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), 3.14159 / 2);

var counter = 1;
function animate() {
    counter += 0.4;
    requestAnimationFrame(animate);
    bone.rotation.x = 3.14159 / 10 + 0.2 * Math.sin(counter);
    bone.rotation.y = 0.2 * Math.cos(0.7 * counter);
    renderer.render(scene, camera);
}
animate();