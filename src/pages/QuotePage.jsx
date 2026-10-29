import {useEffect} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {quoteTokenFromHash} from '../lib/quoteLink';
export default function QuotePage(){
 const location=useLocation(),navigate=useNavigate();
 useEffect(()=>{const token=quoteTokenFromHash(location.hash);navigate(token?`/#reserva=${token}`:'/',{replace:true});},[location.hash,navigate]);
 return <div className="min-h-screen bg-surface" aria-label="Abriendo reserva"/>;
}
