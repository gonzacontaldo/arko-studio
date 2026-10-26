import {FlowError} from './domain.js';
export async function db(path,{method='GET',body,headers={}}={}){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new FlowError('Falta conectar Supabase en el servidor.',503);
 const response=await fetch(`${url}/rest/v1/${path}`,{method,signal:AbortSignal.timeout(15000),headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const text=await response.text(),data=text?JSON.parse(text):null;
 if(!response.ok){if(data?.message?.startsWith('FLOW:'))throw new FlowError(data.message.slice(5),409);console.error('commercial_db_error',response.status,data?.code);throw new FlowError('No pudimos completar la operación. Volvé a intentar.',503);}return data;
}
export const rpc=(name,body={})=>db(`rpc/${name}`,{method:'POST',body});
export async function settings(){const rows=await db('com_settings?id=eq.1');if(!rows?.[0])throw new FlowError('Falta instalar la configuración comercial.',503);return rows[0];}
export async function requireAdmin(req){
 const auth=req.headers.authorization;if(!auth?.startsWith('Bearer '))throw new FlowError('Iniciá sesión en el admin.',401);
 const response=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:auth,apikey:process.env.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new FlowError('La sesión venció.',401);
 const user=await response.json(),admins=await db(`com_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
 if(!admins.length)throw new FlowError('Tu usuario todavía no está habilitado para gestionar reservas.',403);return user;
}
