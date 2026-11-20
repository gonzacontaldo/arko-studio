import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {SERVICE_MEDIA,mediaDefaults,mediaDefinition,normalizeMediaValue,youtubeId} from '../data/serviceMedia';
import {loadServiceMedia,saveServiceMedia,uploadServiceImage} from '../lib/serviceMedia';
import {fetchPortfolio} from '../lib/portfolio';
import './servicePages.css';

function ImageField({field,value,onChange,photos,onUpload,busy}){
 const [picker,setPicker]=useState(false),[broken,setBroken]=useState(false);
 useEffect(()=>setBroken(false),[value]);
 let safe='';try{safe=normalizeMediaValue(field,value);}catch{/* An incomplete URL stays editable. */}
 return <div className="sp-image-field">
  <div className="sp-preview">{safe&&!broken?<img src={safe} alt={`Vista previa: ${field.label}`} onError={()=>setBroken(true)}/>:<span>{value?'No se puede previsualizar esta imagen.':'Se usará la opción original o automática.'}</span>}</div>
  <input id={`sp-${field.key}`} type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="https://…" disabled={busy}/>
  <div className="sp-image-actions"><label className={`sp-button ${busy?'is-disabled':''}`}>{busy?'Esperá…':'Subir imagen'}<input aria-label={`Subir ${field.label.toLowerCase()}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)onUpload(file);}}/></label><button type="button" className="sp-button sp-secondary" disabled={busy} onClick={()=>setPicker(v=>!v)}>{picker?'Cerrar biblioteca':'Elegir del portfolio'}</button></div>
  {picker&&<div className="sp-library" role="group" aria-label={`Fotos del portfolio para ${field.label}`}>
   {photos.length?photos.map(p=><button type="button" key={p.url} disabled={busy} onClick={()=>{onChange(p.url);setPicker(false);}} aria-label={`Elegir ${p.title}`}><img src={p.url} alt="" loading="lazy"/><span>{p.title}</span></button>):<p>No hay fotos disponibles en el portfolio.</p>}
  </div>}
 </div>;
}
function VideoPreview({value}){
 const id=youtubeId(value),[play,setPlay]=useState(false);
 useEffect(()=>setPlay(false),[value]);
 return id?<div className="sp-video-preview">{play?<iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title="Vista previa del video elegido" allow="autoplay; fullscreen" allowFullScreen/>:<button type="button" onClick={()=>setPlay(true)} aria-label="Reproducir vista previa"><img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="Miniatura del video elegido"/><span>▶ Ver video</span></button>}</div>:null;
}
function TourPreview({field,value}){
 const [play,setPlay]=useState(false);useEffect(()=>setPlay(false),[value]);
 let url='';try{url=normalizeMediaValue(field,value);}catch{return null;}
 return <div>{play?<div className="sp-tour-preview"><iframe title={`Vista previa ${field.type}`} src={url} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen/><button type="button" className="sp-button sp-secondary" onClick={()=>setPlay(false)}>Cerrar vista previa</button></div>:<button type="button" className="sp-button sp-secondary" onClick={()=>setPlay(true)}>Probar recorrido</button>}</div>;
}
export default function ServicePages({onDirtyChange}){
 const [id,setId]=useState(SERVICE_MEDIA[0].id),[draft,setDraft]=useState({}),[saved,setSaved]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[retry,setRetry]=useState(0),[portfolio,setPortfolio]=useState([]);
 const def=mediaDefinition(id),dirty=JSON.stringify(draft)!==saved;
 useEffect(()=>{fetchPortfolio().then(setPortfolio).catch(()=>{});},[]);
 useEffect(()=>{let active=true;setLoading(true);setError('');setNotice('');
  loadServiceMedia(id,{refresh:true}).then(data=>{if(!active)return;const next={...mediaDefaults(id),...data};setDraft(next);setSaved(JSON.stringify(next));setLoading(false);}).catch(err=>{if(active)setError(err.message);});
  return()=>{active=false;};
 },[id,retry]);
 useEffect(()=>{if(!dirty||loading)return;const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty,loading]);
 useEffect(()=>{onDirtyChange?.(dirty&&!loading);return()=>onDirtyChange?.(false);},[dirty,loading,onDirtyChange]);
 const photos=[...new Map(portfolio.flatMap(p=>[...new Set([p.cover,...p.fotos].filter(Boolean))].map((url,i)=>({url,title:`${p.title} · foto ${i+1}`}))).map(p=>[p.url,p])).values()];
 const set=(key,value)=>{setDraft(d=>({...d,[key]:value}));setNotice('');};
 const changeService=next=>{if(next===id)return;if(dirty&&!loading&&!window.confirm('Tenés cambios sin guardar. ¿Querés descartarlos y cambiar de servicio?'))return;setId(next);};
 const upload=async(field,file)=>{setBusy(true);setError('');try{set(field.key,await uploadServiceImage(id,file));setNotice('Imagen subida. Guardá los cambios para mostrarla en la página.');}catch(err){setError(err.message);}finally{setBusy(false);}};
 const save=async e=>{e.preventDefault();setBusy(true);setError('');setNotice('');try{const data=await saveServiceMedia(id,draft);const next={...mediaDefaults(id),...data};setDraft(next);setSaved(JSON.stringify(next));setNotice('Cambios guardados. Ya están disponibles en la página del servicio.');}catch(err){setError(err.message);}finally{setBusy(false);}};
 const restore=()=>{setDraft(mediaDefaults(id));setNotice('Selección original recuperada en el editor. Guardá para aplicarla.');setError('');};
 return <div className="service-pages-admin"><header className="sp-heading"><div><h2>Páginas de servicios</h2><p>Cambiá las fotos, los videos y los recorridos de cada página. Los cambios se aplican al guardar.</p></div><Link to={`/${id}`} target="_blank" rel="noreferrer" className="sp-button sp-secondary">Ver página guardada ↗</Link></header>
  <div className="sp-tabs" role="group" aria-label="Servicio a editar">{SERVICE_MEDIA.map(s=><button type="button" key={s.id} disabled={busy} aria-pressed={s.id===id} onClick={()=>changeService(s.id)}>{s.name}</button>)}</div>
  {error&&<div className="sp-error" role="alert">{error}{loading&&<button className="sp-button sp-secondary" onClick={()=>setRetry(n=>n+1)}>Reintentar</button>}</div>}
  {notice&&<p className="sp-notice" role="status">{notice}</p>}
  {loading?<p aria-live="polite">{error?'No se cargó la configuración; no se puede sobrescribir.':'Cargando contenido guardado…'}</p>:<form onSubmit={save}><div className="sp-fields">{def.fields.map(field=><section key={field.key} className={`sp-field sp-field-${field.type}`}><label htmlFor={`sp-${field.key}`}>{field.label}</label>{field.hint&&<p className="sp-hint">{field.hint}</p>}
   {field.type==='image'?<ImageField field={field} value={draft[field.key]??''} onChange={v=>set(field.key,v)} photos={photos} onUpload={f=>upload(field,f)} busy={busy}/>:<><input id={`sp-${field.key}`} value={draft[field.key]??''} onChange={e=>set(field.key,e.target.value)} disabled={busy} maxLength={field.type==='text'?240:2048}/>{field.type==='youtube'&&<VideoPreview value={draft[field.key]}/ >}{['kuula','matterport'].includes(field.type)&&<TourPreview field={field} value={draft[field.key]}/>}</>}
  </section>)}</div>
  {def.portfolio&&<section className="sp-portfolio"><h3>Los tres trabajos del final de la página</h3><p>Dejá todos vacíos para usar los mismos destacados que la home. O elegí hasta tres trabajos en el orden que quieras.</p>{[0,1,2].map(i=><label key={i}>Trabajo {i+1}<select value={draft.portfolioIds?.[i]||''} disabled={busy} onChange={e=>{const ids=[...(draft.portfolioIds||[])];while(ids.length<3)ids.push('');ids[i]=e.target.value;set('portfolioIds',ids);}}><option value="">{i===0?'Destacados automáticos / sin selección':'Sin selección'}</option>{portfolio.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>)}</section>}
  <footer className="sp-savebar"><span>{dirty?'Cambios sin guardar':'Todo guardado'}</span><div><button type="button" disabled={busy} onClick={restore} className="sp-button sp-secondary">Recuperar originales</button><button type="submit" disabled={busy||!dirty} className="sp-button">{busy?'Procesando…':'Guardar cambios'}</button></div></footer><p className="sp-hint">Subir una foto no cambia la página hasta guardar. Las imágenes anteriores se conservan en el almacenamiento.</p></form>}
 </div>;
}
