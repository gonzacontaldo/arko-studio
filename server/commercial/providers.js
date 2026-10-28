import {FlowError,escapeHtml} from './domain.js';
export const MAIL_FROM_ADDRESS = 'contacto@arkostudio.com.ar';
export const isTestMode=()=>process.env.COMMERCIAL_MODE!=='production';
export function siteUrl(){const v=process.env.COMMERCIAL_SITE_URL;if(!v||!/^https:\/\/[^/]+\/?$/.test(v))throw new FlowError('Falta configurar el dominio de reservas.',503);return v.replace(/\/$/,'');}
export function readiness(){return {database:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),links:(process.env.QUOTE_LINK_SECRET||'').length>=32&&!!process.env.COMMERCIAL_SITE_URL,email:['ZOHO_CLIENT_ID','ZOHO_CLIENT_SECRET','ZOHO_REFRESH_TOKEN','ZOHO_ACCOUNT_ID'].every(k=>!!process.env[k]),payments:['MP_ACCESS_TOKEN','MP_WEBHOOK_SECRET','MP_COLLECTOR_ID'].every(k=>!!process.env[k]),scheduler:(process.env.COMMERCIAL_JOB_SECRET||'').length>=32,replies:(process.env.ZOHO_INBOUND_SECRET||'').length>=32,replyMode:process.env.COMMERCIAL_REPLY_MODE==='manual'?'manual':'webhook',testMode:isTestMode()};}
export async function mp(path,method='GET',body){
 if(!process.env.MP_ACCESS_TOKEN)throw new FlowError('El cobro todavía no está habilitado.',503);
 const response=await fetch(`https://api.mercadopago.com/${path}`,{method,signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();if(!response.ok){console.error('commercial_mp_error',response.status);throw new FlowError('No pudimos conectar con Mercado Pago. Volvé a intentar.',502);}return data;
}
let cachedZoho;
const hosts={com:['https://accounts.zoho.com','https://mail.zoho.com'],eu:['https://accounts.zoho.eu','https://mail.zoho.eu'],in:['https://accounts.zoho.in','https://mail.zoho.in'],'com.au':['https://accounts.zoho.com.au','https://mail.zoho.com.au'],jp:['https://accounts.zoho.jp','https://mail.zoho.jp'],ca:['https://accounts.zohocloud.ca','https://mail.zohocloud.ca']};
export async function sendZoho({to,subject,text,link,unsubscribe,attachments=[],linkLabel='Ver propuesta y reserva'}){
 if(!readiness().email)throw new FlowError('Falta conectar Zoho.',503);
 const region=hosts[process.env.ZOHO_REGION||'com'];if(!region)throw new FlowError('Revisá la región de Zoho.',503);
 if(isTestMode()){if(!process.env.COMMERCIAL_TEST_EMAIL)throw new FlowError('Configurá el destinatario de pruebas.',503);to=process.env.COMMERCIAL_TEST_EMAIL;subject=`[PRUEBA] ${subject}`;}
 if(!cachedZoho||cachedZoho.until<Date.now()){
  const response=await fetch(`${region[0]}/oauth/v2/token`,{method:'POST',signal:AbortSignal.timeout(10000),body:new URLSearchParams({grant_type:'refresh_token',refresh_token:process.env.ZOHO_REFRESH_TOKEN,client_id:process.env.ZOHO_CLIENT_ID,client_secret:process.env.ZOHO_CLIENT_SECRET})});
  const token=await response.json();if(!response.ok||!token.access_token)throw new FlowError('Zoho necesita renovar su autorización.',503);
  cachedZoho={value:token.access_token,until:Date.now()+Math.max(30,Number(token.expires_in||3600)-120)*1000};
 }
 const uploaded=[];
 for(const attachment of attachments){
  if(!Buffer.isBuffer(attachment.content)||!attachment.content.length||attachment.content.length>10*1024*1024||!/^Presupuesto-ARKO-[A-F0-9-]+\.pdf$/.test(attachment.filename))throw new FlowError('Adjunto PDF inválido.',503);
  const form=new FormData();
  form.append('attach',new Blob([attachment.content],{type:'application/pdf'}),attachment.filename);
  let upload;
  // fetch supplies the multipart boundary; setting Content-Type manually corrupts the upload.
  try{upload=await fetch(`${region[1]}/api/accounts/${encodeURIComponent(process.env.ZOHO_ACCOUNT_ID)}/messages/attachments?uploadType=multipart&isInline=false`,{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Zoho-oauthtoken ${cachedZoho.value}`,Accept:'application/json'},body:form});}catch{throw new FlowError('No pudimos subir el PDF a Zoho.',502);}
  let result;try{result=await upload.json();}catch{throw new FlowError('Zoho no confirmó la carga del PDF.',502);}
  if(upload.status===401)cachedZoho=null;
  const data=Array.isArray(result.data)?result.data[0]:result.data;
  if(!upload.ok||Number(result.status?.code)!==200||!data?.storeName||!data.attachmentName||!data.attachmentPath){
   const rawCode=result.data?.errorCode||result.data?.errorcode||result.errorCode||result.error?.code;
   const code=/^[A-Za-z0-9_.-]{1,80}$/.test(String(rawCode||''))?String(rawCode):'';
   const status=Number(result.status?.code)||upload.status;
   const missing=['storeName','attachmentName','attachmentPath'].filter(key=>!data?.[key]);
   console.error('commercial_zoho_attachment_error',{http:upload.status,status,code,missing});
   throw new FlowError(`Zoho rechazó el adjunto PDF (HTTP ${upload.status}, estado ${status}${code?`, código ${code}`:''}${upload.ok&&status===200?`, faltan ${missing.join(', ')}`:''}).`,502);
  }
  uploaded.push({storeName:data.storeName,attachmentName:data.attachmentName,attachmentPath:data.attachmentPath});
 }
 const html=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#292524"><h2 style="color:#826527">ARKO Studio</h2><div style="white-space:pre-wrap;line-height:1.6">${escapeHtml(text)}</div>${link ? `<p><a style="display:inline-block;background:#826527;color:white;padding:14px 20px;text-decoration:none;border-radius:8px" href="${escapeHtml(link)}">${escapeHtml(linkLabel)}</a></p>` : ''}${unsubscribe ? `<p style="font-size:12px"><a href="${escapeHtml(unsubscribe)}">Dejar de recibir recordatorios</a></p>` : ''}</div>`;
 let response;
 try{response=await fetch(`${region[1]}/api/accounts/${encodeURIComponent(process.env.ZOHO_ACCOUNT_ID)}/messages`,{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Zoho-oauthtoken ${cachedZoho.value}`,'Content-Type':'application/json'},body:JSON.stringify({fromAddress:MAIL_FROM_ADDRESS,toAddress:to,subject,content:html,mailFormat:'html',encoding:'UTF-8',...(uploaded.length?{attachments:uploaded}:{})})});}catch{throw new FlowError('EMAIL_UNCERTAIN',502);}
 let data;try{data=await response.json();}catch{throw new FlowError('EMAIL_UNCERTAIN',502);}if(response.status===401)cachedZoho=null;
 if(!response.ok||Number(data.status?.code)!==200)throw new FlowError(response.status>=500?'EMAIL_UNCERTAIN':'Zoho rechazó el envío.',502);
 return String(data.data?.messageId||'accepted');
}
