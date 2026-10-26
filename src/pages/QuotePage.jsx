import {useEffect,useState} from 'react';
import {commercialApi} from '../lib/commercial';
import Seo from '../components/Seo';
import {quoteTokenFromHash} from '../lib/quoteLink';
const money=n=>`$ ${Number(n).toLocaleString('es-AR')}`;
const date=v=>new Date(v).toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires',dateStyle:'medium',timeStyle:'short'});
const week=v=>{const start=new Date(`${v}T12:00:00Z`),end=new Date(start);end.setUTCDate(start.getUTCDate()+4);return `${start.toLocaleDateString('es-AR',{timeZone:'UTC'})} al ${end.toLocaleDateString('es-AR',{timeZone:'UTC'})}`;};
export default function QuotePage(){
 const [token]=useState(()=>quoteTokenFromHash(window.location.hash));
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[unsubscribed,setUnsubscribed]=useState(false),[tick,setTick]=useState(Date.now());
 const [accept,setAccept]=useState(false);
 const load=async()=>{const result=await commercialApi('quote',{token});setData(result);};
 useEffect(()=>{if(!token){setError('El enlace está incompleto. Abrí el enlace de tu presupuesto.');return;}load().catch(e=>setError(e.message));const poll=setInterval(()=>load().catch(()=>{}),30000);const clock=setInterval(()=>setTick(Date.now()),1000);return()=>{clearInterval(poll);clearInterval(clock);};},[token]);
 const action=async(kind,body)=>{setBusy(true);setError('');try{const result=await commercialApi(kind,{method:'POST',body:body||{},token});if(kind==='checkout')window.location.assign(result.url);else if(kind==='unsubscribe')setUnsubscribed(true);else await load();}catch(e){setError(e.message);}finally{setBusy(false);}};
 const q=data?.quote,r=data?.reservation;
 const holding=r?.status==='held'&&new Date(r.hold_until).getTime()>tick;
 const confirmed=r?.status==='confirmed',review=r?.status==='payment_review'||q?.stage==='payment_review';
 const expired=q&&new Date(q.valid_until).getTime()<=tick;
 const canChoose=q?.approved&&!expired&&!holding&&!confirmed&&!review&&q.stage!=='closed';
 const remaining=holding?Math.max(0,Math.ceil((new Date(r.hold_until).getTime()-tick)/60000)):0;
 return <div className="min-h-screen bg-surface font-body text-on-surface p-4 md:p-8">
  <Seo title="Tu presupuesto | ARKO Studio" description="Propuesta y reserva privada de producción." path="/presupuesto" noindex />
  <main className="max-w-3xl mx-auto space-y-6"><a href="/" className="font-headline font-bold text-secondary">ARKO STUDIO</a>
   <h1 className="font-headline text-3xl font-bold">Tu producción, paso a paso</h1>
   {error&&<p role="alert" className="p-4 border border-error text-error rounded-xl">{error}</p>}
   {!data&&!error&&<p>Cargando tu propuesta…</p>}
   {q&&<>
    {data.testMode&&<p className="p-3 rounded-lg bg-amber-100 text-amber-900">Entorno de prueba. Esta propuesta no confirma una producción real.</p>}
    <section className="bg-white border border-outline-variant rounded-xl p-5 md:p-8 space-y-3">
     <p>Hola, {q.name}. Recibimos tu solicitud para la propiedad en <strong>{q.zone}</strong>.</p>
     <h2 className="text-xl font-bold">Pack {q.snapshot.pack} · {q.m2} m²</h2>
     <ul className="space-y-1">{[...q.snapshot.services,...q.snapshot.videos].map((s,i)=><li key={i}>✓ {s}</li>)}{q.snapshot.addons.map(a=><li key={a.name}>✓ {a.name} · {money(a.price)}</li>)}</ul>
     <div className="border-t pt-3 space-y-1"><p className="text-xl font-bold">{q.approved?'Total':'Total estimado'}: {money(q.total)}</p><p>Reserva: {money(q.deposit)} · Saldo: {money(q.total-q.deposit)}</p><p className="text-xs">IVA incluido. Vigencia de la propuesta: {date(q.valid_until)}.</p></div>
     <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{q.terms}</p>
    </section>
    {!q.approved&&<p className="bg-white p-5 rounded-xl">Tu solicitud está en revisión. Te enviaremos el presupuesto confirmado por email cuando verifiquemos las características y la locación.</p>}
    {q.stage==='closed'&&<p>Esta consulta está cerrada. Contactanos si querés retomarla.</p>}
    {expired&&!confirmed&&<p className="bg-amber-50 p-5 rounded-xl">La propuesta venció. Respondé al mail para que confirmemos los precios y la disponibilidad antes de reservar.</p>}
    {canChoose&&<section className="bg-white p-5 md:p-8 rounded-xl border border-outline-variant"><h2 className="text-xl font-bold mb-2">Elegí tu semana</h2><p className="text-sm mb-4">Reservás un cupo dentro de esa semana. Coordinaremos el día y horario según el clima y el acceso a la propiedad.</p>
     <label className="flex gap-3 mb-4 text-sm"><input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)} />Leí las condiciones y puedo coordinar un día dentro de la semana elegida.</label>
     {!data.weeks.some(w=>w.available>0)&&<p>No hay semanas disponibles online. Respondé al mail y coordinamos una alternativa.</p>}
     <div className="grid sm:grid-cols-2 gap-3">{data.weeks.map(w=><button key={w.week_start} disabled={busy||!accept||w.available<1} onClick={()=>action('reserve',{week:w.week_start})} className="border rounded-xl p-4 text-left border-secondary disabled:opacity-40"><strong>{week(w.week_start)}</strong><span className="block text-sm">{w.available>0?'Disponible':'Sin cupos'}</span></button>)}</div>
    </section>}
    {holding&&<section className="bg-white border-2 border-secondary rounded-xl p-5 md:p-8 space-y-3"><h2 className="text-xl font-bold">Tu cupo está retenido</h2><p>Semana del {week(r.week_start)}</p><p>Confirmá antes del {date(r.hold_until)}.</p><p className="font-bold">Quedan {Math.floor(remaining/60)} h {remaining%60} min.</p>
     <button disabled={busy||!data.paymentsEnabled} onClick={()=>action('checkout')} className="editorial-gradient text-white rounded-xl px-6 py-4 font-bold disabled:opacity-50">{busy?'Preparando…':`Pagar reserva de ${money(q.deposit)}`}</button>
     {!data.paymentsEnabled&&<p className="text-sm">El pago online está pendiente de habilitación. Contactanos para coordinar.</p>}
     <p className="text-xs">La confirmación aparece cuando Mercado Pago verifica el pago. No hace falta que cierres esta página.</p>
    </section>}
    {confirmed&&<section className="bg-green-50 border border-green-300 rounded-xl p-6"><h2 className="text-xl font-bold">Reserva confirmada</h2><p className="mt-2">Recibimos {money(q.deposit)}. Tenés un cupo para la semana del {week(r.week_start)}. Te contactaremos para coordinar el día y horario.</p></section>}
    {review&&<p className="p-5 bg-amber-50 rounded-xl">Recibimos un pago que requiere revisión. No vuelvas a pagar. Te vamos a contactar para resolverlo.</p>}
    {!holding&&!confirmed&&r?.status==='expired'&&!expired&&<p>La retención anterior venció. Podés elegir entre las semanas disponibles.</p>}
    <section className="text-sm text-on-surface-variant"><p>¿Tenés dudas? Respondé al mail de tu presupuesto o escribinos a <a className="underline" href="mailto:gonzalo@arkostudio.com.ar">gonzalo@arkostudio.com.ar</a>.</p>
     {unsubscribed||q.unsubscribed?<p className="mt-3">Los recordatorios de esta consulta están desactivados.</p>:<button className="underline mt-3" disabled={busy} onClick={()=>action('unsubscribe')}>Dejar de recibir recordatorios de esta consulta</button>}
    </section>
   </>}
  </main>
 </div>;
}
