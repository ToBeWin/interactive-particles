import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Effect toggles
    this.effectsEnabled = {
      bloom: true,
      chromatic: false,
      film: false
    };

    this.scene = new THREE.Scene();
    // Darker background for bloom to pop
    this.scene.background = new THREE.Color(0x050505);
    this.scene.fog = new THREE.FogExp2(0x050505, 0.002);

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 40; // Moved back slightly for larger models

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // Antialias is often disabled when using post-processing for performance
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ReinhardToneMapping;

    this.initPostProcessing();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom Pass
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.5, // Strength
      0.4, // Radius
      0.85 // Threshold
    );
    this.composer.addPass(this.bloomPass);

    // Chromatic Aberration (custom)
    this.chromaticPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        amount: { value: 0.003 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        varying vec2 vUv;
        void main() {
          vec2 offset = amount * (vUv - 0.5);
          vec4 cr = texture2D(tDiffuse, vUv + offset);
          vec4 cga = texture2D(tDiffuse, vUv);
          vec4 cb = texture2D(tDiffuse, vUv - offset);
          gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        }
      `
    });
    this.chromaticPass.enabled = false;
    this.composer.addPass(this.chromaticPass);

    // Film Grain
    this.filmPass = new FilmPass(0.35, 0.5, 2048, false);
    this.filmPass.enabled = false;
    this.composer.addPass(this.filmPass);
  }

  toggleEffect(effectName) {
    switch (effectName) {
      case 'bloom':
        this.effectsEnabled.bloom = !this.effectsEnabled.bloom;
        this.bloomPass.enabled = this.effectsEnabled.bloom;
        break;
      case 'chromatic':
        this.effectsEnabled.chromatic = !this.effectsEnabled.chromatic;
        this.chromaticPass.enabled = this.effectsEnabled.chromatic;
        break;
      case 'film':
        this.effectsEnabled.film = !this.effectsEnabled.film;
        this.filmPass.enabled = this.effectsEnabled.film;
        break;
    }
    return this.effectsEnabled[effectName];
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  update() {
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}
