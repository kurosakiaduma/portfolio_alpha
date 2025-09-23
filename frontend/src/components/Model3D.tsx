// Model3D.tsx - 3D model renderer component using Three.js
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface Model3DProps {
  modelPath: string;
  containerClass?: string;
  size?: { width: number; height: number };
  autoRotate?: boolean;
  cameraPosition?: [number, number, number];
}

export default function Model3D({
  modelPath,
  containerClass = '',
  size = { width: 300, height: 300 },
  autoRotate = true,
  cameraPosition = [0, 1, 4]
}: Model3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      size.width / size.height,
      0.1,
      1000
    );
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Enable transparency
    });
    renderer.setSize(size.width, size.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    
    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffd5, 2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xff00aa, 1);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    // Model loading
    const loader = new GLTFLoader();
    let model: THREE.Object3D | null = null;

    console.log('Loading model:', modelPath);
    loader.load(
      modelPath,
      (gltf: any) => {
        console.log('Model loaded successfully:', modelPath, gltf);
        const model = gltf.scene;
        modelRef.current = model;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Scale the model if needed
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > 2) {
          const scale = 2 / maxDimension;
          model.scale.setScalar(scale);
        }
        
        // Enable shadows
        model.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply retro-style materials
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive = new THREE.Color(0x001122);
              child.material.emissiveIntensity = 0.1;
            }
          }
        });
        
        scene.add(model);
        
        // Store mixer for animations
        if (gltf.animations && gltf.animations.length > 0) {
          console.log('Found animations:', gltf.animations.length);
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip: any) => {
            console.log('Playing animation clip:', clip.name);
            mixerRef.current?.clipAction(clip).play();
          });
        } else {
          console.log('No animations found in model');
        }
      },
      (progress: any) => console.log('Loading progress:', progress),
      (error: any) => console.error('Error loading model:', modelPath, error)
    );    // Animation loop
    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      
      if (modelRef.current && autoRotate) {
        modelRef.current.rotation.y += 0.01;
      }
      
      if (mixerRef.current) {
        mixerRef.current.update(0.016); // 60fps
      }
      
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!renderer || !mountRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [modelPath, size.width, size.height, autoRotate, cameraPosition]);

  return (
    <div 
      ref={mountRef}
      className={`model-3d-container ${containerClass}`}
      style={{ 
        width: size.width,
        height: size.height,
        position: 'relative'
      }}
    />
  );
}
