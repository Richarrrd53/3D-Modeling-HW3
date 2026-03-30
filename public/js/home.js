import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/objects/Sky.js';
import { Reflector } from 'https://unpkg.com/three@0.129.0/examples/jsm/objects/Reflector.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const clock = new THREE.Clock();
let mixer, currentAction, animations = [];
let isPlaying = true;

let stage, character, gridHelper, sky;

const LAYER_MODEL_REFLECT = 1;


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const my_model = '../3dmodel/merged-model.glb';
const manager = new THREE.LoadingManager();


const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
let charColors = new Uint8Array([80, 255]);
const gradientMap = new THREE.DataTexture(charColors, charColors.length, 1, THREE.LuminanceFormat);
gradientMap.minFilter = THREE.NearestFilter;
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.generateMipmaps = false;
gradientMap.needsUpdate = true;



const loader = new GLTFLoader(manager);
loader.load(my_model, (gltf) => {
    character = gltf.scene;
    scene.add(character);
    
    character.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            
            const oldMat = child.material;
            
            if (oldMat && (oldMat.isMeshStandardMaterial || oldMat.isMeshPhongMaterial)) {
                
                const newMat = new THREE.MeshToonMaterial({
                    map: oldMat.map,
                    color: new THREE.Color(0xffffff),
                    gradientMap: gradientMap, 
                    transparent: oldMat.transparent, 
                    opacity: oldMat.opacity,
                    alphaTest: oldMat.alphaTest,
                    depthWrite: oldMat.depthWrite,
                    normalMap: oldMat.normalMap,
                    normalScale: oldMat.normalScale,
                });

                child.material = newMat;
            }
            child.layers.enable(LAYER_MODEL_REFLECT);
        }
    });
    animations = gltf.animations;
    mixer = new THREE.AnimationMixer(character);

    const select = document.getElementById('anim-select');
    animations.forEach((clip, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = clip.name || `Animation ${index + 1}`;
        if (index == 7){
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    playAnimation(7);
    animate();
});


sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const cloudVertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
        vUv = uv;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const cloudFragmentShader = `
    uniform float uTime;
    uniform vec3 uSunPos;
    varying vec2 vUv;

    
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f); 
        return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                   mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
        
        vec2 uv = vUv * 5.0; 
        vec2 speed = vec2(uTime * 0.05, uTime * 0.02);
        
        
        float n = noise(uv + speed) * 0.5;
        n += noise(uv * 2.0 + speed * 1.5) * 0.25;
        
        
        float alpha = smoothstep(0.4, 0.7, n); 
        
        
        float sunHeight = normalize(uSunPos).y;
        vec3 cloudBase = vec3(1.0); 
        vec3 sunsetColor = vec3(1.0, 0.5, 0.2); 
        vec3 finalColor = mix(sunsetColor, cloudBase, smoothstep(-0.1, 0.3, sunHeight));

        gl_FragColor = vec4(finalColor, alpha * 0.8);
    }
`;

const skyUniforms = sky.material.uniforms;
skyUniforms[ 'turbidity' ].value = 10;   
skyUniforms[ 'rayleigh' ].value = 2;    
skyUniforms[ 'mieCoefficient' ].value = 0.005; 
skyUniforms[ 'mieDirectionalG' ].value = 0.8; 



const cloudShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },         
        uSunPos: { value: new THREE.Vector3() }, 
        uBaseColor: { value: new THREE.Color(0xffffff) }, 
    },
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    transparent: true,
    side: THREE.DoubleSide
});

const cloudGeo = new THREE.SphereGeometry(400000, 32, 32); 
const cloudMesh = new THREE.Mesh(cloudGeo, cloudShaderMaterial);
scene.add(cloudMesh);

let moonMesh;
const moonLoader = new THREE.TextureLoader();

moonLoader.load('../img/moon_texture.jpg', (texture) => {
    const moonGeo = new THREE.SphereGeometry(12, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ 
        map: texture,
        emissive: new THREE.Color(0xa0c0ff),
        emissiveIntensity: 0.8,
        fog: false
    });
    moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    updateSun(10);
});

const stageLoader = new GLTFLoader(manager);
stageLoader.setCrossOrigin('anonymous');
const stageURL = "https://github.com/Richarrrd53/3D-Modeling-HW3/releases/download/v1/stage.glb";
stageLoader.load(stageURL, (gltf) => {
    const stage = gltf.scene;
    scene.add(stage);
    console.log("舞台載入成功！");
    const stageColors = new Uint8Array([0, 150, 255]);
    const stageGradient = new THREE.DataTexture(stageColors, stageColors.length, 1, THREE.LuminanceFormat);
    stageGradient.minFilter = stageGradient.magFilter = THREE.NearestFilter;
    stageGradient.needsUpdate = true;

    stage.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const oldMat = child.material;
            if (oldMat) {
                child.material = new THREE.MeshToonMaterial({
                    map: oldMat.map,
                    color: new THREE.Color(0xffffff),
                    gradientMap: stageGradient,
                    transparent: oldMat.transparent,
                    opacity: oldMat.opacity,
                    alphaTest: oldMat.alphaTest > 0 ? oldMat.alphaTest : (oldMat.transparent ? 0.5 : 0),
                    depthWrite: true, 
                    side: THREE.DoubleSide
                });
            }
        }
    });
    stage.position.x = 6;
    stage.position.z = 10;
    stage.position.y = -1.15;
    stage.rotation.y = Math.PI / 1;
    scene.add(stage);
    }, (xhr) => {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    }, (error) => {
        console.error('載入失敗', error);
});
gridHelper = new THREE.GridHelper(20, 20, 0x414141, 0x313131);
scene.add(gridHelper);
gridHelper.visible = false;

const shadowPlaneGeo = new THREE.PlaneGeometry(200, 200);
const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.3 });
const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0;
shadowPlane.receiveShadow = true;
shadowPlane.visible = false;
scene.add(shadowPlane);



const reflectorGeo = new THREE.PlaneGeometry(200, 200);
const reflector = new Reflector(reflectorGeo, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x444444 
});
reflector.rotation.x = -Math.PI / 2;
reflector.position.y = 0; 
reflector.visible = false;
scene.add(reflector);


function playAnimation(index) {
    if (currentAction) currentAction.stop();

    const clip = animations[index];
    currentAction = mixer.clipAction(clip);

    currentAction.reset();
    currentAction.play();

    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.value = 0;
    }

    mixer.update(0);
}

let isHide = true;
const playBtn = document.getElementById('play-pause-btn');
const timeline = document.getElementById('timeline');
const animSelect = document.getElementById('anim-select');
const UIContainer = document.getElementById('ui-container');
const UIGlow = document.getElementById('ui-glow');
const animationRadio = document.getElementById('animationRadio');
const canvas = renderer.domElement;
const sidePanel = document.getElementById('side-panel-bg');
const sideGlow = document.getElementById('side-glow');
const sideGlow2 = document.getElementById('side-glow2');

canvas.onclick = () => {
    if (!isHide) {
        isHide = true;
        updateUI();
    }
};

UIContainer.addEventListener('click', (e) => {
    if (isHide) {
        isHide = false;
        updateUI();
    }

});

playBtn.onclick = () => {
    isPlaying = !isPlaying;
};

function updateUI() {
    playBtn.parentNode.style.marginLeft = isHide ? '0px' : '5px';
    playBtn.parentNode.parentNode.style.gap = isHide ? '0px' : '30px';
    animationRadio.style.opacity = isHide ? '0' : '1';
    animationRadio.style.pointerEvents = isHide ? 'none' : 'auto';
    animationRadio.style.filter = isHide ? 'blur(20px)' : 'blur(0)';
    animationRadio.style.maxHeight = isHide ? '0px' : '1000px';
    animationRadio.style.maxWidth = isHide ? '0px' : '1000px';
    timeline.style.width = isHide ? '0px' : '910px';
    timeline.style.opacity = isHide ? '0' : '1';
    timeline.style.filter = isHide ? 'blur(10px)' : 'blur(0)';
    UIContainer.style.borderRadius = isHide ? '40px' : '25px';
    UIContainer.style.gap = isHide ? '0px' : '20px';
    UIContainer.style.padding = isHide ? '18.25px 25px' : '25px 25px';
    UIGlow.style.filter = isHide ? 'blur(10px)' : 'blur(60px)';
    UIGlow.style.width = isHide ? '50px' : '300px';
    UIGlow.style.height = isHide ? '50px' : '300px';
    document.getElementsByClassName('play-container')[0].style.transform = isHide ? 'translateX(2.5px)' : 'translateX(0px)';
}

const glassRadio = ["idle", "walk", "run", "salute", "flipKick", "jump", "fight", "flair"];

glassRadio.forEach((name) => {
    const radio = document.getElementById(`glass-${name}`);
    radio.onchange = () => {
        if (radio.checked) {
            playAnimation(radio.value);
        }
    }
});

animSelect.onchange = (e) => {
    playAnimation(e.target.value);
};

UIContainer.onmousemove = (e) => {
    const rect = UIContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - UIContainer.offsetWidth / 2;
    const y = e.clientY - rect.top  - UIContainer.offsetHeight / 2;
    UIGlow.style.transform = `translate(${x}px, ${y}px)`;
    UIGlow.style.opacity = '1';
}

UIContainer.onmouseleave = () => {
    UIGlow.style.opacity = '0';
}

sidePanel.onmousemove = (e) => {
    if (document.getElementById('side-panel').classList.contains('panel-closed')) return;
    const rect = sidePanel.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    sideGlow.style.transform = `translate(${x}px, ${y}px)`;
    sideGlow.style.opacity = '1';
}

sidePanel.onmouseleave = () => {
    sideGlow.style.opacity = '0';
}

timeline.oninput = (e) => {
    if (currentAction) {
        const progress = e.target.value / 100;
        currentAction.time = progress * currentAction.getClip().duration;
        mixer.update(0);
    }
};


const sunColor = 0xfffaf0;
const dirLight = new THREE.DirectionalLight(sunColor, 1.2);
dirLight.position.set(10, 30, 20); 
scene.add(dirLight);
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 4096; 
dirLight.shadow.mapSize.height = 4096;
const d =40; 
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.camera.near = 10;
dirLight.shadow.camera.far = 70;
dirLight.shadow.bias = -0.001;
dirLight.shadow.normalMapBias = 0.005;


const moonColor = 0xa0c0ff; 
const moonLight = new THREE.DirectionalLight(moonColor, 0.0); 
dirLight.position.set(-10, -30, -20); 
scene.add(moonLight);


moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048; 
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.left = -d;
moonLight.shadow.camera.right = d;
moonLight.shadow.camera.top = d;
moonLight.shadow.camera.bottom = -d;

moonLight.shadow.camera.near = d * 1.5; 
moonLight.shadow.camera.far = d * 4;
moonLight.shadow.bias = -0.005; 
moonLight.shadow.normalMapBias = 0.01;



const hemiLight = new THREE.HemisphereLight(sunColor, sunColor, 0.5); 
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0x404050, 0.15); 
scene.add(ambientLight);

renderer.domElement.style.filter = "contrast(1.0) saturate(1.3) brightness(1.0)";


camera.position.set(-0.16, 1.3, 1.77);
camera.lookAt(0, 0, 0);
controls.target.set(0, 1.1, 0);


const axesScene = new THREE.Scene();
const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
axesCamera.position.set(0, 0, 2);


function createThickAxes() {
    const group = new THREE.Group();
    const thickness = 0.05;
    const length = 1;

    const xAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(thickness, thickness, length, 8),
        new THREE.MeshBasicMaterial({ color: 0xe63946 })
    );
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = length / 2;

    const yAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(thickness, thickness, length, 8),
        new THREE.MeshBasicMaterial({ color: 0x76c893 })
    );
    yAxis.position.y = length / 2;

    const zAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(thickness, thickness, length, 8),
        new THREE.MeshBasicMaterial({ color: 0x00bbf9 })
    );
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = length / 2;

    group.add(xAxis, yAxis, zAxis);
    return group;
}

const customAxes = createThickAxes();
axesScene.add(customAxes);

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (mixer && isPlaying) {
        mixer.update(delta);

        if (currentAction) {
            const clip = currentAction.getClip();
            const progress = (currentAction.time / clip.duration) * 100;
            
            const timeline = document.getElementById('timeline');
            if (timeline) {
                timeline.value = progress;
            }
        }
    }
    if (cloudMesh && cloudMesh.material.uniforms.uTime) {
        cloudMesh.material.uniforms.uTime.value += delta;
    }
    controls.update();

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.autoClear = true;
    renderer.render(scene, camera);

    renderer.autoClear = false;
    renderer.clearDepth();

    const size = 200;
    renderer.setViewport(window.innerWidth - size, window.innerHeight - size, size, size);

    axesCamera.position.copy(camera.position).sub(controls.target).setLength(2);
    axesCamera.lookAt(0, 0, 0);

    renderer.render(axesScene, axesCamera);
}







document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isPlaying = !isPlaying;
        playBtn.innerText = isPlaying ? "Pause" : "Play";
    }
});


document.addEventListener("DOMContentLoaded", () => {
    
    const beginBG = document.getElementById('beginBG');

    const loaderWrapper = document.getElementById('loaderWrapper');
    setTimeout(() => {
        beginBG.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        beginBG.style.backdropFilter = 'blur(50px)';
        loaderWrapper.style.opacity = '1';
        loaderWrapper.style.filter = 'blur(0px)';
    }, 100);

    manager.onLoad = () => {
    console.log('所有資源載入完成！');

    setTimeout(() => {
            const loaderWrapper = document.getElementById('loaderWrapper');
            const beginGuide = document.getElementById('beginGuide');
            
            if (loaderWrapper && beginGuide) {
                loaderWrapper.style.opacity = '0';
                loaderWrapper.style.filter = 'blur(100px)';
                beginGuide.style.opacity = '1';
                beginGuide.style.filter = 'blur(0px)';
            }
        }, 5000);
    };
    document.getElementById('side-pri-btn').style.transform = 'translate(40px, 240px) scale(0)';

    updateUI();
    updateSun(10);
});

const startBtn = document.getElementById('start-btn');
startBtn.onclick = () => {
    const beginBG = document.getElementById('beginBG');
    const beginGuide = document.getElementById('beginGuide');
    beginBG.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    beginBG.style.backdropFilter = 'blur(0px)';
    beginGuide.style.opacity = '0';
    beginGuide.style.filter = 'blur(100px)';
    setTimeout(() => {
        beginBG.style.display = 'none';
        beginGuide.style.display = 'none';
    }, 1000);
}



const panel = document.getElementById('side-panel');
const panelToggle = document.getElementById('panel-toggle');

panelToggle.onclick = () => {
    panel.classList.toggle('panel-closed');
};

document.getElementById('shadow-toggle').onchange = (e) => {
    const enabled = e.target.checked;
    renderer.shadowMap.enabled = enabled;
    
    charColors = enabled ? new Uint8Array([80, 255]) : new Uint8Array([255, 255]);
    gradientMap.image.data = charColors;
    gradientMap.needsUpdate = true;
    character.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            
            const oldMat = child.material;
            
            if (oldMat && (oldMat.isMeshStandardMaterial || oldMat.isMeshPhongMaterial)) {
                
                const newMat = new THREE.MeshToonMaterial({
                    map: oldMat.map,
                    color: new THREE.Color(0xffffff),
                    gradientMap: gradientMap, 
                    transparent: oldMat.transparent, 
                    opacity: oldMat.opacity,
                    alphaTest: oldMat.alphaTest,
                    depthWrite: oldMat.depthWrite,
                    normalMap: oldMat.normalMap,
                    normalScale: oldMat.normalScale,
                });

                child.material = newMat;
            }
        }
    });
    stage.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = enabled;
            child.receiveShadow = enabled;
            if (child.material) child.material.needsUpdate = true;
        }
    });
    updateFloorSystem();
};




function updateFloorSystem() {
    const isStageVisible = document.getElementById('stage-toggle').checked; 
    const isShadowVisible = document.getElementById('shadow-toggle').checked;
    const isGridVisible = document.getElementById('grid-toggle').checked;

    gridHelper.visible = isGridVisible;

    if (!isStageVisible && isGridVisible && isShadowVisible) {
        shadowPlane.visible = true;
    } else {
        shadowPlane.visible = false;
    }

    if (!isStageVisible && !isShadowVisible && isGridVisible) {
        reflector.visible = true;
    } else {
        reflector.visible = false;
    }
    
    if (stage) stage.visible = isStageVisible;
}

document.getElementById('stage-toggle').onchange = (e) => {
    if (stage) {
        stage.visible = e.target.checked;
    }
    updateFloorSystem();
};

document.getElementById('grid-toggle').onchange = (e) => {
    if (gridHelper){
        gridHelper.visible = e.target.checked;
    }
    updateFloorSystem();
}

document.getElementById('skybox-toggle').onchange = (e) => {
    const isVisible = e.target.checked;
    if (sky) sky.visible = isVisible;
    if (cloudMesh) cloudMesh.visible = isVisible;
    if (moonMesh) moonMesh.visible = isVisible;
    
    scene.background = isVisible ? null : new THREE.Color(0x2e2e2e);
};

document.getElementById('exposure-slider').oninput = (e) => {
    const exposureValue = document.getElementById('exposure-value');
    exposureValue.innerText = e.target.value;
    renderer.toneMappingExposure = parseFloat(e.target.value);
};

document.getElementById('full-screen-toggle').onclick = (e) => {
    window.parent.postMessage({ 
        type: "fullScreen", 
        value: e.target.checked 
    }, '*');
}

const exposureSlider = document.getElementById('exposure-slider');
const exposureValue = document.getElementById('exposure-value');

exposureSlider.addEventListener('dblclick', () => {
    const defaultValue = 1.3;
    
    exposureSlider.value = defaultValue;
    exposureValue.innerText = defaultValue;
    renderer.toneMappingExposure = defaultValue;
});

const timeSlider = document.getElementById('time-slider');
const timeDisplay = document.getElementById('time-display');

timeSlider.oninput = (e) => {
    const time = parseFloat(e.target.value);
    timeDisplay.innerText = Math.floor(time) + "：00";
    updateSun(time);
};

const sideNxtBtn = document.getElementById('side-nxt-btn');
const sidePriBtn = document.getElementById('side-pri-btn');
const sidePanelBG2 = document.getElementById('side-panel-bg2');
const sidePanelBG = document.getElementById('side-panel-bg');

sideNxtBtn.onclick = () => {
    sideNxtBtn.style.opacity = '0';
    sideNxtBtn.style.transform = 'translate(40px, 240px) scale(0)';
    sideNxtBtn.style.filter = 'blur(20px)';
    setTimeout(() => {
        sidePanelBG.style.opacity = '0';
        sidePanelBG.style.filter = 'blur(20px)';
        sidePanelBG.style.transform = 'scaleX(-1)';
    }, 10);

    setTimeout(() => {
        sidePanelBG.style.zIndex = '40';
        sidePanelBG2.style.zIndex = '50';
        sidePanelBG2.style.opacity = '1';
        sidePanelBG2.style.filter = 'blur(0px)';
        sidePanelBG2.style.transform = 'scaleX(1)';
        sidePriBtn.style.transform = 'translate(40px, 240px) scale(1)';
        sidePriBtn.style.opacity = '1';
        sidePriBtn.style.filter = 'blur(0px)';
    }, 210);

    setTimeout(() => {
        sidePriBtn.style.transform = '';
    }, 610);
}

sidePriBtn.onclick = () => {
    sidePriBtn.style.opacity = '0';
    sidePriBtn.style.transform = 'translate(40px, 240px) scale(0)';
    sidePriBtn.style.filter = 'blur(20px)';
    setTimeout(() => {
        sidePanelBG2.style.opacity = '0';
        sidePanelBG2.style.filter = 'blur(20px)';
        sidePanelBG2.style.transform = 'scaleX(-1)';
    }, 10);

    setTimeout(() => {
        sidePanelBG2.style.zIndex = '40';
        sidePanelBG.style.zIndex = '50';
        sidePanelBG.style.opacity = '1';
        sidePanelBG.style.filter = 'blur(0px)';
        sidePanelBG.style.transform = 'scaleX(1)';
        sideNxtBtn.style.transform = 'translate(40px, 240px) scale(1)';
        sideNxtBtn.style.opacity = '1';
        sideNxtBtn.style.filter = 'blur(0px)';
    }, 210);
    setTimeout(() => {
        sideNxtBtn.style.transform = '';
    }, 610);
}


sidePanelBG2.onmousemove = (e) => {
    if (document.getElementById('side-panel').classList.contains('panel-closed')) return;
    const rect = sidePanelBG2.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    sideGlow2.style.transform = `translate(${x}px, ${y}px)`;
    sideGlow2.style.opacity = '1';
}

sidePanelBG2.onmouseleave = () => {
    sideGlow2.style.opacity = '0';
}


function updateSun(time) {
    const sunAngle = (time / 24) * Math.PI * 2 - (Math.PI / 2);
    const radius = 40;
    
    dirLight.position.x = Math.cos(sunAngle) * radius;
    dirLight.position.y = Math.sin(sunAngle) * radius;
    dirLight.position.z = 10;

    const moonAngle = sunAngle + Math.PI; 
    moonLight.position.x = Math.cos(moonAngle) * radius;
    moonLight.position.y = Math.sin(moonAngle) * radius;
    moonLight.position.z = -10;

    if (moonMesh) {
        const meshRadius = 180;
        moonMesh.position.x = Math.cos(moonAngle) * meshRadius;
        moonMesh.position.y = Math.sin(moonAngle) * meshRadius;
        moonMesh.position.z = -50; 
    }

    let sunIntensity = 0.0;
    let moonIntensity = 0.0;
    const noonColor = new THREE.Color(0xfffaf0);
    const sunsetColor = new THREE.Color(0xff4500);

    const sunVec = dirLight.position.clone().normalize();
    sky.material.uniforms['sunPosition'].value.copy(sunVec);

    if (cloudMesh) {
        cloudMesh.material.uniforms['uSunPos'].value.copy(dirLight.position);
    }

    if (time >= 5 && time < 19) {
        const t = (time - 5) / 14; 
        
        sunIntensity = Math.max(0.0, 1.2 - Math.abs(t - 0.5) * 2.4);
        moonIntensity = 0.0;

        
        if (time < 12) {
            dirLight.color.lerpColors(new THREE.Color(0xffa500), noonColor, (time - 5) / 7);
        } else {
            dirLight.color.lerpColors(noonColor, sunsetColor, (time - 12) / 7);
        }
        dirLight.castShadow = true;
        moonLight.castShadow = false;
        renderer.domElement.style.filter = "contrast(1.0) saturate(1.3) brightness(1.0)";
        ambientLight.intensity = 0.15;
        if(moonMesh) moonMesh.visible = false;
    } 
    
    else {
        
        sunIntensity = 0.0;
        const t = (time < 5) ? (time + 24 - 19) / 10 : (time - 19) / 10;
        moonIntensity = Math.max(0.0, 0.4 - Math.abs(t - 0.5) * 0.8);
        
        dirLight.castShadow = false;
        moonLight.castShadow = true;

        if (stage) {
            stage.traverse(child => {
                if (child.isMesh) child.receiveShadow = true;
                if (child.isMesh) child.castShadow = true;
            });
        }
        if (character) {
            character.traverse(child => {
                if (child.isMesh) child.castShadow = true;
            });
        }
        const night_t = (time < 5) ? (time + 24 - 19) / 10 : (time - 19) / 10;
        const brightness = Math.max(0.4, 1.0 - night_t * 0.6);
        ambientLight.intensity = 0.25; 
        renderer.toneMappingExposure = 0.7; 
        scene.background = new THREE.Color(0x020a1a); 
        renderer.domElement.style.filter = `contrast(1.0) saturate(1.3) brightness(${brightness})`;
        if(moonMesh) moonMesh.visible = true;
    }

    dirLight.intensity = sunIntensity;
    moonLight.intensity = moonIntensity;

    
    
    
    const isNight = (time >= 19 || time < 5);
    ambientLight.color.lerpColors(new THREE.Color(0x404050), new THREE.Color(0x202030), isNight ? 1 : 0);
    ambientLight.intensity = isNight ? 0.1 : 0.15;
}