export function youtubeId(input){
 const value=String(input||'').trim();
 if(/^[\w-]{11}$/.test(value))return value;
 try{const u=new URL(value);if(!['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be'].includes(u.hostname)||u.protocol!=='https:')return null;
 const id=u.hostname==='youtu.be'?u.pathname.slice(1).split('/')[0]:u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];return /^[\w-]{11}$/.test(id||'')?id:null;}catch{return null;}
}
export function normalizeMediaValue(field,input){
 let value=String(input??'').trim();
 if(value.length>2048)throw new Error(`${field.label}: el contenido es demasiado largo.`);
 if(field.type==='text')return value.slice(0,240);
 if(!value){if(field.type==='youtube'||['kuula','matterport'].includes(field.type))throw new Error(`Completá ${field.label}.`);return '';}
 if(field.type==='youtube'){const id=youtubeId(value);if(!id)throw new Error(`${field.label}: pegá un enlace válido de YouTube.`);return id;}
 if(field.type==='image'&&value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\'))return value;
 if(field.type==='kuula'||field.type==='matterport')value=value.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;','&')||value;
 let u;try{u=new URL(value);}catch{throw new Error(`${field.label}: el enlace no es válido.`);}
 if(u.protocol!=='https:'||u.username||u.password)throw new Error(`${field.label}: usá un enlace HTTPS.`);
 if(field.type==='kuula'&&!['kuula.co','viewin360.co'].some(d=>u.hostname===d||u.hostname.endsWith(`.${d}`)))throw new Error('El recorrido Kuula debe ser un enlace de Kuula o Viewin360.');
 if(field.type==='matterport'&&(u.hostname!=='my.matterport.com'||u.pathname.replace(/\/$/,'')!=='/show'||!u.searchParams.get('m')))throw new Error('Pegá el enlace público de Matterport: my.matterport.com/show/?m=…');
 return u.href;
}
