export function defaultPortfolioIds(items){
 const featured=items.filter(item=>item.destacado);
 return (featured.length?featured:items).slice(0,3).map(item=>item.id);
}
export function selectedPortfolio(items,config={}){
 const ids=Array.isArray(config.selectedIds)?config.selectedIds:defaultPortfolioIds(items);
 const byId=new Map(items.map(item=>[item.id,item]));
 return [...new Set(ids)].map(id=>byId.get(id)).filter(Boolean);
}
export function validatePortfolioSelection(values){
 if(!Object.hasOwn(values,'selectedIds'))return {};
 if(!Array.isArray(values.selectedIds)||values.selectedIds.length>100||values.selectedIds.some(id=>typeof id!=='string'||!id.trim()||id.length>100))throw new Error('Elegí una selección válida de hasta 100 trabajos.');
 return {selectedIds:[...new Set(values.selectedIds)]};
}
