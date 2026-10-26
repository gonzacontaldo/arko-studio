export const quoteTokenFromHash=hash=>String(hash||'').replace(/^#/,'').split(/[?&]/,1)[0];
