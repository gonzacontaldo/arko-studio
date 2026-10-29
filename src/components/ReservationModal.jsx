import {useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {commercialApi} from '../lib/commercial';
import {quoteTokenFromHash} from '../lib/quoteLink';
const money=n=>`$ ${Number(n).toLocaleString('es-AR')}`;
const day=v=>new Date(v).toLocaleDateString('es-AR',{timeZone:'America/Argentina/Buenos_Aires',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
const weekLabel=v=>{const d=new Date(`${v}T12:00:00Z`),end=new Date(d);end.setUTCDate(d.getUTCDate()+6);return `${d.toLocaleDateString('es-AR',{timeZone:'UTC'})} al ${end.toLocaleDateString('es-AR',{timeZone:'UTC'})}`;};
const button='border border-outline-variant rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-40';
export default function ReservationModal(){
 const location=useLocation(),navigate=useNavigate();
 const token=location.hash.startsWith('#reserva=')?quoteTokenFromHash(location.hash):'';
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[selected,setSelected]=useState(''),[unsubscribed,setUnsubscribed]=useState(false),[now,setNow]=useState(Date.now());
 const [month,setMonth]=useState(()=>{const d=new Date();return new Date(Date.UTC(d.getFullYear(),d.getMonth(),1));});
 const panel=useRef(null),close=()=>navigate({pathname:location.pathname,search:location.search,hash:''},{replace:true});
 useEffect(()=>{
  if(!token)return;
  let active=true;setData(null);setError('');setSelected('');setUnsubscribed(false);
  const load=()=>commercialApi('quote',{token}).then(result=>{if(active)setData(result);}).catch(e=>{if(active)setError(e.message);});
  load();const poll=setInterval(load,30000),clock=setInterval(()=>setNow(Date.now()),1000);
  const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.focus();
  const keys=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const fields=[...panel.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')];const first=fields[0],last=fields.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',keys);
  return()=>{active=false;clearInterval(poll);clearInterval(clock);document.body.style.overflow=overflow;document.removeEventListener('keydown',keys);previous?.focus();};
 },[token]);
 if(!token)return null;
 const q=data?.quote,r=data?.reservation,holding=r?.status==='held'&&new Date(r.hold_until).getTime()>now;
 const confirmed=r?.status==='confirmed',review=q?.stage==='payment_review'||r?.status==='payment_review';
 const expired=q&&new Date(q.valid_until).getTime()<=now;
 const choose=q?.approved&&!expired&&!confirmed&&!review&&q.stage!=='closed'&&!holding;
 const action=async(pay=false)=>{
  setBusy(true);setError('');try{
   if(!holding){const result=await commercialApi('reserve',{method:'POST',token,body:{week:selected}});setData(result);}
   if(pay){const result=await commercialApi('checkout',{method:'POST',token});window.location.assign(result.url);}
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 const offset=(month.getUTCDay()+6)%7,start=new Date(month);start.setUTCDate(1-offset);
 const rows=Array.from({length:Math.ceil((offset+new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate())/7)},(_,i)=>{const monday=new Date(start);monday.setUTCDate(start.getUTCDate()+i*7);return monday;});
 return <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 md:p-6" onClick={()=>!busy&&close()}><div className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm"/><section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="reservation-title" className="relative bg-white w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl outline-none" onClick={e=>e.stopPropagation()}>
  <header className="editorial-gradient px-5 md:px-8 py-6 flex justify-between gap-4"><div><p className="text-white/70 text-xs uppercase tracking-widest mb-2">Arko Studio</p><h2 id="reservation-title" className="font-headline font-extrabold text-2xl text-white">Elegí tu semana de producción</h2><p className="text-white/80 text-sm mt-2">Coordinamos juntos el día y horario.</p></div><button disabled={busy} onClick={close} aria-label="Cerrar" className="text-white p-2 self-start"><span className="material-symbols-outlined">close</span></button></header>
  <div className="p-5 md:p-8 space-y-5">
   {error&&<p role="alert" className="text-error bg-red-50 p-4 rounded-lg">{error}</p>}
   {!data&&!error&&<p>Cargando disponibilidad…</p>}
   {q&&<>
    {data.testMode&&<p className="text-sm bg-amber-50 p-3 rounded-lg">Entorno de prueba. No confirma una producción real.</p>}
    {!confirmed&&!review&&<p>Hola, {q.name}. Elegís un cupo dentro de una <strong>semana</strong>, porque el día de producción depende de la disponibilidad, el clima y el acceso a la propiedad. Después coordinamos con vos el día y horario exactos.</p>}
    {!q.approved&&q.stage!=='closed'&&<p>Estamos preparando tu propuesta. Te contactaremos y enviaremos el presupuesto antes de habilitar la reserva.</p>}
    {q.stage==='closed'&&<p>Esta solicitud está cerrada. Contactanos para retomarla.</p>}
    {expired&&!confirmed&&!holding&&<p>Tu propuesta venció. Respondé al mail para actualizar el presupuesto y la disponibilidad.</p>}
    {choose&&<>
     <div className="border border-outline-variant rounded-xl p-4 space-y-3"><div className="flex justify-between items-center gap-3"><button className={button} disabled={busy} aria-label="Mes anterior" onClick={()=>setMonth(new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()-1,1)))}>←</button><h3 className="font-bold capitalize">{month.toLocaleDateString('es-AR',{timeZone:'UTC',month:'long',year:'numeric'})}</h3><button className={button} disabled={busy} aria-label="Mes siguiente" onClick={()=>setMonth(new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,1)))}>→</button></div>
      <p className="text-xs text-on-surface-variant">Seleccioná una fila para elegir la semana completa.</p><div className="grid grid-cols-7 text-center text-xs text-on-surface-variant">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=><span key={d}>{d}</span>)}</div>
      {rows.map(monday=>{const key=monday.toISOString().slice(0,10),available=data.weeks.find(w=>w.week_start===key)?.available>0;return <button key={key} aria-label={`Semana del ${weekLabel(key)}: ${available?'disponible':'sin cupos'}`} aria-pressed={selected===key} disabled={busy||!available} onClick={()=>setSelected(key)} className={`w-full grid grid-cols-7 text-center py-3 rounded-lg border text-sm disabled:opacity-30 ${selected===key?'border-secondary bg-secondary/10 text-secondary font-bold':'border-outline-variant/40 hover:bg-surface-container'}`}>{Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setUTCDate(d.getUTCDate()+i);return <span key={i}>{d.getUTCDate()}</span>;})}</button>;})}
      {!data.weeks.some(w=>w.available>0)&&<p className="text-sm">No hay cupos disponibles online. Respondé al mail para coordinar una alternativa.</p>}
     </div>
     {selected&&<p className="font-semibold" aria-live="polite">Semana elegida: {weekLabel(selected)}</p>}
    </>}
    {holding&&<div className="bg-surface-container-low rounded-xl p-4 space-y-2" role="status"><h3 className="font-bold">Tu semana está retenida</h3><p>{weekLabel(r.week_start)}</p><p className="text-sm">Podés confirmar pagando la seña hasta el {day(r.hold_until)}. Después se libera el cupo si no se acreditó el pago.</p></div>}
    {(choose||holding)&&<>
     <div className="grid sm:grid-cols-2 gap-4">
      {!holding&&<div className="border border-outline-variant rounded-xl p-4 flex flex-col gap-3"><h3 className="font-bold">Retener sin pagar</h3><p className="text-sm text-on-surface-variant flex-1">Te guardamos el cupo por hasta 3 días, dentro de la vigencia del presupuesto. Te enviaremos recordatorios por mail para que puedas confirmar. Si no pagás la seña antes del vencimiento, el cupo se libera automáticamente.</p><button disabled={busy||!selected} onClick={()=>action(false)} className={button}>Retener semana sin pagar</button></div>}
      <div className="border border-secondary rounded-xl p-4 flex flex-col gap-3"><h3 className="font-bold">Confirmar con seña</h3><p className="text-sm text-on-surface-variant flex-1">Pagá una seña de <strong>{money(q.deposit)}</strong> por Mercado Pago para asegurar tu lugar en la semana elegida. Se descuenta del total del presupuesto. El día y horario se coordinan después.</p><button disabled={busy||(!holding&&!selected)||!data.paymentsEnabled} onClick={()=>action(true)} className="editorial-gradient text-white font-bold text-sm px-4 py-3 rounded-lg disabled:opacity-40">{busy?'Procesando…':`Reservar con seña de ${money(q.deposit)}`}</button>{!data.paymentsEnabled&&<p className="text-xs">El pago online todavía no está habilitado. Contactanos para confirmar.</p>}</div>
     </div><details className="text-sm text-on-surface-variant"><summary className="cursor-pointer">Condiciones de reserva y reprogramación</summary><p className="whitespace-pre-wrap mt-3">{q.terms}</p></details>
    </>}
    {confirmed&&<div role="status" className="bg-green-50 rounded-xl p-5 space-y-2"><h3 className="font-bold">¡Tu reserva está confirmada!</h3><p>Recibimos la seña de {money(q.deposit)} para la semana del {weekLabel(r.week_start)}. Te contactaremos para coordinar el día y horario.</p></div>}
    {review&&<p role="status" className="bg-amber-50 rounded-xl p-4">Tu pago necesita revisión. No vuelvas a pagar. Vamos a contactarte para resolverlo.</p>}
    <footer className="text-sm text-on-surface-variant space-y-3"><p>¿Tenés dudas? Respondé al mail de tu presupuesto o escribinos a <a className="underline" href="mailto:contacto@arkostudio.com.ar">contacto@arkostudio.com.ar</a>.</p>{unsubscribed||q.unsubscribed?<p>Los recordatorios están desactivados.</p>:<button disabled={busy} className="underline text-xs" onClick={async()=>{setBusy(true);try{await commercialApi('unsubscribe',{method:'POST',token});setUnsubscribed(true);}catch(e){setError(e.message);}finally{setBusy(false);}}}>Dejar de recibir recordatorios</button>}</footer>
   </>}
  </div>
 </section></div>;
}
