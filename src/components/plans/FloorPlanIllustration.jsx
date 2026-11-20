import {useServiceMedia} from '../../lib/serviceMedia';
import { useId } from 'react';

export const planRooms = [
  { id:'living', label:'Living / comedor', description:'El área social conecta el acceso, la cocina y el balcón. El esquema permite entender esas relaciones sin recorrer la propiedad.', x:410,y:230,width:280,height:290,tx:550,ty:345,measure:'4,50 × 4,60 m',material:'wood' },
  { id:'kitchen', label:'Cocina', description:'La cocina se abre al comedor y mantiene su sector de trabajo identificado dentro de la distribución.', x:490,y:80,width:200,height:150,tx:597,ty:180,measure:'3,10 × 2,30 m',material:'tile' },
  { id:'bedroom-one', label:'Dormitorio 1', description:'El dormitorio principal se ubica en el sector privado, conectado por la circulación y con una abertura hacia el exterior.', x:90,y:80,width:240,height:200,tx:210,ty:258,measure:'3,80 × 3,20 m',material:'wood' },
  { id:'bedroom-two', label:'Dormitorio 2', description:'El segundo dormitorio se conecta con la misma circulación, sin atravesar otros ambientes privados.', x:90,y:280,width:240,height:240,tx:247,ty:430,measure:'3,80 × 3,80 m',material:'wood' },
  { id:'bathroom', label:'Baño', description:'El baño tiene acceso desde la circulación y una ubicación independiente de los dormitorios.', x:330,y:80,width:160,height:150,tx:440,ty:198,measure:'2,50 × 2,30 m',material:'tile' },
];

export default function FloorPlanIllustration({selected=null,stage='finished',className=''}) {
  const id=useId();
  const media=useServiceMedia('planos-2d');
  if(media.planImage)return <img className={`plan-illustration plan-custom-image ${className}`} src={media.planImage} alt={media.planCaption||'Ejemplo de plano esquemático'} loading="lazy"/>;
  return (
    <svg className={`plan-illustration plan-stage-${stage} ${className}`} viewBox="0 0 800 640" role="img" aria-labelledby={`${id}-title`}>
      <title id={`${id}-title`}>Plano esquemático ilustrativo de dos dormitorios, cocina integrada, baño y balcón. Distribución y medidas ficticias.</title>
      <defs>
        <pattern id={`${id}-wood`} width="45" height="11" patternUnits="userSpaceOnUse"><rect width="45" height="11" fill="#f0ebe2"/><path d="M0 10.7h45M22 0v11" stroke="#e0d9cc" strokeWidth=".55"/></pattern>
        <pattern id={`${id}-tile`} width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#efefea"/><path d="M20 0H0v20" fill="none" stroke="#dce0d7" strokeWidth=".65"/></pattern>
        <pattern id={`${id}-deck`} width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#e4e6dc"/><path d="M6.5 0v7" stroke="#cdd3c4" strokeWidth=".6"/></pattern>
      </defs>
      <rect width="800" height="640" fill="#fafaf5"/>
      <g className="plan-room-fills">
        <path d="M90 80H690V520H90Z" fill="#f4f2ec"/>
        {planRooms.map(room=><g key={room.id} data-room={room.id}><rect x={room.x} y={room.y} width={room.width} height={room.height} fill={`url(#${id}-${room.material})`}/><rect className="plan-room-highlight" x={room.x+5} y={room.y+5} width={room.width-10} height={room.height-10} fill="#b9c9a5" opacity={selected===room.id?.55:0}/></g>)}
        <path d="M695 235H750V515H695Z" fill={`url(#${id}-deck)`}/>
      </g>

      {/* Furniture is deliberately subordinate to walls, openings and room names. */}
      <g className="plan-furniture" stroke="#a9afa0" strokeWidth="1.1" strokeLinejoin="round">
        <g fill="#f8f6ef">
          <rect x="133" y="105" width="114" height="140" rx="3"/><path d="M134 109h112v9H134z" fill="#d2c5b2"/>
          <rect x="141" y="122" width="43" height="23" rx="4"/><rect x="195" y="122" width="43" height="23" rx="4"/>
          <path d="M135 153q55 9 111 0v89H135z" fill="#dfdfd3"/><path d="M140 156q49 10 101 0" fill="none"/>
          <rect x="108" y="112" width="20" height="27" rx="2"/><rect x="252" y="112" width="20" height="27" rx="2"/>
          <circle cx="118" cy="121" r="5" fill="#ddd7c6"/><circle cx="262" cy="121" r="5" fill="#ddd7c6"/>
          <rect x="103" y="96" width="17" height="160" fill="#e2d9ca"/><path d="M103 136h17m-17 40h17m-17 40h17"/>
          <rect x="112" y="310" width="74" height="134" rx="3"/><path d="M113 313h72v8h-72z" fill="#d2c5b2"/>
          <rect x="121" y="325" width="56" height="22" rx="4"/><path d="M114 355q35 6 70 0v86h-70z" fill="#d9dfd1"/>
          <rect x="190" y="316" width="19" height="25" rx="2"/>
          <rect x="219" y="297" width="68" height="23" rx="2" fill="#e1d7c8"/><rect x="235" y="300" width="30" height="15" rx="1" fill="#f1f0e9"/>
          <circle cx="252" cy="339" r="11" fill="#d7dfce"/>
          <rect x="104" y="491" width="183" height="17" fill="#e3dacb"/><path d="M149 491v17m46-17v17m46-17v17"/>
        </g>
        <g fill="#fafaf6">
          <path d="M507 95H675V202H652V120H507Z" fill="#dce0d5"/>
          <rect x="534" y="100" width="43" height="15" rx="3"/><rect x="537" y="102" width="19" height="11" rx="2"/><path d="M559 103v9"/>
          <rect x="655" y="147" width="17" height="29" rx="2" fill="#788276"/>
          <g stroke="#dce3d5" fill="none"><circle cx="660" cy="154" r="3"/><circle cx="668" cy="154" r="2"/><circle cx="660" cy="167" r="2"/><circle cx="668" cy="167" r="3"/></g>
          <rect x="506" y="176" width="33" height="41" rx="2" fill="#e4e6de"/><path d="M507 189h31"/>
          <rect x="345" y="95" width="68" height="67" rx="2" fill="#e1e7dd"/><path d="M349 158l59-59m-54 1 48 47" stroke="#c4cec1"/><circle cx="381" cy="129" r="3"/>
          <rect x="440" y="94" width="35" height="24" rx="4" fill="#dce2d7"/><ellipse cx="457" cy="106" rx="11" ry="7"/>
          <rect x="463" y="164" width="17" height="29" rx="8"/><rect x="463" y="160" width="17" height="8" rx="2" fill="#e1e5da"/>
        </g>
        <g>
          <rect x="426" y="372" width="203" height="128" rx="4" fill="#ebe8de" stroke="#dedbd0"/>
          <path d="M447 384H583V431H488V480H447Z" fill="#d6dfcd"/><path d="M452 389h126v13H462v73h-10z" fill="#c6d2bc"/>
          <path d="M464 403v24m38-24v24m38-24v24m-76 18h20" fill="none"/>
          <rect x="511" y="449" width="63" height="34" rx="7" fill="#d9c9ae"/><path d="M519 456h47" stroke="#c3b18f"/>
          <rect x="531" y="503" width="96" height="10" fill="#d0c1aa"/><path d="M540 504v7m27-7v7m28-7v7"/>
          <ellipse cx="568" cy="283" rx="48" ry="26" fill="#ddd1bc"/>
          <g fill="#d5dfcc"><rect x="534" y="244" width="20" height="13" rx="4"/><rect x="582" y="244" width="20" height="13" rx="4"/><rect x="534" y="310" width="20" height="13" rx="4"/><rect x="582" y="310" width="20" height="13" rx="4"/></g>
          <ellipse cx="568" cy="283" rx="10" ry="6" fill="#bac6a8" stroke="none"/>
        </g>
      </g>
      <g className="plan-balcony-plant" fill="#b6c3a8" stroke="#8d9e7e" strokeWidth=".8"><rect x="702" y="245" width="40" height="22" rx="3" fill="#d9d6c8"/><circle cx="712" cy="255" r="8"/><circle cx="724" cy="252" r="9"/><circle cx="733" cy="258" r="6"/><circle cx="723" cy="479" r="14"/><circle cx="719" cy="474" r="8" fill="#c7d1ba"/></g>

      <g className="plan-walls" fill="none" stroke="#354139" strokeLinecap="square" strokeLinejoin="miter">
        <path className="plan-outline" d="M90 80H140M270 80H385M440 80H540M660 80H690V315M690 425V520H400M350 520H90V450M90 365V80" strokeWidth="9" pathLength="1"/>
        <path className="plan-partitions" d="M330 80V235M330 275V315M330 365V520M90 280H330M490 80V230H395M350 230H330M490 230H530M640 230H690" strokeWidth="6" pathLength="1"/>
      </g>
      <g className="plan-windows" fill="none" stroke="#879e9b" strokeWidth="1.4">
        <path d="M140 76H270V84H140ZM205 76V84M385 76H440V84H385ZM412 76V84M540 76H660V84H540ZM600 76V84M86 365H94V450H86ZM86 408H94M686 315H694V425H686ZM686 370H694"/>
        <path d="M140 80H270M385 80H440M540 80H660M90 365V450M690 315V425" stroke="#c5d1cd" strokeWidth=".8"/>
      </g>
      <g className="plan-doorways" fill="none" stroke="#929f89" strokeWidth="1.1"><path d="M330 235H290A40 40 0 0 0 330 275M330 365H280A50 50 0 0 1 330 315M395 230V185A45 45 0 0 0 350 230M400 520V470A50 50 0 0 0 350 520"/></g>
      <g className="plan-balcony-railing" fill="none" stroke="#7f8f78" strokeWidth="1.6"><path d="M695 230H752V520H695M745 232V518"/></g>

      <g className="plan-room-labels" fontFamily="Inter,Arial,sans-serif" textAnchor="middle">
        {planRooms.map(room=><g key={room.id}><text x={room.tx} y={room.ty} fill="#46513e" fontSize="12" fontWeight="500">{room.label}</text><text x={room.tx} y={room.ty+16} fill="#8c907e" fontSize="8.5" letterSpacing=".2">{room.measure}</text></g>)}
        <text x="368" y="399" transform="rotate(-90 368 399)" fontSize="9" fill="#9aa08e" letterSpacing=".7">CIRCULACIÓN</text>
        <text x="725" y="377" transform="rotate(-90 725 377)" fontSize="10" fill="#6b7a5d" letterSpacing="1.2">BALCÓN</text>
      </g>
      <g className="plan-reference-measures" fill="none" stroke="#b5ab94" strokeWidth=".8">
        <path d="M90 551H690M90 538V559M690 538V559M60 80V520M51 80H71M51 520H71M695 551H752M752 538V559"/>
        <path d="m86 555 8-8m592 8 8-8M56 84l8-8m-8 448 8-8m627 39 8-8m49 8 8-8"/>
        <rect x="353" y="539" width="74" height="23" fill="#fafaf5" stroke="none"/>
        <text x="390" y="555" fill="#8d846c" stroke="none" fontFamily="Inter,Arial,sans-serif" fontSize="10" textAnchor="middle">10,00 m</text>
        <rect x="709" y="541" width="33" height="20" fill="#fafaf5" stroke="none"/>
        <text x="725" y="555" fill="#8d846c" stroke="none" fontFamily="Inter,Arial,sans-serif" fontSize="8" textAnchor="middle">1,10 m</text>
        <text x="49" y="306" transform="rotate(-90 49 306)" fill="#8d846c" stroke="none" fontFamily="Inter,Arial,sans-serif" fontSize="10" textAnchor="middle">7,33 m</text>
      </g>
      <g className="plan-entry-label" fill="#a08c67" fontFamily="Inter,Arial,sans-serif" textAnchor="middle"><path d="M374 580V563m-4 5 4-5 4 5" fill="none" stroke="#a08c67" strokeWidth="1"/><text x="374" y="597" fontSize="8" letterSpacing="1.5">ACCESO</text></g>
      <text x="91" y="613" fontFamily="Inter,Arial,sans-serif" fontSize="7.5" fill="#a5aa99" letterSpacing=".8">EJEMPLO ILUSTRATIVO · DISTRIBUCIÓN Y MEDIDAS FICTICIAS</text>
      <g className="plan-laser-beam"><path pathLength="1" d="M420 355H678" stroke="#b76b4f" strokeWidth="1.6"/><circle cx="420" cy="355" r="4" fill="#b76b4f"/><circle cx="678" cy="355" r="3" fill="#b76b4f"/><rect x="472" y="366" width="157" height="20" rx="2" fill="#f6eee5"/><text x="550" y="380" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="9" fill="#9c5f45">Medición láser en el lugar</text></g>
    </svg>
  );
}
