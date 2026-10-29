export const quoteTokenFromHash=hash=>String(hash||'').replace(/^#(?:reserva=)?/,'').split(/[?&]/,1)[0];
