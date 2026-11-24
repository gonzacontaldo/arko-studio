export const SITE_URL='https://arkostudio.com.ar';
export const DEFAULT_IMAGE=`${SITE_URL}/portfolio-web/Civis/Portada.jpg`;
export function absoluteImage(image=DEFAULT_IMAGE){return image.startsWith('/')?`${SITE_URL}${image}`:image;}
export function pageSchema({path='/',title,description,schema}){
 const url=`${SITE_URL}${path}`,name=(title||'ARKO Studio').split(' | ')[0];
 const entity=schema?{...schema}:{'@type':path==='/'?'LocalBusiness':path==='/portfolio'?'CollectionPage':'Service',name,description,url,...(path!=='/'&&path!=='/portfolio'?{provider:{'@type':'LocalBusiness','@id':`${SITE_URL}/#studio`,name:'ARKO Studio',url:SITE_URL,telephone:'+54 9 11 7649-8888'},areaServed:['CABA','Zona Norte de Buenos Aires']}: {})};
 delete entity['@context'];entity.url=url;
 const breadcrumbs=[{'@type':'ListItem',position:1,name:'Inicio',item:`${SITE_URL}/`}];
 if(path==='/fpv-inmobiliario')breadcrumbs.push({'@type':'ListItem',position:2,name:'Video inmobiliario',item:`${SITE_URL}/video-inmobiliario`});
 if(path!=='/')breadcrumbs.push({'@type':'ListItem',position:breadcrumbs.length+1,name,item:url});
 return {'@context':'https://schema.org','@graph':[entity,{'@type':'BreadcrumbList',itemListElement:breadcrumbs}]};
}
