
// Frontend app for SellLite Pro
const PRODUCTS = [
  {id:1,title:'Template Dashboard',price_cents:2999,currency:'eur',desc:'Template moderne'},
  {id:2,title:'Key Pro',price_cents:900,currency:'eur',desc:'Clé d\'activation PRO'},
  {id:3,title:'Service Setup',price_cents:4900,currency:'eur',desc:'Configuration'}
];
function money(cents){ return (cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}); }
function renderCatalog(){
  const root = document.getElementById('products'); if(!root) return;
  root.innerHTML='';
  PRODUCTS.forEach(p=>{
    const el=document.createElement('div'); el.className='product-card fade';
    el.innerHTML=`<h3>${p.title}</h3><p>${p.desc}</p><div class="price">${money(p.price_cents)}</div><div style="margin-top:12px"><button class="btn buy" data-id="${p.id}">Acheter</button> <a class="btn" href="/product.html?id=${p.id}">Détails</a></div>`;
    root.appendChild(el);
  });
  document.querySelectorAll('.buy').forEach(b=>b.addEventListener('click', async e=>{ const id=e.currentTarget.dataset.id; const email=prompt('Ton email pour livraison:','client@exemple.test'); if(!email) return; const res=await fetch('/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:parseInt(id),email})}); const data=await res.json(); if(data.sessionId) window.location='/checkout-success.html'; else alert('Erreur'); }));
}
function renderProductDetail(){ const params=new URLSearchParams(location.search); const id=parseInt(params.get('id')); const p=PRODUCTS.find(x=>x.id===id); const root=document.getElementById('product-detail'); if(!root) return; if(!p){ root.innerHTML='<p>Produit introuvable</p>'; return; } root.innerHTML=`<h2>${p.title}</h2><p>${p.desc}</p><div class="price">${money(p.price_cents)}</div><div style="margin-top:12px"><button id="pay" class="btn">Payer (simulé)</button></div>`; document.getElementById('pay').addEventListener('click', async ()=>{ const email=prompt('Ton email pour livraison:','client@exemple.test'); if(!email) return; const res=await fetch('/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,email})}); const data=await res.json(); if(data.sessionId) window.location='/checkout-success.html'; else alert('Erreur'); }); }
document.addEventListener('DOMContentLoaded', ()=>{ renderCatalog(); renderProductDetail(); });
