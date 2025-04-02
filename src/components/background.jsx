import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Decal, Edges } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import '../css/site.css';

// Spline data for the wormhole path
const createSplinePoints = () => {
  const curvePath = [
    10.136184463414924, -1.374508746897471, 10.384881573913269,
    9.1152593889854714, -1.374508746897471, 8.5846792797570011,
    9.0669355709754882, -1.0665123466336568, 5.8937771631608156,
    10.151040177840205, -0.65913653144937956, 3.4340491740541346,
    10.806779203170416, 1.8859391007298545, 0.46855774212986023,
    10.761433540147586, 2.8724172201359197, -1.2811838605587311,
    9.6195923104445065, 2.8724172201359197, -3.2833099941904766,
    6.9763020889151646, 2.7659257976905427, -4.7591958908830172,
    6.0461277891353697, 1.0727045302089879, -6.6638740164090482,
    7.3472235778544794, -1.8228856326635698, -9.0685043046185623,
    7.226367212900791, -1.8228856326635698, -10.499536640855691,
    5.8354566696263914, -1.8228856326635698, -12.039219379199908,
    3.6532357452141353, -0.20463983570573391, -13.87695442281038,
    -0.30169589630131455, 1.5965000671484342, -14.879986418947327,
    -2.8925694230502157, 2.2971364614427481, -13.892095587598131,
    -4.537672295357936, 4.5863515759659208, -12.140831652074551,
    -6.1287913464117594, 5.9653814634119815, -8.9776527318875896,
    -6.0120301606452813, 4.4081161943855998, -6.712084358394045,
    -5.2138252159038974, 2.820894808418279, -4.4532820412085607,
    -2.3424712835109611, 2.2032065005086259, -3.0788773693500198,
    -0.0076956453915433265, 1.8931797788880202, -1.6577070662471063,
    -0.24767503988481437, 2.8845808465856684, 0.073915859214221724,
    -2.2174044353598896, 4.2415524507318576, 2.215992718290742,
    -3.4526531678364756, 3.0615192023340851, 4.7922404932096558,
    -3.7356278971556445, 1.4054080369354316, 7.8432021841434629,
    -3.4003734463804118, 1.1924069108769393, 9.2464090886227073,
    -1.8851803760476225, 1.5269331003449989, 10.306083896408374,
    0.01071077144031829, 2.1101821577522295, 10.490880699847727,
    0.42562058195647001, 2.2759939598834387, 11.613129436580291,
    0.096405262182225115, 0.032317784084054391, 16.223455375061565,
    2.3458797884520433, 0.38907275257695584, 19.91188266079584,
    5.7018400098488771, 1.73337964747396, 20.615481586999959,
    7.9720939736751824, 1.73337964747396, 19.303399329816457,
    9.8672362721095652, 0.090083018057025177, 16.893338541618121,
    11.225959519544134, -1.374508746897471, 14.279002555560753,
    11.288646925965876, -1.374508746897471, 11.926359497447137,
    10.136184463414924, -1.374508746897471, 10.384881573913269
  ];

  // Create points from coordinates
  const points = [];
  for (let p = 0; p < curvePath.length; p += 3) {
    points.push(new THREE.Vector3(
      curvePath[p],
      curvePath[p + 1],
      curvePath[p + 2]
    ));
  }
  
  return points;
};

// Wormhole component
function Wormhole({ visible }) {
  const { camera } = useThree();
  const tubeRef = useRef();
  const boxesRef = useRef([]);
  const progressRef = useRef(0);
  const initialCameraPos = useRef([0, 0, 3]);

  // Create spline and tube
  const [spline, tubeGeometry] = useMemo(() => {
    // Scale down the points to fit our scene better
    const scale = 0.15;
    const rawPoints = createSplinePoints();
    const scaledPoints = rawPoints.map(p => 
      new THREE.Vector3(p.x * scale, p.y * scale, p.z * scale)
    );
    
    // Create the curve
    const curve = new THREE.CatmullRomCurve3(scaledPoints);
    curve.closed = true;
    
    // Create tube geometry
    const tubularSegments = 222;
    const radius = 0.65;
    const radialSegments = 16;
    const closed = true;
    
    const geometry = new THREE.TubeGeometry(
      curve,
      tubularSegments,
      radius,
      radialSegments,
      closed
    );

    return [curve, geometry];
  }, []);

  // Create boxes along the path
  const boxes = useMemo(() => {
    const numBoxes = 55;
    const size = 0.075;
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const result = [];

    if (!spline) return [];

    for (let i = 0; i < numBoxes; i++) {
      const p = (i / numBoxes + Math.random() * 0.1) % 1;
      const pos = spline.getPointAt(p);
      pos.x += Math.random() - 0.4;
      pos.z += Math.random() - 0.4;
      
      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;
      const rotZ = Math.random() * Math.PI;
      
      // Calculate color based on position along path
      const hue = 0.7 - p;
      
      result.push({
        position: [pos.x, pos.y, pos.z],
        rotation: [rotX, rotY, rotZ],
        hue
      });
    }

    return result;
  }, [spline]);

  // Save initial camera position when first mounted
  useEffect(() => {
    if (camera) {
      initialCameraPos.current = [camera.position.x, camera.position.y, camera.position.z];
    }
  }, [camera]);

  // Camera animation along the spline
  useFrame((state) => {
    if (!visible || !spline) return;

    // Store the progress along the spline
    progressRef.current += 0.0005;
    if (progressRef.current >= 1) progressRef.current = 0;
    
    // Get position on the spline
    const p = progressRef.current;
    const pos = spline.getPointAt(p);
    const lookAt = spline.getPointAt((p + 0.03) % 1);

    // Update camera position and target
    camera.position.copy(pos);
    camera.lookAt(lookAt);
    
    // Slowly rotate the tube for additional effect
    if (tubeRef.current) {
      tubeRef.current.rotation.z += 0.0005;
    }
  });

  // Reset camera position when visibility changes
  useEffect(() => {
    if (!visible && camera) {
      const [x, y, z] = initialCameraPos.current;
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    }
  }, [visible, camera]);

  if (!visible) return null;

  return (
    <group>
      {/* Tube wireframe */}
      <mesh ref={tubeRef}>
        <primitive object={tubeGeometry} attach="geometry" />
        <meshBasicMaterial color="#ff0000" wireframe={true} />
      </mesh>

      {/* Boxes along the path */}
      {boxes.map((box, i) => (
        <mesh key={i} position={box.position} rotation={box.rotation}>
          <boxGeometry args={[0.075, 0.075, 0.075]} />
          <meshBasicMaterial visible={false} />
          <Edges color={new THREE.Color().setHSL(box.hue, 1, 0.5)} />
        </mesh>
      ))}
    </group>
  );
}

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
                    color={hovered ? '#444444' : '#ffffff'} 
                    metalness={0.5}
                    roughness={0.2}
                />
                <TextDecal />
            </mesh>
        </group>
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
                camera={{ position: [0, 0, 3], fov: 60 }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#000000']} />

                {/* Lights */}
                <pointLight position={[2, 3, 4]} intensity={30} />
                <ambientLight intensity={0.5} />

                {/* Interactive Enter Box */}
                {!entered && <EnterBox onEnter={handleEnter} />}
                
                {/* Wormhole instead of Shape */}
                <Wormhole visible={entered} />

                {/* Controls with full navigation enabled - disabled during wormhole */}
                <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    minDistance={1}
                    maxDistance={10}
                    zoomSpeed={0.5}
                    panSpeed={0.8}
                    rotateSpeed={0.4}
                    enabled={!entered}
                />

                {/* Post processing */}
                <EffectComposer>
                    <Bloom 
                        intensity={1.5}
                        luminanceThreshold={0.002}
                        luminanceSmoothing={0.4}
                        radius={0}
                    />
                </EffectComposer>

                {/* Environment */}
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default Background;