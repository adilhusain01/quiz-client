import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const AnimatedBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Set up the Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Create a sphere geometry
    const geometry = new THREE.SphereGeometry(2.25, 12, 12);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; // Disable zoom
    controls.target.set(0, 0, 0);
    controls.update();

    // Animate the scene
    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.x += 0.004;
      sphere.rotation.y += 0.004;
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Clean up on component unmount
    return () => {
      container.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default AnimatedBackground;
