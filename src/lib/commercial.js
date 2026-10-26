import {useEffect,useState} from 'react';
import {supabase} from './supabase';
let configPromise;
export function useCommercialConfig(){
 const [value,setValue]=useState({loading:true,enabled:false});
 useEffect(()=>{let active=true;configPromise ||= fetch('/api/commercial?action=config').then(r=>r.ok?r.json():{enabled:false}).catch(()=>({enabled:false}));configPromise.then(data=>{if(active)setValue({...data,loading:false});});return()=>{active=false;};},[]);
 return value;
}
export async function commercialApi(action,{method='GET',body,token,admin=false}={}){
 if(admin){const {data}=await supabase.auth.getSession();token=data.session?.access_token;}
 const response=await fetch(`/api/commercial?action=${action}`,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 let data;try{data=await response.json();}catch{throw new Error('El servicio todavía no está disponible.');}
 if(!response.ok)throw new Error(data.error||'No pudimos completar la operación.');return data;
}
