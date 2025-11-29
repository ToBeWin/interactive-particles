import * as THREE from 'three';

export class ShapeGenerator {
  static generateSphere(count, radius) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }

  static generateHeart(count, scale) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Heart formula
      let t = Math.random() * Math.PI * 2;
      // Distribute points more evenly
      let u = Math.random(); 
      
      // Parametric equations for heart
      // x = 16sin^3(t)
      // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
      // z = random thickness
      
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const z = (Math.random() - 0.5) * 5; // Thickness

      // Add some randomness/volume
      const r = (Math.random() * 0.2 + 0.8) * scale;

      positions[i * 3] = x * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z * r;
    }
    return positions;
  }

  static generateSaturn(count, scale) {
    const positions = new Float32Array(count * 3);
    const ringCount = Math.floor(count * 0.7);
    const planetCount = count - ringCount;

    // Planet
    for (let i = 0; i < planetCount; i++) {
      const r = scale * 5 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    // Rings
    for (let i = planetCount; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = (Math.random() * 5 + 8) * scale; // Ring radius range
      
      positions[i * 3] = Math.cos(angle) * dist;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5 * scale; // Thinness
      positions[i * 3 + 2] = Math.sin(angle) * dist;
      
      // Tilt the rings
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      const tilt = Math.PI / 6; // 30 degrees
      positions[i * 3] = x * Math.cos(tilt) - y * Math.sin(tilt);
      positions[i * 3 + 1] = x * Math.sin(tilt) + y * Math.cos(tilt);
    }
    return positions;
  }
  
  static generateGalaxy(count, scale) {
    const positions = new Float32Array(count * 3);
    const arms = 5;
    const armWidth = 0.5;
    
    for (let i = 0; i < count; i++) {
        const t = Math.random();
        const angle = t * Math.PI * 2 * arms + (Math.random() - 0.5) * armWidth;
        const radius = t * 15 * scale;
        
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 2 * scale; // Thickness
        const z = Math.sin(angle) * radius;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
  }

  static generateFlower(count, scale) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI;
      
      // Rose/Flower parametric
      // r = 1 + sin(k * u)
      const k = 5; // Number of petals
      const r = (1 + Math.sin(k * u)) * Math.sin(v) * 8 * scale;
      
      const x = r * Math.cos(u);
      const y = r * Math.sin(u);
      const z = (Math.cos(v) * 8 * scale) * 0.5; // Flatten slightly
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }

  static generateTorusKnot(count, scale) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2 * 3; // 3 loops
      
      // Trefoil knot
      const p = 2;
      const q = 3;
      const r = 4 + Math.cos(q * t / p);
      
      const x = r * Math.cos(t) * 2 * scale;
      const y = r * Math.sin(t) * 2 * scale;
      const z = Math.sin(q * t / p) * 3 * scale;
      
      // Add volume
      const tubeRadius = 1.0 * scale;
      const theta = Math.random() * Math.PI * 2;
      const tubeR = Math.random() * tubeRadius;
      
      positions[i * 3] = x + tubeR * Math.cos(theta);
      positions[i * 3 + 1] = y + tubeR * Math.sin(theta);
      positions[i * 3 + 2] = z + tubeR * Math.cos(theta); // Simplified volume
    }
    return positions;
  }

  static generateDNA(count, scale) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 10; // Length
      const radius = 4 * scale;
      const isStrand1 = Math.random() > 0.5;
      
      let x, y, z;
      
      if (Math.random() > 0.8) {
        // Base pairs (connecting rungs)
        const rungT = Math.floor(Math.random() * 20) * (Math.PI / 2); // Discrete rungs
        const lerp = Math.random(); // Position along the rung
        
        const x1 = Math.cos(rungT) * radius;
        const z1 = Math.sin(rungT) * radius;
        const x2 = Math.cos(rungT + Math.PI) * radius;
        const z2 = Math.sin(rungT + Math.PI) * radius;
        
        x = x1 + (x2 - x1) * lerp;
        z = z1 + (z2 - z1) * lerp;
        y = (rungT - Math.PI * 5) * 2 * scale; // Vertical position
      } else {
        // Double Helix strands
        const offset = isStrand1 ? 0 : Math.PI;
        x = Math.cos(t + offset) * radius;
        z = Math.sin(t + offset) * radius;
        y = (t - Math.PI * 5) * 2 * scale;
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }

  static generateFireworks(count, scale) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Explosion bursts
      const r = Math.pow(Math.random(), 1/3) * 15 * scale;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Create trails
      const trail = Math.pow(Math.random(), 4); // Concentrate near center or edge?
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }

  static generateAtomic(count, scale) {
    const positions = new Float32Array(count * 3);
    const nucleusCount = Math.floor(count * 0.2);
    const electronCount = count - nucleusCount;
    
    // Nucleus
    for (let i = 0; i < nucleusCount; i++) {
      const r = 2 * scale * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    
    // Electrons (Orbitals)
    const orbits = 3;
    for (let i = nucleusCount; i < count; i++) {
      const orbitIdx = Math.floor(Math.random() * orbits);
      const angle = Math.random() * Math.PI * 2;
      const radius = (8 + orbitIdx * 4) * scale;
      
      // Random tilt for each orbit
      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius;
      let z = (Math.random() - 0.5) * scale; // Thin band
      
      // Rotate based on orbit index
      const tiltX = orbitIdx * Math.PI / 3;
      const tiltY = orbitIdx * Math.PI / 4;
      
      // Simple rotation logic (can be optimized)
      let y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
      let z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
      y = y1; z = z1;
      
      let x1 = x * Math.cos(tiltY) + z * Math.sin(tiltY);
      let z2 = -x * Math.sin(tiltY) + z * Math.cos(tiltY);
      x = x1; z = z2;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }
}
