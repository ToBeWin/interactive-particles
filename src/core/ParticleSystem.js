import * as THREE from 'three';
import { ShapeGenerator } from '../shapes/ShapeGenerator.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.count = 30000;
    this.currentShape = 'sphere';
    this.mode = 'shape'; // 'shape' or 'gravity'
    this.targetPositions = null;
    this.particles = null;
    this.geometry = null;
    this.material = null;
    
    // Physics data
    this.velocities = new Float32Array(this.count * 3);
    
    // Rainbow mode
    this.rainbowMode = false;
    this.rainbowTime = 0;
    
    this.init();
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    
    // Initialize particles in a visible sphere shape instead of random
    for (let i = 0; i < this.count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 10 * Math.cbrt(Math.random()); // Cubic root for uniform distribution
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
      
      this.velocities[i * 3] = 0;
      this.velocities[i * 3 + 1] = 0;
      this.velocities[i * 3 + 2] = 0;
      
      sizes[i] = Math.random();
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseSize: { value: 3.0 },
        scale: { value: 1.0 },
        color: { value: new THREE.Color(0x00ffff) },
        audioLevel: { value: 0.0 } // Audio reactivity
      },
      vertexShader: `
        uniform float time;
        uniform float baseSize;
        uniform float scale;
        uniform float audioLevel;
        attribute vec3 color;
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vec3 pos = position * scale;
          
          // Audio pulse effect
          float pulse = 1.0 + audioLevel * 0.5;
          pos *= pulse;
          
          // Add complex noise/movement
          float noise = sin(time * 2.0 + position.y * 0.05) * 0.1 + cos(time * 1.5 + position.x * 0.05) * 0.1;
          pos += noise * (1.0 + audioLevel * 2.0); // More noise with audio
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          gl_PointSize = baseSize * size * (300.0 / -mvPosition.z) * pulse;
          
          vAlpha = smoothstep(50.0, 0.0, -mvPosition.z);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5, 0.5));
          if (r > 0.5) discard;
          
          float glow = 1.0 - smoothstep(0.0, 0.5, r);
          glow = pow(glow, 2.0);
          
          gl_FragColor = vec4(color * vColor, glow * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
    
    this.setShape('sphere');
  }

  setShape(shapeType) {
    this.currentShape = shapeType;
    this.mode = 'shape';
    
    // Reset scale to initial state when switching models
    this.material.uniforms.scale.value = 1.0;
    
    let positions;
    
    switch (shapeType) {
      case 'heart': positions = ShapeGenerator.generateHeart(this.count, 0.5); break;
      case 'sphere': positions = ShapeGenerator.generateSphere(this.count, 10); break;
      case 'saturn': positions = ShapeGenerator.generateSaturn(this.count, 1.5); break;
      case 'galaxy': positions = ShapeGenerator.generateGalaxy(this.count, 1.0); break;
      case 'flower': positions = ShapeGenerator.generateFlower(this.count, 0.8); break;
      case 'torus': positions = ShapeGenerator.generateTorusKnot(this.count, 0.8); break;
      case 'dna': positions = ShapeGenerator.generateDNA(this.count, 1.0); break;
      case 'fireworks': positions = ShapeGenerator.generateFireworks(this.count, 1.0); break;
      case 'atomic': positions = ShapeGenerator.generateAtomic(this.count, 1.0); break;
      default: positions = ShapeGenerator.generateSphere(this.count, 10);
    }
    
    this.targetPositions = positions;
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'gravity') {
      // Reset velocities when entering gravity mode
      for (let i = 0; i < this.count * 3; i++) {
        this.velocities[i] = (Math.random() - 0.5) * 0.1;
      }
    }
  }

  setColor(hexColor) {
    this.rainbowMode = false; // Disable rainbow when manually setting color
    this.material.uniforms.color.value.set(hexColor);
  }

  toggleRainbowMode() {
    this.rainbowMode = !this.rainbowMode;
    if (!this.rainbowMode) {
      // Reset to cyan when disabling
      this.material.uniforms.color.value.set(0x00ffff);
    }
  }

  setParticleCount(newCount) {
    if (newCount === this.count) return;
    
    this.count = newCount;
    
    // Recreate geometry with new count
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    
    for (let i = 0; i < this.count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 10 * Math.cbrt(Math.random());
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
      
      sizes[i] = Math.random();
    }
    
    // Update geometry
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Recreate velocities array
    this.velocities = new Float32Array(this.count * 3);
    
    // Regenerate target shape
    if (this.currentShape) {
      this.setShape(this.currentShape);
    }
  }

  update(deltaTime, interactionData, audioData) {
    this.material.uniforms.time.value += deltaTime;
    
    // Rainbow Mode
    if (this.rainbowMode) {
      this.rainbowTime += deltaTime * 0.5;
      const hue = (this.rainbowTime % 1.0);
      const color = new THREE.Color();
      color.setHSL(hue, 1.0, 0.5);
      this.material.uniforms.color.value = color;
    }
    
    // Audio Reactivity - multi-band
    if (audioData) {
      // Bass affects particle size
      this.material.uniforms.audioLevel.value = audioData.bass * 2.0;
      
      // Mid affects particle speed (noise)
      this.material.uniforms.time.value += audioData.mid * 0.5;
      
      // High affects color brightness (if not in rainbow mode)
      if (!this.rainbowMode && audioData.high > 0.3) {
        const currentColor = this.material.uniforms.color.value;
        const brightColor = currentColor.clone().multiplyScalar(1.0 + audioData.high);
        this.material.uniforms.color.value.lerp(brightColor, 0.1);
      }
    }

    // Handle scale from hand gestures
    const targetScale = interactionData.scale || 1.0;
    this.material.uniforms.scale.value += (targetScale - this.material.uniforms.scale.value) * 0.1;

    const positions = this.geometry.attributes.position.array;

    if (this.mode === 'shape' && this.targetPositions) {
      // Morphing logic
      const speed = 2.0 * deltaTime;
      for (let i = 0; i < this.count * 3; i++) {
        positions[i] += (this.targetPositions[i] - positions[i]) * speed;
      }
    } else if (this.mode === 'gravity' && interactionData.handPosition) {
      // Gravity logic
      // Hand position is normalized [0,1], map to world space roughly [-20, 20]
      // Note: MediaPipe x is inverted for mirror effect usually, but we handled that in CSS.
      // Let's assume inputManager gives us normalized coordinates where 0.5, 0.5 is center.
      
      const targetX = (interactionData.handPosition.x - 0.5) * -40; // Invert X for mirror feel
      const targetY = (interactionData.handPosition.y - 0.5) * -30; // Invert Y because screen y is down
      const targetZ = 0;

      for (let i = 0; i < this.count; i++) {
        const idx = i * 3;
        const px = positions[idx];
        const py = positions[idx + 1];
        const pz = positions[idx + 2];

        const dx = targetX - px;
        const dy = targetY - py;
        const dz = targetZ - pz;

        const distSq = dx*dx + dy*dy + dz*dz;
        const dist = Math.sqrt(distSq);
        
        // Gravity force
        const force = 500.0 / (distSq + 10.0); // Soften gravity at center
        
        this.velocities[idx] += dx / dist * force * deltaTime;
        this.velocities[idx+1] += dy / dist * force * deltaTime;
        this.velocities[idx+2] += dz / dist * force * deltaTime;

        // Damping
        this.velocities[idx] *= 0.95;
        this.velocities[idx+1] *= 0.95;
        this.velocities[idx+2] *= 0.95;

        positions[idx] += this.velocities[idx] * deltaTime;
        positions[idx+1] += this.velocities[idx+1] * deltaTime;
        positions[idx+2] += this.velocities[idx+2] * deltaTime;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}
