// Minimal client logic + calls to server endpoints
const PRODUCTS = [
  {id:1,title:'Template Dashboard',price_cents:2999,currency:'eur',desc:'Template moderne'},
  {id:2,title:'Key Pro',price_cents:900,currency:'eur',desc:"Clé d'activation PRO"},
  {id:3,title:'Service Setup',price_cents:4900,currency:'eur',desc:'Configuration'}
];

function currencyFromCents(n){return (n/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}

if(window.location.pathname === '/' || window.location.pathname.endsWith('index.html')){
  const $products=document.getElementById('products');
  PRODUCTS.forEach(p=>{
    const el=document.createElement('div');el.className='card';
    el.innerHTML = `<h3>${p.title}</h3><p class="muted">${p.desc}</p><div style="display:flex;justify-content:space-between;align-items:center"><div>${currencyFromCents(p.price_cents)}</div><a href="/product.html?id=${p.id}"><button>Acheter</button></a></div>`;
    $products.appendChild(el);
  });
}

if(window.location.pathname.endsWith('product.html')){
  const params=new URLSearchParams(location.search); const id=parseInt(params.get('id'));
  const p = PRODUCTS.find(x=>x.id===id);
  const $detail=document.getElementById('product-detail');
  if(!p){ $detail.innerHTML='<p>Produit introuvable</p>'; }
  else{
    $detail.innerHTML = `<div class="card"><h2>${p.title}</h2><p class="muted">${p.desc}</p><p style="font-weight:700">${currencyFromCents(p.price_cents)}</p><div style="display:flex;gap:8px"><button id="pay-stripe">Payer par carte (Stripe)</button><button id="pay-crypto">Payer en crypto</button></div></div>`;
    document.getElementById('pay-stripe').addEventListener('click',()=>startStripeCheckout(p));
    document.getElementById('pay-crypto').addEventListener('click',()=>startCryptoCheckout(p));
  }
}

// Stripe flow: create a Checkout Session server-side
async function startStripeCheckout(product){
  const email = prompt('Ton email (reçu & livraison) :','client@exemple.test');
  const res = await fetch('/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:product.id,email})});
  const data = await res.json();
  if(data.sessionId){
    // redirect using Stripe.js using returned publishable key
    const stripe = Stripe(data.publishableKey);
    await stripe.redirectToCheckout({sessionId: data.sessionId});
  } else { alert('Erreur lors de la création de la session'); }
}

// Crypto flow: create a Coinbase Commerce charge server-side and redirect to hosted page
async function startCryptoCheckout(product){
  const email = prompt('Ton email (reçu & livraison) :','client@exemple.test');
  const res = await fetch('/create-crypto-charge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:product.id,email})});
  const data = await res.json();
  if(data.hosted_url){ window.location = data.hosted_url; }
  else alert('Erreur création charge crypto');
}
