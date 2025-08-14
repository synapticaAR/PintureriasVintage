// ====== Datos ======
const money = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const V = (typeof window.IMG_VER==='string' ? window.IMG_VER : 'v6');
const BASE = (typeof window.ASSETS_BASE==='string' ? window.ASSETS_BASE : './assets/products');

const categories = ["Látex","Impermeabilizantes","Membranas","Revestimientos","Madera","Piletas"];

const P = id => [`${BASE}/p${id}-1`,`${BASE}/p${id}-2`,`${BASE}/p${id}-3`];
const products = [
  {id:1, brand:"Sinteplast", cat:"Látex", title:"Látex Interior/Exterior 20 L", price:74900, old:84500, imgs:P(1), desc:"Alta cobertura para interiores y exteriores. Secado rápido."},
  {id:2, brand:"Sinteplast", cat:"Látex", title:"Recuplast Interior Mate 20 L", price:133000, old:142000, imgs:P(2), desc:"Premium interior mate, máxima lavabilidad y duración."},
  {id:3, brand:"Sherwin-Williams", cat:"Látex", title:"Látex Interior Mate Z10 20 L", price:156000, old:176800, imgs:P(3), desc:"Excelente cubritivo y resistencia para interiores exigentes."},
  {id:4, brand:"Sinteplast", cat:"Impermeabilizantes", title:"Membrana Líquida 20 L", price:184200, old:199900, imgs:P(4), desc:"Recuplast Tradicional. Protección de techos de larga duración."},
  {id:5, brand:"Tersuave", cat:"Revestimientos", title:"Revestimiento Acrílico 15 L", price:122500, old:136000, imgs:P(5), desc:"Terminación texturada con alta resistencia."},
  {id:6, brand:"Sinteplast", cat:"Madera", title:"Barniz Marino Poliuretánico 4 L", price:93500, old:106000, imgs:P(6), desc:"Protección UV para exteriores."},
  {id:7, brand:"3M", cat:"Membranas", title:"Cinta Asfáltica Autoadhesiva 10 m", price:48900, old:54500, imgs:P(7), desc:"Sellado inmediato en techos y canaletas."},
  {id:8, brand:"Sinteplast", cat:"Piletas", title:"Pintura para Piletas 20 L", price:152000, old:171000, imgs:P(8), desc:"Color intenso y gran rendimiento en agua dulce/salada."},
];

// ====== Helpers DOM ======
const $ = s => document.querySelector(s);
const grid = $('#grid'); const catsRow = $('#catsRow'); const badge = $('#cartBadge');
let cart = [], selected = null;

// ====== UI ======
categories.forEach(c=>{
  const b=document.createElement('button');
  b.className='pill'; b.textContent=c; b.onclick=()=>filterByCategory(c);
  catsRow.appendChild(b);
});

function imgHTML(base, alt){
  const w = `${base}.webp?${V}`, p = `${base}.png?${V}`;
  return `<picture>
    <source srcset="${w}" type="image/webp">
    <img src="${p}" alt="${alt}" loading="lazy"
         onerror="this.onerror=null;this.src='${p}'">
  </picture>`;
}

function cardHTML(p){
  const base = p.imgs && p.imgs[0] ? p.imgs[0] : `${BASE}/p${p.id}-1`;
  return `
  <div class="col">
    <div class="card">
      <div class="thumb">${imgHTML(base, p.title)}</div>
      <div class="brandline">${p.brand} · ${p.cat}</div>
      <div class="title">${p.title}</div>
      <div><span class="old">${money(p.old)}</span> <span class="price">${money(p.price)}</span></div>
      <div class="small">6 cuotas sin interés</div>
      <div class="buyrow">
        <button class="btn" onclick="openProduct(${p.id})">Ver detalle</button>
        <button class="btn ghost" onclick="add(${p.id})">Agregar</button>
      </div>
    </div>
  </div>`;
}

function renderProducts(list=products){
  grid.innerHTML = list.map(cardHTML).join('');
  $('#resultsCount') && ($('#resultsCount').textContent = `${list.length} resultados`);
}
renderProducts();

function filterByCategory(c){
  renderProducts(products.filter(p=>p.cat===c));
}

// ====== Buscador ======
$('#q').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  renderProducts(products.filter(p=>(p.title+p.brand+p.cat).toLowerCase().includes(q)));
});

// ====== Modal producto ======
function buildModalMedia(prod){
  const imgs = prod.imgs && prod.imgs.length ? prod.imgs : [`${BASE}/p${prod.id}-1`];
  const main = document.querySelector('#m_main');
  const thumbs = document.querySelector('#m_thumbs');
  const m = (b)=> `<div class="media-main">${imgHTML(b, prod.title)}</div>`;
  main.innerHTML = m(imgs[0]);
  thumbs.innerHTML = imgs.map((b,i)=>`<button class="thumb ${i? '' : 'active'}" data-b="${b}">
    ${imgHTML(b, 'Vista '+(i+1))}</button>`).join('');
  thumbs.querySelectorAll('.thumb').forEach(btn=>btn.onclick=()=>{
    thumbs.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active'); main.innerHTML = m(btn.dataset.b);
  });
  // zoom
  main.onclick = ()=> openZoom(document.querySelector('#m_main img').src);
}
window.openProduct = function(id){
  selected=products.find(p=>p.id===id);
  $('#m_brand').textContent = `${selected.brand} · ${selected.cat}`;
  $('#m_title').textContent = selected.title;
  $('#m_desc').textContent = selected.desc;
  $('#m_old').textContent  = money(selected.old);
  $('#m_price').textContent= money(selected.price);
  $('#addBtn').onclick=()=>{ add(selected.id); toggleModal(false); };
  buildModalMedia(selected);
  toggleModal(true);
};
function toggleModal(show){ $('#productModal').classList.toggle('show',!!show); }
$('#productModal .backdrop').onclick=()=>toggleModal(false);

// ====== Carrito ======
function add(id){ const p=products.find(x=>x.id===id); cart.push(p); updateCart(); toast('Agregado al carrito'); }
function removeItem(i){ cart.splice(i,1); updateCart(); }
function updateCart(){
  const list=$('#cartItems'); list.innerHTML='';
  let subtotal=0;
  cart.forEach((it,i)=>{
    subtotal+=it.price;
    const b=it.imgs[0];
    const row=document.createElement('div'); row.className='row';
    row.innerHTML=`<img src="${b}.png?${V}" alt="" width="56" height="56">
      <div><div class="small">${it.brand}</div><div>${it.title}</div><div class="small">${money(it.price)}</div></div>
      <button class="icon-btn" onclick="removeItem(${i})">✕</button>`;
    list.appendChild(row);
  });
  $('#cartSubtotal').textContent = money(subtotal);
  $('#cartTotal').textContent    = money(subtotal);
  badge.style.display = cart.length? 'block':'none';
  badge.textContent   = cart.length;
}
$('#openCart').onclick=()=>$('.cart').classList.add('open');
$('#closeCart').onclick=()=>$('.cart').classList.remove('open');

function toast(t){ const el=$('#toast'); el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1500); }

// ====== Slider básico ======
const slides = $('#slides'); const dots = $('#dots'); let current=0;
function go(i){ current=i; slides.style.transform=`translateX(-${i*100}%)`; [...dots.children].forEach((d,k)=>d.classList.toggle('active',k===i)); }
function buildDots(){ dots.innerHTML=''; for(let i=0;i<3;i++){ const d=document.createElement('div'); d.className='dot'+(i===0?' active':''); d.onclick=()=>go(i); dots.appendChild(d);} }
buildDots(); setInterval(()=>{ current=(current+1)%3; go(current); }, 5000);
function scrollToProducts(){ document.querySelector('#grid').scrollIntoView({behavior:'smooth'}); }
window.filterByCategory = filterByCategory; window.scrollToProducts = scrollToProducts;

// ====== Zoom overlay ======
function openZoom(src){
  const z = document.querySelector('#zoomOverlay'); const zi = document.querySelector('#zoomImg');
  z.classList.remove('hidden'); zi.src = src; zi.style.transform = 'scale(1) translate(0px,0px)';
  let scale = 1, ox=0, oy=0, startX=0, startY=0, dragging=false;
  const setT = ()=> zi.style.transform = `scale(${scale}) translate(${ox}px,${oy}px)`;
  document.querySelector('#zoomIn').onclick=()=>{ scale=Math.min(3,scale+0.3); setT(); };
  document.querySelector('#zoomOut').onclick=()=>{ scale=Math.max(1,scale-0.3); setT(); };
  document.querySelector('#zoomClose').onclick=()=> z.classList.add('hidden');
  zi.onmousedown = (e)=>{ dragging=true; startX=e.clientX; startY=e.clientY; };
  zi.onmouseup = ()=> dragging=false; zi.onmouseleave = ()=> dragging=false;
  zi.onmousemove = (e)=>{ if(!dragging||scale===1) return; ox += (e.clientX-startX)/scale; oy += (e.clientY-startY)/scale; startX=e.clientX; startY=e.clientY; setT(); };
  zi.ontouchstart = (e)=>{ if(e.touches.length===1){ dragging=true; startX=e.touches[0].clientX; startY=e.touches[0].clientY; } };
  zi.ontouchend = ()=> dragging=false;
  zi.ontouchmove = (e)=>{ if(!dragging||scale===1) return; const t=e.touches[0]; ox += (t.clientX-startX)/scale; oy += (t.clientY-startY)/scale; startX=t.clientX; startY=t.clientY; setT(); };
}
