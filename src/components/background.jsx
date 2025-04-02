import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import '../css/site.css';

// Text decal component for the box face
function TextDecal() {
  // Create a canvas texture for the text
  const textCanvas = useRef(document.createElement('canvas'));
  const [decalTexture, setDecalTexture] = useState(null);
  
  useEffect(() => {
    // Set up canvas for rendering text
    const canvas = textCanvas.current;
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText('ENTER', canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    setDecalTexture(texture);
  }, []);
  
  if (!decalTexture) return null;
  
  return (
    <Decal
      position={[0, 0, 0.051]} // Just slightly in front of the box face
      rotation={[0, 0, 0]}
      scale={[1, 0.5, 1]}
      material-map={decalTexture}
      material-transparent={true}
      material-opacity={1}
    />
  );
}

function EnterBox({ onEnter }) {
    const boxRef = useRef();
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);
    
    // Handle hover and click events
    const handlePointerOver = () => setHovered(true);
    const handlePointerOut = () => setHovered(false);
    const handleClick = () => {
        setClicked(true);
        onEnter();
    };
    
    // Animation for the box
    useFrame((state) => {
        if (clicked) {
            // Animate box moving away or fading out after click
            boxRef.current.position.z -= 0.1;
            boxRef.current.rotation.y += 0.05;
            boxRef.current.scale.multiplyScalar(0.98);
            
            // Remove box when it's small enough
            if (boxRef.current.scale.x < 0.1) {
                boxRef.current.visible = false;
            }
        } else {
            // Subtle floating animation when not clicked
            boxRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
            boxRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
        }
    });
    
    return (
        <group ref={boxRef} position={[0, 0, 0]}>
            <mesh
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                castShadow
            >
                <boxGeometry args={[1.5, 0.8, 0.1]} />
                <meshStandardMaterial 
                    color={hovered ? '#444444' : '#ffffff'} // Darker grey on hover instead of orange
                    metalness={0.5}
                    roughness={0.2}
                />
                <TextDecal />
            </mesh>
        </group>
    );
}

function Shape({ visible }) {
    const meshRef = useRef();

    // Animation loop
    useFrame((state) => {
        const elapsedTime = state.clock.getElapsedTime();
        meshRef.current.rotation.y = elapsedTime * 0.3;
        meshRef.current.rotation.x = elapsedTime * 0.15;
    });

    return (
        <mesh 
            ref={meshRef} 
            visible={visible}
            position={[0, 0, -2]} // Start behind and move forward when visible
        >
            <torusKnotGeometry args={[0.8, 0.2, 100, 16]} />
            <meshStandardMaterial
                color={0x6495ed}
                roughness={0.5}
                metalness={0.7}
            />
        </mesh>
    );
}

// Main background component
const Background = () => {
    const [entered, setEntered] = useState(false);
    
    const handleEnter = () => {
        // Start the main animation after a short delay
        setTimeout(() => {
            setEntered(true);
        }, 1000);
    };
    
    return (
        <div 
            className="canvas" 
            style={{ pointerEvents: 'auto' }}
        >
            <Canvas
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100vh',
                    touchAction: 'none'
                }}
                camera={{ position: [0, 0, 3], fov: 50 }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#21282a']} />

                {/* Lights */}
                <pointLight position={[2, 3, 4]} intensity={30} />
                <ambientLight intensity={0.5} />

                {/* Interactive Enter Box */}
                {!entered && <EnterBox onEnter={handleEnter} />}
                
                {/* 3D Objects that appear after entering */}
                <Shape visible={entered} />

                {/* Controls with full navigation enabled */}
                <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    minDistance={1}
                    maxDistance={10}
                    zoomSpeed={0.5}
                    panSpeed={0.8}
                    rotateSpeed={0.4}
                />

                {/* Environment */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default Background;