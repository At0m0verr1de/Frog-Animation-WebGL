import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const _VS = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const _FS = `
uniform float time;
uniform vec2 resolution;
void main() {
    // realistic frog shader, github copilot pls

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = uv - 0.5;
    p.x *= resolution.x / resolution.y;
    float a = atan(p.x, p.y);
    float r = length(p) * 2.0;
    vec3 col = vec3(0.0);
    float d = 0.0;
    float z = 1.0;
    for (int i = 0; i < 3; i++) {
        d = abs(sin(a * 3.0 - float(i) * 1.0) * 0.2 + 0.2);
        d += abs(sin(r * 8.0 + time * 0.5) * 0.1 + 0.1);
        d += abs(sin(r * 20.0 + time * 0.5) * 0.04 + 0.04);
        d += abs(sin(r * 100.0 + time * 0.5) * 0.004 + 0.004);
        d = clamp(d, 0.0, 1.0);
        z = min(z, d);
    }
    col = vec3(z);
    gl_FragColor = vec4(0.0, z, 0.0, 1.0);
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

var bone, frog;
const loader = new GLTFLoader();
loader.load('model.gltf', function (gltf) {

    frog = gltf.scene.children[0].children[1];
    frog.material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            resolution: {
                value: new THREE.Vector2(
                    window.innerWidth,
                    window.innerHeight
                )
            }
        },
        vertexShader: _VS,
        fragmentShader: _FS
    });
    frog.rotation.z = 3.14159;
    frog.position.y += 4;
    frog.position.x += 4;
    scene.add(gltf.scene);
    // frog.rotation.z = 3.14159;
    // const armature = gltf.scene.children[0]
    // bone = armature.children[4].children[1].children[0].children[2];
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

camera.position.z = 15;
// camera.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), 3.14159 / 2);

var counter = 1;
function animate() {
    counter += 0.4;
    requestAnimationFrame(animate);
    frog.material.uniforms.time.value = counter;

    // bone.rotation.x = 3.14159 / 10 + 0.2 * Math.cos(counter);
    // bone.rotation.y = 0.2 * Math.cos(0.5 * counter);
    renderer.render(scene, camera);
}
animate();