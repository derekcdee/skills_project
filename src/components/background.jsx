import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Decal, Edges } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import '../css/site.css';

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

function Wormhole({ visible, entered }) {
  const { camera } = useThree();
  const tubeRef = useRef();
  const entranceRef = useRef();
  const progressRef = useRef(0);
  const initialCameraPos = useRef(new THREE.Vector3(0, 0, 3));
  const animationActive = useRef(false);
  
  useEffect(() => {
    if (camera) {
      initialCameraPos.current = camera.position.clone();
    }
  }, []);

  const [fullPath, tubeGeometry, visibleSpline] = useMemo(() => {
    const cameraStartPoint = initialCameraPos.current.clone();
    
    const approachPoints = [
      cameraStartPoint,
      new THREE.Vector3(0, 0, 2), 
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -3.5),
    ];
    
    const wormholePoints = [
      new THREE.Vector3(0, 0, -5),
      new THREE.Vector3(0, 0, -8),
      new THREE.Vector3(0, 0, -12),
      new THREE.Vector3(0, 0, -16),
      new THREE.Vector3(1, 0.5, -18),
      new THREE.Vector3(2, 1, -22),
      new THREE.Vector3(1, 2, -26),
      new THREE.Vector3(-1, 1, -30),
      new THREE.Vector3(-2, -1, -34),
      new THREE.Vector3(0, -2, -38),
      new THREE.Vector3(2, -1, -42),
      new THREE.Vector3(1, 1, -46),
      new THREE.Vector3(0, 0, -50),
      new THREE.Vector3(0, 0, -55),
      new THREE.Vector3(0, 0, -60)
    ];
    
    const allPoints = [...approachPoints, ...wormholePoints];
    
    const fullCameraPath = new THREE.CatmullRomCurve3(allPoints);
    fullCameraPath.closed = false;
    
    const visiblePath = new THREE.CatmullRomCurve3(wormholePoints);
    visiblePath.closed = false;
    
    const tubularSegments = 300;
    const radius = 1.2;
    const radialSegments = 24;
    const closed = false;
    
    const geometry = new THREE.TubeGeometry(
      visiblePath,
      tubularSegments,
      radius,
      radialSegments,
      closed
    );
  
    return [fullCameraPath, geometry, visiblePath];
  }, []);

  const pathRatio = useMemo(() => {
    return 5 / (5 + 15);
  }, []);

  const entranceGeometry = useMemo(() => {
    const entrancePoint = new THREE.Vector3(0, 0, -5);
    
    const points = [];
    const segments = 40;
    const tubeRadius = 1.2;
    const flareRadius = 6.0;
    const flareLength = 8.0;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      
      const curveFunction = Math.pow(t, 0.25); 
      
      const ripple = Math.sin(t * Math.PI * 3) * 0.05 * Math.pow(1 - t, 1.5);
      
      const radius = tubeRadius + (flareRadius - tubeRadius) * Math.pow(1 - t, 2.2) + ripple;
      
      const y = flareLength * (1 - t) - 2 * Math.pow(1 - t, 2) * Math.sqrt(t);
      
      points.push(new THREE.Vector2(radius, y));
    }
    
    const rimThickness = 0.15;
    points.unshift(new THREE.Vector2(flareRadius + rimThickness, flareLength + 0.2));
    points.unshift(new THREE.Vector2(flareRadius + rimThickness * 0.5, flareLength + 0.3));
    
    const latheGeometry = new THREE.LatheGeometry(
      points, 
      48,
      0,
      Math.PI * 2
    );
    
    latheGeometry.rotateX(Math.PI / 2);
    
    latheGeometry.translate(entrancePoint.x, entrancePoint.y, entrancePoint.z + 0.05);
    
    return latheGeometry;
  }, []);

  useEffect(() => {
    if (entered) {
      progressRef.current = 0;
      animationActive.current = true;
    }
  }, [entered]);

  useFrame((state, delta) => {
    if (entranceRef.current) {
      entranceRef.current.rotation.z += delta * 0.1;
    }
  
    if (!entered || !animationActive.current || !fullPath) return;
    
    const speed = 0.16;
    progressRef.current += delta * speed;
    
    progressRef.current = Math.min(progressRef.current, 0.995);
    
    const pos = fullPath.getPointAt(progressRef.current);
    
    const lookAheadAmount = 0.01;
    const lookAhead = Math.min(progressRef.current + lookAheadAmount, 0.999);
    const lookAt = fullPath.getPointAt(lookAhead);
    
    camera.position.copy(pos);
    camera.lookAt(lookAt);
    
    const time = state.clock.getElapsedTime();
    const roll = Math.sin(time * 0.3) * 0.03;
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  });

  const boxes = useMemo(() => {
    const numBoxes = 450;
    const result = [];

    if (!visibleSpline) return [];

    for (let i = 0; i < numBoxes; i++) {
      const p = i / numBoxes;
      const pos = visibleSpline.getPointAt(p);
      
      const randomDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5
      ).normalize();
      
      const scale = 0.7 + Math.random() * 0.3;
      pos.x += randomDirection.x * scale;
      pos.y += randomDirection.y * scale;
      pos.z += randomDirection.z * 0.1;
      
      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;
      const rotZ = Math.random() * Math.PI;
      
      const baseHue = 0.6 - p * 0.3;
      const variation1 = Math.sin(p * Math.PI * 8) * 0.15;
      const variation2 = Math.sin(p * Math.PI * 20) * 0.05;
      const randomOffset = (Math.random() - 0.5) * 0.1;
      
      let hue = (baseHue + variation1 + variation2 + randomOffset) % 1;
      if (hue < 0) hue += 1;
      
      result.push({
        position: [pos.x, pos.y, pos.z],
        rotation: [rotX, rotY, rotZ],
        hue,
        scale: 0.05 + Math.random() * 0.07
      });
    }

    return result;
  }, [visibleSpline]);

  return (
    <group>
      <mesh ref={tubeRef}>
        <primitive object={tubeGeometry} attach="geometry" />
        <meshStandardMaterial 
          color="#00aa00" 
          wireframe={true} 
          wireframeLinewidth={1.2}
          emissive="#aaaaaa"
          emissiveIntensity={1.8}
          opacity={1}
          transparent={true}
        />
      </mesh>

      <mesh ref={entranceRef}>
        <primitive object={entranceGeometry} attach="geometry" />
        <meshStandardMaterial 
          color="#00aa00" 
          wireframe={true} 
          wireframeLinewidth={1.5}
          emissive="#aaaaaa"
          emissiveIntensity={1.8}
          opacity={1}
          transparent={true}
        />
      </mesh>
      
      <EntranceSuckingCubes visible={visible} entered={entered} />
      <RainbowCubeField />
      
      {boxes.map((box, i) => (
        <mesh
          key={i}
          position={box.position}
          rotation={box.rotation}
        >
          <boxGeometry args={[box.scale, box.scale, box.scale]} />
          <meshStandardMaterial
            wireframe={true}
            color={new THREE.Color().setHSL(box.hue, 1, 0.6)}
            emissive={new THREE.Color().setHSL(box.hue, 0.9, 0.4)}
            emissiveIntensity={1.5}
            fog={true}
            opacity={1}
            transparent={true}
          />
        </mesh>
      ))}
    </group>
  );
}

function EntranceSuckingCubes({ visible, entered }) {
  const cubes = useMemo(() => {
    const count = 150;
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 5 + Math.random() * 15;
      
      const speed = 1 + Math.random() * 3;
      
      const scale = 0.05 + Math.random() * 0.1;
      
      const hue = Math.random();
      
      result.push({
        position: [x, y, z],
        initialPosition: [x, y, z],
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        rotationSpeed: [(Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 1.0],
        speed,
        scale,
        hue,
        offset: Math.random() * Math.PI * 2
      });
    }
    
    return result;
  }, []);
  
  const cubeRefs = useRef([]);
  
  useEffect(() => {
    cubeRefs.current = cubeRefs.current.slice(0, cubes.length);
  }, [cubes.length]);
  
  useFrame((state, delta) => {
    if (entered) return;
    
    cubes.forEach((cube, i) => {
      if (cubeRefs.current[i]) {
        const x = cubeRefs.current[i].position.x;
        const y = cubeRefs.current[i].position.y;
        const z = cubeRefs.current[i].position.z;
        
        const targetX = 0;
        const targetY = 0;
        const targetZ = -7;
        
        const distanceToGo = Math.sqrt(
          Math.pow(targetX - x, 2) + 
          Math.pow(targetY - y, 2) + 
          Math.pow(targetZ - z, 2)
        );
        
        const speedFactor = 1 + (5 / (distanceToGo + 1));
        const moveAmount = delta * cube.speed * speedFactor;
        
        const dirX = targetX - x;
        const dirY = targetY - y;
        const dirZ = targetZ - z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        const time = state.clock.getElapsedTime() + cube.offset;
        const spiralFactor = Math.max(0, Math.min(1, z / 10)) * 0.5;
        const spiralX = Math.sin(time * 2) * spiralFactor;
        const spiralY = Math.cos(time * 2) * spiralFactor;
        
        cubeRefs.current[i].position.x += (dirX / length) * moveAmount + spiralX * delta;
        cubeRefs.current[i].position.y += (dirY / length) * moveAmount + spiralY * delta;
        cubeRefs.current[i].position.z += (dirZ / length) * moveAmount;
        
        cubeRefs.current[i].rotation.x += delta * cube.rotationSpeed[0] * speedFactor;
        cubeRefs.current[i].rotation.y += delta * cube.rotationSpeed[1] * speedFactor;
        cubeRefs.current[i].rotation.z += delta * cube.rotationSpeed[2] * speedFactor;
        
        if (cubeRefs.current[i].position.z <= -7) {
          const newAngle = Math.random() * Math.PI * 2;
          const newRadius = 3 + Math.random() * 10;
          cubeRefs.current[i].position.x = Math.cos(newAngle) * newRadius;
          cubeRefs.current[i].position.y = Math.sin(newAngle) * newRadius;
          cubeRefs.current[i].position.z = 5 + Math.random() * 15;
        }
      }
    });
  });
  
  if (!visible || entered) return null;
  
  return (
    <group>
      {cubes.map((cube, i) => (
        <mesh
          key={`entrance-cube-${i}`}
          ref={el => cubeRefs.current[i] = el}
          position={cube.position}
          rotation={cube.rotation}
        >
          <boxGeometry args={[cube.scale, cube.scale, cube.scale]} />
          <meshStandardMaterial
            wireframe={true}
            color={new THREE.Color().setHSL(cube.hue, 1, 0.6)}
            emissive={new THREE.Color().setHSL(cube.hue, 0.9, 0.4)}
            emissiveIntensity={3}
            opacity={1}
            transparent={true}
          />
        </mesh>
      ))}
    </group>
  );
}

function RainbowCubeField() {
  const cubes = useMemo(() => {
    const count = 400;
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = 15 + Math.random() * 20;
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
      const z = -60 - Math.random() * 20;
      
      const rotSpeedX = (Math.random() - 0.5) * 2.0;
      const rotSpeedY = (Math.random() - 0.5) * 2.0;
      const rotSpeedZ = (Math.random() - 0.5) * 2.0;
      
      const moveSpeed = 1 + Math.random() * 2;
      
      const scale = 0.05 + Math.random() * 0.15;
      
      const hue = Math.random();
      
      result.push({
        position: [x, y, z],
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        rotationSpeed: [rotSpeedX, rotSpeedY, rotSpeedZ],
        moveSpeed,
        scale,
        hue
      });
    }
    
    return result;
  }, []);
  
  const cubeRefs = useRef([]);
  
  useEffect(() => {
    cubeRefs.current = cubeRefs.current.slice(0, cubes.length);
  }, [cubes.length]);
  
  useFrame((state, delta) => {
    cubes.forEach((cube, i) => {
      if (cubeRefs.current[i]) {
        cubeRefs.current[i].rotation.x += delta * cube.rotationSpeed[0];
        cubeRefs.current[i].rotation.y += delta * cube.rotationSpeed[1];
        cubeRefs.current[i].rotation.z += delta * cube.rotationSpeed[2];
        
        cubeRefs.current[i].position.x -= delta * cube.moveSpeed;
        
        if (cubeRefs.current[i].position.x < -30) {
          cubeRefs.current[i].position.x = 30 + Math.random() * 10;
          cubeRefs.current[i].position.y = (Math.random() - 0.5) * 20;
        }
      }
    });
  });
  
  return (
    <group>
      {cubes.map((cube, i) => (
        <mesh
          key={`rainbow-${i}`}
          ref={el => cubeRefs.current[i] = el}
          position={cube.position}
          rotation={cube.rotation}
        >
          <boxGeometry args={[cube.scale, cube.scale, cube.scale]} />
          <meshStandardMaterial
            wireframe={true}
            color={new THREE.Color().setHSL(cube.hue, 1, 0.6)}
            emissive={new THREE.Color().setHSL(cube.hue, 0.9, 0.4)}
            emissiveIntensity={2.0}
            opacity={1}
            transparent={true}
          />
        </mesh>
      ))}
    </group>
  );
}

function TextDecal() {
  const textCanvas = useRef(document.createElement('canvas'));
  const [decalTexture, setDecalTexture] = useState(null);
  
  useEffect(() => {
    const canvas = textCanvas.current;
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText('ENTER', canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    setDecalTexture(texture);
  }, []);
  
  if (!decalTexture) return null;
  
  return (
    <Decal
      position={[0, 0, 0.051]}
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
    
    const handlePointerOver = () => setHovered(true);
    const handlePointerOut = () => setHovered(false);
    const handleClick = () => {
        setClicked(true);
        onEnter();
    };
    
    useFrame((state) => {
        if (clicked) {
            boxRef.current.position.z -= 0.15;
            boxRef.current.rotation.y += 0.05;
            boxRef.current.scale.multiplyScalar(0.98);
            
            if (boxRef.current.scale.x < 0.1) {
                boxRef.current.visible = false;
            }
        } else {
            boxRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
            boxRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
        }
    });
    
    return (
        <group ref={boxRef} position={[0, 0, 0.4]}>
            <mesh
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                castShadow
            >
                <boxGeometry args={[1.5, 0.8, 0.1]} />
                <meshStandardMaterial 
                    color={hovered ? '#eeeeee' : '#ffffff'} 
                    metalness={0.3}
                    roughness={0.1}
                    emissive={hovered ? "#bbbbbb" : "#cccccc"}
                    emissiveIntensity={0.3}
                />
                <TextDecal />
            </mesh>
        </group>
    );
}

const Background = ({ setExited }) => {
    const [entered, setEntered] = useState(false);
    
    const handleEnter = () => {
        setTimeout(() => {
            setEntered(true);
        }, 1000);
    };

  useEffect(() => {
    if (entered) {
      const journeyDuration = 6000;
      const timer = setTimeout(() => {
        setExited(true);
      }, journeyDuration);

      return () => clearTimeout(timer);
    }
  }, [entered, setExited]);
    
    return (
        <div className="canvas" style={{ pointerEvents: 'auto' }}>
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

                <fog
                    attach="fog"
                    color="#000000"
                    near={2}
                    far={6}
                />

                <pointLight position={[2, 3, 4]} intensity={30} />
                <ambientLight intensity={0.5} />
                
                <Wormhole visible={true} entered={entered} />

                {!entered && <EnterBox onEnter={handleEnter} />}

                <EffectComposer>
                    <Bloom 
                        intensity={2.0}
                        luminanceThreshold={0.0}
                        luminanceSmoothing={0.4}
                        radius={0.8}
                    />
                </EffectComposer>

                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default Background;