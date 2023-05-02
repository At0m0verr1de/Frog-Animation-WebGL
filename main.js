import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const _VS = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform mat4 bindMatrix;
uniform mat4 bindMatrixInverse;
uniform mat4 boneMatrices[46];
void main() {
    mat4 skinMatrix = mat4(0.0);
    skinMatrix += boneMatrices[int(skinIndex.x)] * skinWeight.x;
    skinMatrix += boneMatrices[int(skinIndex.y)] * skinWeight.y;
    skinMatrix += boneMatrices[int(skinIndex.z)] * skinWeight.z;
    skinMatrix += boneMatrices[int(skinIndex.w)] * skinWeight.w;
    vec4 skinVertex = skinMatrix * bindMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(skinMatrix) * normal);
    vPosition = skinVertex.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * skinVertex;
}
`;

const _FS = `
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform vec3 ambientColor;
uniform vec3 lightColor;
uniform vec3 lightDirection;
uniform float specularStrength;


varying vec3 vNormal;
varying vec3 vPosition;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec3 color = diffuse;

    // Apply some procedural texturing to the frog's skin
    vec2 uv = vec2(vPosition.x * 0.2, vPosition.z * 0.2);
    float noise = rand(uv) * 0.2;
    color += vec3(noise, 0.0, noise * 0.5);

    // Calculate Phong shading
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 lightDir = normalize(lightDirection);
    vec3 reflectDir = reflect(-lightDir, normal);

    float diffuseStrength = max(dot(normal, lightDir), 0.0);
    vec3 diffuseColor = lightColor * diffuse * diffuseStrength;

    float specularStrength = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * specularStrength;
    vec3 specularColor = lightColor * specular * specularStrength;

    vec3 ambientColor = ambientColor * color;
    vec3 finalColor = ambientColor + diffuseColor + specularColor + emissive;

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

let root, frog, armature, eyes, spine0, spine1, head, material;
let leg0r, leg00r, leg01r, leg0l, leg00l, leg01l;
let leg1r, leg10r, leg11r, leg1l, leg10l, leg11l, leg12r, leg12l;
const loader = new GLTFLoader();
loader.load('model.gltf', function (gltf) {

    gltf.scene.rotation.set(0, 0, PI);
    armature = gltf.scene.children[0];
    eyes = armature.children[0];
    frog = armature.children[1];
    root = armature.children[2];
    spine0 = root.children[0];
    leg0r = root.children[1];
    leg00r = leg0r.children[0];
    leg01r = leg00r.children[0];
    leg0l = root.children[2];
    leg00l = leg0l.children[0];
    leg01l = leg00l.children[0];
    spine1 = spine0.children[0];
    leg1r = spine1.children[0];
    leg1l = spine1.children[2];
    leg10r = leg1r.children[0];
    leg11r = leg10r.children[0];
    leg10l = leg1l.children[0];
    leg11l = leg10l.children[0];
    leg12r = leg11r.children[0];
    leg12l = leg11l.children[0];
    head = spine1.children[1];

    material = new THREE.ShaderMaterial({
        uniforms: {
            diffuse: { value: new THREE.Color(0x9fd259) },
            emissive: { value: new THREE.Color(0x000000) },
            specular: { value: new THREE.Color(0xffffff) },
            shininess: { value: 10 },
            ambientColor: { value: new THREE.Color(0x111111) },
            lightColor: { value: new THREE.Color(0xffffff) },
            lightDirection: { value: new THREE.Vector3(0, 1, 0) },
            specularStrength: { value: 0.4 },
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
    frog.rotation.set(-0.14, 0, PI);
    frog.position.y += 2;

    const eyeMaterial = material.clone();
    eyeMaterial.uniforms.emissive.value = new THREE.Color(0x555555);
    eyeMaterial.uniforms.diffuse.value = new THREE.Color(0xb7b7b7);
    eyes.material = eyeMaterial;
    frog.add(eyes);
    scene.add(gltf.scene);
    // frog.add(frog.skeleton.bones[0]);
    // frog.bind(frog.skeleton); // 
    // scene.add(frog);
    // scene.add(eyes);
    initials([root, spine0, spine1, head, eyes, frog, leg0r, leg00r, leg01r, leg0l, leg00l, leg01l, leg1r, leg10r, leg11r, leg1l, leg10l, leg11l, leg12r, leg12l]);

}, undefined, function (error) {
    console.error(error);
});

const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), new THREE.MeshBasicMaterial({ color: 0x202020, side: THREE.DoubleSide }));
plane.rotateX(PI / 2);
plane.position.y = -2.07;
scene.add(plane);
camera.position.z = 13;
// camera.position.y = 1;
// camera.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), PI / 8);
let keyup, keydown, keyright, keyleft, shift, w, a, s, d, j, q;

document.addEventListener('keydown', event => {
    if (event.code === 'ArrowUp') keyup = true;
    if (event.code === 'ArrowDown') keydown = true;
    if (event.code === 'ArrowLeft') keyleft = true;
    if (event.code === 'ArrowRight') keyright = true;
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') shift = true;
    if (event.code === 'KeyW') w = true;
    if (event.code === 'KeyA') a = true;
    if (event.code === 'KeyS') s = true;
    if (event.code === 'KeyD') d = true;
    if (event.code === 'KeyJ') j = true;
    if (event.code === 'KeyQ') q = true;
    if (!started) {
        audioLoader.load('asgore.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
    }
    started = true;

});

document.addEventListener('keyup', event => {
    if (event.code === 'ArrowUp') keyup = false;
    if (event.code === 'ArrowDown') keydown = false;
    if (event.code === 'ArrowLeft') keyleft = false;
    if (event.code === 'ArrowRight') keyright = false;
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') shift = false;
    if (event.code === 'KeyW') w = false;
    if (event.code === 'KeyA') a = false;
    if (event.code === 'KeyS') s = false;
    if (event.code === 'KeyD') d = false;
    if (event.code === 'KeyJ') j = false;
    if (event.code === 'KeyQ') q = false;
});

const instructionsElement = document.createElement('div');
instructionsElement.innerText = `Click to start, syncned to beat
Use arrow keys to move, mouse to rotate/zoom camera
Use shift+arrow keys to rotate, j to jump, q to swim
`;

// add some CSS styling to position the element in the top left corner
instructionsElement.style.position = 'absolute';
instructionsElement.style.top = '10px';
instructionsElement.style.left = '10px';
document.body.appendChild(instructionsElement);


const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();


let started = false;

document.addEventListener('click', () => {
    if (!started) {
        audioLoader.load('asgore.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
    }
    started = true;
});


const clock = new THREE.Clock();
const bps = 115.262 / 60;
let at = 0;
let time = 0, dt;
let lastJump = 0;
function animate() {
    requestAnimationFrame(animate);
    if (!started) {
        renderer.render(scene, camera);
        return;
    }
    dt = clock.getDelta();
    time = clock.getElapsedTime();

    if (shift) {
        if (keyup) frog.rotation.x -= 1.5 * dt;
        if (keydown) frog.rotation.x += 1.5 * dt;
        if (keyleft) frog.rotation.y += 2.4 * dt;
        if (keyright) frog.rotation.y -= 2.4 * dt;
    } else {
        if (keyup) {
            frog.translateZ(3 * dt);
            frog.sPos.y = frog.position.y;
        }
        if (keydown) {
            frog.translateZ(-3 * dt);
            frog.sPos.y = frog.position.y;
        }
        if (keyleft) frog.position.x += 3 * dt;
        else if (keyright) frog.position.x -= 3 * dt;
        frog.rotation.x = lerp(frog.rotation.x, frog.sRot.x, 0, 10 * dt);
    }
    if (a) head.rotation.z = lerp(head.rotation.z, head.sRot.z, -PI / 4, 10 * dt);
    else if (d) head.rotation.z = lerp(head.rotation.z, head.sRot.z, PI / 4, 10 * dt);
    else head.rotation.z = lerp(head.rotation.z, head.sRot.z, 0, 10 * dt);

    if (j && time > lastJump) lastJump = time + 1;
    jump();
    swim();
    animateLegs();
    if (time * bps > 2) {
        animationHeadWobble();
    }
    updateBones();
    plane.material.color = plane.material.color.lerp(new THREE.Color(0x202020), 4 * dt);
    renderer.render(scene, camera);
}
animate();

function jump() {
    if (lastJump >= time) {
        frog.position.y = (lastJump - time - 1) * (lastJump - time) * 8 + frog.sPos.y;
        let before = frog.position.y;
        frog.translateZ(5 * dt);
        frog.sPos.y += frog.position.y - before;
    } else {
        frog.position.y = frog.sPos.y;
    }
    if (lastJump - time > 0.3) {
        w = true; s = true;
    } else if (lastJump >= time) {
        w = false; s = false;
    }
}

function animationHeadWobble() {
    head.rotation.x = head.sRot.x + 0.2 * Math.cos(time * 2 * PI * bps);
    head.rotation.y = head.sRot.y + 0.2 * Math.cos(time * PI * bps);
    if (at != Math.floor(time * bps * 0.5)) {
        plane.material.color = new THREE.Color(0x252525);
        at = Math.floor(time * bps * 0.5);
    }
}

function swim() {
    if (q) {
        let q1 = new THREE.Quaternion();
        let q2 = new THREE.Quaternion();
        q2.setFromAxisAngle(new THREE.Vector3(0.5, 0, 0.5), Math.PI / 3 * Math.cos(time * PI * bps));
        q1.setFromAxisAngle(new THREE.Vector3(1, 0, 0.4), Math.PI / 4 * Math.sin(time * 2 * PI * bps));
        q1.multiply(leg00r.sQuat);
        leg00r.quaternion.slerp(q1, 5 * dt);
        leg01r.quaternion.slerp(q2, 10 * dt);
        q2.setFromAxisAngle(new THREE.Vector3(0.5, 0, -0.5), -Math.PI / 3 * Math.sin(time * PI * bps));
        q1.setFromAxisAngle(new THREE.Vector3(1, 0, -0.4), Math.PI / 4 * Math.cos(time * 2 * PI * bps));
        q1.multiply(leg00l.sQuat);
        leg00l.quaternion.slerp(q1, 5 * dt);
        leg01l.quaternion.slerp(q2, 10 * dt);

        let q = new THREE.Quaternion();
        q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3 + Math.PI / 4 * Math.cos(time * PI * bps));
        q.setFromAxisAngle(new THREE.Vector3(0.2, 0.7, 0.2), Math.PI / 8 * (Math.sin(time * PI * bps) + 1));
        q2.multiply(q)

        q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 6 * Math.cos(time * PI * bps));
        q1.multiply(q);
        q1.multiply(leg11r.sQuat);
        leg11r.quaternion.slerp(q1, 10 * dt);
        leg12r.quaternion.slerp(q2, 10 * dt);

        q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 3);
        q.setFromAxisAngle(new THREE.Vector3(0.2, 0.7, 0.2), -Math.PI / 8 * (Math.cos(time * PI * bps) + 1));
        q2.multiply(q)
        q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 6 * Math.sin(time * PI * bps));
        q1.multiply(q);
        q1.multiply(leg11l.sQuat);
        leg11l.quaternion.slerp(q1, 10 * dt);
        leg12l.quaternion.slerp(q2, 10 * dt);
    }

}

function animateLegs() {
    if (s) {
        let q1 = new THREE.Quaternion();
        let q2 = new THREE.Quaternion();
        q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
        q1.setFromAxisAngle(new THREE.Vector3(1, 0, 0.4), Math.PI / 4);
        q1.multiply(leg00r.sQuat);
        leg00r.quaternion.slerp(q1, 5 * dt);
        leg01r.quaternion.slerp(q2, 10 * dt);
        q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 8);
        q1.setFromAxisAngle(new THREE.Vector3(1, 0, -0.4), Math.PI / 4);
        q1.multiply(leg00l.sQuat);
        leg00l.quaternion.slerp(q1, 5 * dt);
        leg01l.quaternion.slerp(q2, 10 * dt);
    } else if (!q) {
        leg01l.quaternion.slerp(leg01l.sQuat, 10 * dt);
        leg00l.quaternion.slerp(leg00l.sQuat, 10 * dt);
        leg01r.quaternion.slerp(leg01r.sQuat, 10 * dt);
        leg00r.quaternion.slerp(leg00r.sQuat, 10 * dt);
    }
    if (w) {
        let q1 = new THREE.Quaternion();
        let q2 = new THREE.Quaternion();
        q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        q1.multiply(leg11r.sQuat);
        leg11r.quaternion.slerp(q1, 10 * dt);
        leg12r.quaternion.slerp(q2, 10 * dt);

        q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
        q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        q1.multiply(leg11l.sQuat);
        leg11l.quaternion.slerp(q1, 10 * dt);
        leg12l.quaternion.slerp(q2, 10 * dt);
    } else if (!q) {
        leg11l.quaternion.slerp(leg11l.sQuat, 10 * dt);
        leg12l.quaternion.slerp(leg12l.sQuat, 10 * dt);
        leg11r.quaternion.slerp(leg11r.sQuat, 10 * dt);
        leg12r.quaternion.slerp(leg12r.sQuat, 10 * dt);
    }
}
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
        e.sQuat = e.quaternion.clone();
        e.sSca = e.scale.clone();
    });
}

function lerp(a, wrt, b, t) {
    return a + (b - a + wrt) * t;
}