import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import '../css/site.css';

function Shape() {
    const meshRef = useRef();

    // Animation loop
    useFrame((state) => {
        const elapsedTime = state.clock.getElapsedTime();
        meshRef.current.rotation.y = elapsedTime * 0.3;
        meshRef.current.rotation.x = elapsedTime * 0.15;
    });

    return (
        <mesh ref={meshRef}>
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
    return (
        <div className="canvas">
            <Canvas
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh' }}
                camera={{ position: [0, 0, 3] }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#21282a']} />

                {/* Lights */}
                <pointLight position={[2, 3, 4]} intensity={30} />
                <ambientLight intensity={0.5} />

                {/* 3D Objects */}
                <Shape />

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