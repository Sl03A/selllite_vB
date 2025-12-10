async function listProducts(){ const res = await fetch('/api/admin/products', { credentials: 'include' }); if(!res.ok){ document.getElementById('list').innerText='Unauthorized'; return;} const arr = await res.json(); document.getElementById('list').innerHTML = arr.map(p=>`<div class="card"><h4>${p.title}</h4><div>Price:${(p.price_cents/100).toFixed(2)}€</div><div>Stock:${p.stock}</div><button data-id="${p.id}" class="del">Suppr</button></div>`).join(''); document.querySelectorAll('.del').forEach(b=>b.addEventListener('click', async e=>{ const id = Number(e.currentTarget.dataset.id); await fetch('/api/admin/products/'+id, { method:'DELETE', credentials:'include' }); listProducts(); })); }

document.getElementById('prod-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const f = e.target;
  const form = new FormData();
  if(f.image.files[0]) form.append('image', f.image.files[0]);
  let image_url = null;
  if(f.image.files[0]){ const up = await fetch('/api/admin/upload',{ method:'POST', body: form, credentials:'include' }); const uj = await up.json(); image_url = uj.ok ? uj.url : null; }
  const payload = { title: f.title.value, slug: f.title.value.toLowerCase().replace(/[^a-z0-9]+/g,'-'), description: f.description.value, price_cents: Math.round(parseFloat(f.price.value)*100), stock: Number(f.stock.value||0), image_url };
  const res = await fetch('/api/admin/products',{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const j = await res.json();
  document.getElementById('msg').innerText = j.ok ? 'Produit créé' : JSON.stringify(j);
  listProducts();
});

document.addEventListener('DOMContentLoaded', ()=>{ listProducts(); });
