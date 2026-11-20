import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { sampleStudioMotion } from './studioMotion.js';

// All equipment is modeled locally: no model downloads or third-party requests.
export function createStudioScene(host, onReady) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const view = new THREE.PerspectiveCamera(33, 1, .1, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const dark = new THREE.MeshStandardMaterial({ color: '#222629', metalness: .45, roughness: .32 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#121719', roughness: .78 });
  const silver = new THREE.MeshStandardMaterial({ color: '#707b83', metalness: .85, roughness: .23 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#173b50', metalness: .65, roughness: .09, clearcoat: 1 });
  const white = new THREE.MeshStandardMaterial({ color: '#969fa1', metalness: .4, roughness: .32 });
  const led = new THREE.MeshStandardMaterial({ color: '#b6edd5', emissive: '#76ba91', emissiveIntensity: 2 });
  function mesh(parent, geometry, material, x=0, y=0, z=0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  const box = (p,w,h,d,mat,x=0,y=0,z=0,r=.06) => mesh(p,new RoundedBoxGeometry(w,h,d,3,r),mat,x,y,z);
  function cylinder(p, radius, length, mat, x=0,y=0,z=0) {
    return mesh(p,new THREE.CylinderGeometry(radius,radius,length,40),mat,x,y,z);
  }
  const textures = [];
  function label(parent, text, width, height, x, y, z, color = '#b3b6b5') {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = color; ctx.font = '500 48px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 64);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
    return mesh(parent, new THREE.PlaneGeometry(width,height), new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),x,y,z);
  }
  // Optical coating, aperture and fine machining make the lens read as glass, rather than a solid disc.
  const opticCanvas = document.createElement('canvas'); opticCanvas.width=256; opticCanvas.height=256;
  const optical = opticCanvas.getContext('2d');
  const gradient = optical.createRadialGradient(104,90,4,128,128,128);
  gradient.addColorStop(0,'#182c39'); gradient.addColorStop(.35,'#060c15');
  gradient.addColorStop(.58,'#182e3d'); gradient.addColorStop(.75,'#17212c');
  gradient.addColorStop(.9,'#263e48'); gradient.addColorStop(1,'#05080b');
  optical.fillStyle=gradient; optical.fillRect(0,0,256,256);
  optical.strokeStyle='#677a8c55'; optical.lineWidth=1;
  for(const r of [65,83,102,118]){optical.beginPath();optical.arc(128,128,r,0,Math.PI*2);optical.stroke();}
  optical.fillStyle='#010307'; optical.beginPath();
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9;optical.lineTo(128+33*Math.cos(a),128+33*Math.sin(a));}
  optical.closePath();optical.fill();
  optical.fillStyle='#c2e3f329'; optical.beginPath();optical.ellipse(91,76,23,9,-.6,0,Math.PI*2);optical.fill();
  const optics = new THREE.CanvasTexture(opticCanvas); optics.colorSpace=THREE.SRGBColorSpace; textures.push(optics);
  function lens(p,x,y,z,r=.32,depth=.38) {
    const barrel = cylinder(p,r,depth,rubber,x,y,z); barrel.rotation.x=Math.PI/2;
    for(let i=0;i<20;i++) {
      const ring=cylinder(p,r+(i%2?.006:.012),.008,dark,x,y,z-depth/2+i*depth/20); ring.rotation.x=Math.PI/2;
    }
    const front = mesh(p,new THREE.TorusGeometry(r*.91,r*.065,12,64),dark,x,y,z+depth/2+.015);
    const face = mesh(p,new THREE.CircleGeometry(r*.84,64),new THREE.MeshPhysicalMaterial({map:optics,roughness:.12,metalness:.3,clearcoat:1,clearcoatRoughness:.03}),x,y,z+depth/2+.008);
    return {front,face};
  }
  function rod(p,a,b,r,mat) {
    const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), delta=end.clone().sub(start);
    const m=cylinder(p,r,delta.length(),mat); m.position.copy(start.add(end).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); return m;
  }
  const rig = new THREE.Group(); scene.add(rig);
  const camera = new THREE.Group(); rig.add(camera); camera.position.set(-1.05,0,.2); camera.rotation.y=.12;
  const tripodLegs = [];
  for(let i=0;i<3;i++) {
    const angle=i*Math.PI*2/3+.3;
    const leg=new THREE.Group(); leg.position.set(0,2,0); camera.add(leg);
    const axis=new THREE.Vector3(Math.sin(angle),0,-Math.cos(angle));
    tripodLegs.push({leg,axis});
    const bottom=[Math.cos(angle)*.8,-1.92,Math.sin(angle)*.8];
    const mid=[Math.cos(angle)*.43,-.85,Math.sin(angle)*.43];
    rod(leg,[0,0,0],mid,.056,dark); rod(leg,mid,bottom,.036,silver);
    mesh(leg,new THREE.SphereGeometry(.075,16,12),rubber,...mid);
    mesh(leg,new THREE.SphereGeometry(.067,12,8),rubber,...bottom);
    rod(leg,[0,-1.07,0],mid,.017,dark);
  }
  cylinder(camera,.055,1.65,dark,0,1.58,0);
  cylinder(camera,.14,.16,dark,0,2.12,0);
  mesh(camera,new THREE.SphereGeometry(.12,24,16),silver,0,2.19,0);
  rod(camera,[.06,2.16,-.04],[.45,2.02,-.34],.025,silver);
  rod(camera,[.45,2.02,-.34],[.67,1.96,-.5],.04,rubber);
  box(camera,.5,.12,.38,dark,0,2.25,0);
  box(camera,1.12,.73,.48,dark,0,2.66,0,.12);
  box(camera,.81,.53,.025,rubber,-.08,2.65,-.252,.04);
  box(camera,.66,.41,.012,glass,-.08,2.65,-.27,.025);
  box(camera,.32,.76,.66,rubber,.45,2.65,.06,.13);
  for(let i=0;i<16;i++)box(camera,.21,.008,.012,dark,.46,2.43+i*.027,.396,.003);
  box(camera,.4,.24,.37,dark,-.03,3.09,-.04,.07);
  box(camera,.25,.13,.08,rubber,-.03,3.11,-.245,.025);
  box(camera,.17,.035,.12,silver,-.02,3.2,0);
  cylinder(camera,.11,.055,dark,.36,3.065,-.04);
  cylinder(camera,.065,.025,silver,.44,3.07,.22);
  cylinder(camera,.085,.045,dark,-.4,3.06,-.03);
  label(camera,'ARKO',.27,.067,-.03,3.1,.151);
  label(camera,'α 7',.1,.06,-.43,2.93,.25);
  label(camera,'24–70 / 2.8',.29,.045,-.13,2.84,.706);
  for(const x of [-.58,.59]){const loop=mesh(camera,new THREE.TorusGeometry(.045,.012,8,16),silver,x,2.94,0);loop.rotation.y=Math.PI/2;}
  lens(camera,-.13,2.67,.48,.37,.56);
  box(camera,.19,.09,.025,white,-.34,2.94,.25,.015);
  const flash = new THREE.PointLight('#e9f7ff',0,8); flash.position.set(-.34,2.91,.6); camera.add(flash);
  const flashGlow = mesh(camera,new THREE.PlaneGeometry(.7,.35),new THREE.MeshBasicMaterial({color:'#edfaff',transparent:true,opacity:0,depthWrite:false}),-.34,2.91,.26);
  const drone = new THREE.Group(); rig.add(drone);
  box(drone,.61,.27,.91,white,0,0,0,.12);
  box(drone,.46,.035,.53,dark,0,.145,-.13,.02);
  for(let i=0;i<7;i++)box(drone,.3,.008,.012,rubber,0,.166,-.32+i*.055,.003);
  label(drone,'ARKO AIR',.3,.065,0,.02,.462);
  for(const x of [-.2,.2]){lens(drone,x,-.01,.43,.045,.03);}
  box(drone,.37,.05,.5,dark,0,.14,-.03);
  const rotors=[];
  for(const x of [-1,1]) for(const z of [-1,1]) {
    rod(drone,[x*.22,0,z*.24],[x*.91,.025,z*.68],.05,dark);
    mesh(drone,new THREE.SphereGeometry(.082,16,12),dark,x*.27,0,z*.28);
    cylinder(drone,.1,.16,dark,x*.91,.08,z*.68);
    const rotor=new THREE.Group(); rotor.position.set(x*.91,.18,z*.68); drone.add(rotor);
    const blade=box(rotor,.84,.014,.075,rubber,0,0,0,.03); blade.rotation.z=.04;
    // Short translucent trails suggest shutter blur instead of frozen propeller blades.
    for (let trail=1;trail<=3;trail++) {
      const ghost=new THREE.Mesh(blade.geometry,new THREE.MeshStandardMaterial({color:'#273034',roughness:.7,transparent:true,opacity:.12/trail,depthWrite:false}));
      ghost.rotation.y=-trail*.22; ghost.rotation.z=.04; ghost.castShadow=false; rotor.add(ghost);
    }
    cylinder(rotor,.055,.035,silver); rotors.push(rotor);
    rod(drone,[x*.32,-.04,z*.25],[x*.43,-.35,z*.33],.025,dark);
    mesh(drone,new THREE.SphereGeometry(.035,12,8),led,x*.94,.04,z*.68);
  }
  rod(drone,[-.17,-.1,.3],[-.17,-.27,.4],.022,silver);
  rod(drone,[.17,-.1,.3],[.17,-.27,.4],.022,silver);
  box(drone,.25,.22,.24,dark,0,-.26,.37,.06); lens(drone,0,-.26,.52,.1,.13);
  const tour = new THREE.Group(); rig.add(tour); tour.position.set(.45,.03,1.35); tour.rotation.y=-.3;
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(tour,[0,.32,0],[Math.cos(a)*.33,.025,Math.sin(a)*.33],.025,dark);}
  cylinder(tour,.028,.9,dark,0,.5,0);
  box(tour,.35,1.04,.24,rubber,0,1.38,0,.11);
  box(tour,.33,.34,.245,dark,0,1.7,0,.09);
  const rearLens = new THREE.Group(); rearLens.rotation.y=Math.PI; tour.add(rearLens); lens(rearLens,0,1.7,.17,.145,.12);
  label(tour,'360',.14,.045,0,1.02,.126);
  lens(tour,0,1.7,.17,.155,.12);
  box(tour,.21,.3,.015,glass,0,1.25,.13,.025);
  cylinder(tour,.03,.008,silver,0,1.0,.14).rotation.x=Math.PI/2;
  mesh(tour,new THREE.SphereGeometry(.023,12,8),led,0,.99,.13);
  // Three motor axes: the handle moves while the mounted camera stays level.
  const gimbal = new THREE.Group(); rig.add(gimbal); gimbal.position.set(1.85,0,-.2);
  for (let i=0;i<3;i++) {
    const angle=i*Math.PI*2/3+.25;
    rod(gimbal,[0,.37,0],[Math.cos(angle)*.42,.035,Math.sin(angle)*.42],.035,dark);
    mesh(gimbal,new THREE.SphereGeometry(.047,12,8),rubber,Math.cos(angle)*.42,.035,Math.sin(angle)*.42);
  }
  const handle = new THREE.Group(); handle.position.y=.38; gimbal.add(handle);
  cylinder(handle,.085,.78,rubber,0,.39,0);
  for(let i=0;i<12;i++)cylinder(handle,.087,.012,dark,0,.08+i*.036,0);
  box(handle,.115,.19,.025,glass,0,.58,.084,.018);
  cylinder(handle,.024,.022,silver,0,.43,.097).rotation.x=Math.PI/2;
  mesh(handle,new THREE.SphereGeometry(.014,12,8),led,0,.73,.09);
  label(handle,'ARKO',.1,.034,0,.26,.09);
  cylinder(handle,.12,.16,dark,0,.86,0);
  cylinder(handle,.122,.023,silver,0,.94,0);

  const yaw = new THREE.Group(); yaw.position.y=.97; handle.add(yaw);
  rod(yaw,[0,0,0],[.29,.32,-.16],.055,dark);
  const rollMotor=cylinder(yaw,.13,.12,dark,.29,.36,-.16);rollMotor.rotation.x=Math.PI/2;
  const rollCap=cylinder(yaw,.095,.015,silver,.29,.36,-.225);rollCap.rotation.x=Math.PI/2;
  const roll = new THREE.Group(); roll.position.set(.29,.36,-.16); yaw.add(roll);
  box(roll,.08,.34,.09,dark,-.2,.14,.02,.025);
  rod(roll,[-.2,.28,.02],[-.35,.28,.26],.045,dark);
  const pitchMotor=cylinder(roll,.11,.12,dark,-.36,.28,.26);pitchMotor.rotation.z=Math.PI/2;
  const pitchCap=cylinder(roll,.08,.016,silver,-.425,.28,.26);pitchCap.rotation.z=Math.PI/2;
  const stabilizedCamera = new THREE.Group(); stabilizedCamera.position.set(-.05,.28,.26); roll.add(stabilizedCamera);
  box(stabilizedCamera,.71,.06,.42,silver,0,-.2,0,.018);
  box(stabilizedCamera,.66,.45,.32,dark,0,.06,0,.07);
  box(stabilizedCamera,.2,.49,.42,rubber,.27,.04,.04,.07);
  box(stabilizedCamera,.24,.14,.26,dark,-.03,.33,-.03,.035);
  cylinder(stabilizedCamera,.065,.04,dark,.24,.31,-.02);
  cylinder(stabilizedCamera,.042,.022,silver,.3,.3,.14);
  lens(stabilizedCamera,-.07,.07,.28,.235,.38);
  box(stabilizedCamera,.4,.27,.015,glass,-.05,.08,-.17,.025);
  label(stabilizedCamera,'ARKO',.18,.045,-.03,.34,.105);
  label(yaw,'3 AXIS',.2,.045,.06,.13,.035);
  const floor=mesh(scene,new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.16}),0,-.025,0);
  floor.rotation.x=-Math.PI/2; floor.castShadow=false;
  scene.add(new THREE.HemisphereLight('#c3d5e9','#29221d',1.2));
  const key = new THREE.DirectionalLight('#fff1db',4); key.position.set(-3,7,5); key.castShadow=true;
  key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-5; key.shadow.camera.right=5;
  key.shadow.camera.top=6; key.shadow.camera.bottom=-4; key.shadow.normalBias=.03; key.shadow.radius=4; scene.add(key);
  const rim = new THREE.DirectionalLight('#9bbfe9',4); rim.position.set(3,4,-4); scene.add(rim);
  const softbox = new THREE.DirectionalLight('#ffffff',1.5);softbox.position.set(1,2,6);scene.add(softbox);
  let disposed=false, visible=true, paused=false, frame=0, elapsed=0, last=0;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=new THREE.Vector2();
  const move=e=>{const b=host.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width-.5,(e.clientY-b.top)/b.height-.5);};
  host.addEventListener('pointermove',move);
  const leave=()=>pointer.set(0,0); host.addEventListener('pointerleave',leave);
  function resize() {
    const w=host.clientWidth,h=host.clientHeight; if(!w||!h)return;
    renderer.setSize(w,h); view.aspect=w/h;
    view.position.set(3.6,3.3,11.5); view.lookAt(.2,1.65,0);
    view.fov=w/h<1?39:32; view.updateProjectionMatrix(); render(elapsed);
  }
  const pointerSmoothed = new THREE.Vector2();
  let lastRenderTime = null;
  function applyPose(object, pose) {
    object.position.fromArray(pose.position);
    object.rotation.fromArray([...pose.rotation, 'XYZ']);
  }
  function render(t) {
    const still=motion.matches;
    const pose=sampleStudioMotion(t,still);
    applyPose(camera,pose.camera);
    tripodLegs.forEach(({leg,axis})=>leg.quaternion.setFromAxisAngle(axis,pose.camera.legFold));
    applyPose(drone,pose.drone);
    applyPose(tour,pose.tour);
    applyPose(gimbal,pose.gimbal);
    handle.rotation.z=pose.gimbal.handleRoll;
    yaw.rotation.y=pose.gimbal.pan;
    roll.rotation.z=pose.gimbal.counterRoll;
    stabilizedCamera.rotation.x=pose.gimbal.pitch;
    flash.intensity=pose.flash*12; flashGlow.material.opacity=pose.flash*.9;
    rotors.forEach((rotor,i)=>rotor.rotation.y=pose.time*65*(i%2?1:-1));
    // Smooth pointer input instead of snapping the whole scene to each mouse event.
    const delta=lastRenderTime===null?0:Math.max(0,t-lastRenderTime);
    lastRenderTime=t;
    pointerSmoothed.lerp(still?new THREE.Vector2():pointer,1-Math.exp(-delta*4));
    rig.rotation.y=still?0:pointerSmoothed.x*.12;
    rig.rotation.x=still?0:pointerSmoothed.y*.025;
    renderer.render(scene,view);
  }
  function tick(now) {
    frame=0; if(disposed||!visible||document.hidden)return;
    if(last)elapsed+=Math.min((now-last)/1000,.05);last=now;
    render(elapsed);
    if(!paused&&!motion.matches)frame=requestAnimationFrame(tick);
  }
  function start(){last=0;if(!frame&&!disposed)frame=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;last=0;}});
  observer.observe(host);
  const visibility=()=>{if(!document.hidden)start();}; document.addEventListener('visibilitychange',visibility);
  const change=()=>{cancelAnimationFrame(frame);frame=0;start();}; motion.addEventListener('change',change);
  const size=new ResizeObserver(resize); size.observe(host); resize(); start(); onReady();
  return {
    setPaused(value){paused=value;cancelAnimationFrame(frame);frame=0;if(!paused)start();},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();size.disconnect();motion.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(texture=>texture.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
