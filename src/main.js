import { SceneManager } from './core/SceneManager.js';
import { ParticleSystem } from './core/ParticleSystem.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './core/AudioManager.js';
import { PerformanceMonitor } from './core/PerformanceMonitor.js';
import { StarField } from './effects/StarField.js';

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.video = document.getElementById('webcam');
    this.uiContainer = document.getElementById('ui-container');

    this.sceneManager = new SceneManager(this.canvas);
    this.starField = new StarField(this.sceneManager.scene);
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
    this.inputManager = new InputManager(this.video);
    this.uiManager = new UIManager(this.uiContainer);
    this.audioManager = new AudioManager();
    this.performanceMonitor = new PerformanceMonitor();

    this.clock = new THREE.Clock();
    
    this.init();
  }

  async init() {
    // Init UI
    this.uiManager.init(this.particleSystem, this.audioManager);
    
    // Start input manager (will fallback to mouse if needed)
    this.inputManager.init().catch(e => console.error("Input Init Failed:", e));
    
    // Start animation loop immediately
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.performanceMonitor.beginFrame();

    const deltaTime = this.clock.getDelta();
    const interactionData = this.inputManager.getInteractionData();
    const audioData = this.audioManager.getAudioData();

    this.performanceMonitor.setParticleCount(this.particleSystem.count);

    this.starField.update(deltaTime);
    this.particleSystem.update(deltaTime, interactionData, audioData);
    this.uiManager.updateStatus(interactionData);
    this.sceneManager.update();

    this.performanceMonitor.endFrame();
    this.uiManager.updatePerformance(this.performanceMonitor.getStats());
  }
}

// Need to import THREE for Clock to work in main scope if not imported
import * as THREE from 'three';

const app = new App();
window.appInstance = app; // Expose for UI to access
