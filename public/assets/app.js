/* assets/app.js
 - génère dynamiquement les cards
 - gère mode light/dark (localStorage)
 - gestion basique du bouton Acheter (simulé)
*/

// Exemple de catalogue — tu peux le remplacer par fetch('/products.json')
const PRODUCTS = [
  { id: 1, title: "Template Dashboard", desc: "Dashboard moderne prêt à l’emploi.", price_cents: 2999, currency: "EUR", tag: "Best-seller" },
  { id: 2, title: "Key Pro", desc: "Clé d’activation PRO — livraison automatique.", price_cents: 900, currency: "EUR", tag: "Populaire" },
  { id: 3, title: "Setup Service", desc: "Configuration et installation.", price_cents: 4900, currency: "EUR", tag: "Premium" },
  { id: 4, title: "Starter Pack", desc: "Pack de démarrage pour petits projets.", price_cents: 499, currency: "EUR", tag: "Nouveau" }
];

function money(cents){
  return (cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
}

/* render each product as a card */
function renderProducts(){
  const root = document.getElementById('products');
  if(!root) return;
  root.innerHTML = '';
  PRODUCTS.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card appear';

    // stagger delay
    card.style.animationDelay = (i * 80) + 'ms';

    card.innerHTML = `
      <div class="badge">${p.tag}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="price">${money(p.price_cents)}</div>
      <div class="actions">
        <button class="btn buy" data-id="${p.id}">Acheter</button>
        <button class="btn ghost details" data-id="${p.id}">Détails</button>
      </div>
    `;
    root.appendChild(card);
  });

  // events
  document.querySelectorAll('.buy').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const p = PRODUCTS.find(x => x.id == id);
      const email = prompt(`Email de livraison pour ${p.title}`, 'client@exemple.test');
      if(!email) return;
      // simulate call to server
      try{
        const res = await fetch('/create-checkout-session', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ productId: Number(id), email })
        });
        const data = await res.json();
        if(data.sessionId || data.key || data.message){
          alert('Paiement simulé réussi — vous serez redirigé.');
          window.location = '/checkout-success.html';
        } else {
          alert('Erreur de paiement simulé');
        }
      }catch(err){
        alert('Erreur réseau');
      }
    });
  });

  document.querySelectorAll('.details').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      window.location = `/product.html?id=${id}`;
    });
  });
}

/* THEME: dark / light */
function applyTheme(t){
  if(t === 'light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');

  // update toggle visual
  const dot = document.querySelector('.theme-toggle .dot');
  if(dot) dot.style.background = (t === 'light') ? 'var(--accent-2)' : 'var(--accent)';
}

function toggleTheme(){
  const cur = localStorage.getItem('theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

/* LOGO: inject SVG text-stylé */
function injectLogo(){
  const el = document.querySelector('.logo');
  if(!el) return;
  // SVG badge + text
  el.innerHTML = `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stop-color="#8b5cf6"/>
          <stop offset="1" stop-color="#6ec1ff"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#g)"></rect>
      <text x="32" y="40" font-size="24" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-family="Poppins, sans-serif" font-weight="700">S</text>
    </svg>
    <span>SellLite</span>
  `;
}

/* INIT */
document.addEventListener('DOMContentLoaded', ()=>{
  injectLogo();
  renderProducts();

  // setup theme
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);

  // attach toggle handler
  const togg = document.querySelector('.theme-toggle');
  if(togg) togg.addEventListener('click', toggleTheme);
});
