
// ===== Datos y util =====
const money = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const V = (typeof window.IMG_VER==='string' ? window.IMG_VER : 'v1');
const BASE = (typeof window.ASSETS_BASE==='string' ? window.ASSETS_BASE : './assets/products');
const $ = s => document.querySelector(s);

const categories = ["Látex","Impermeabilizantes","Membranas","Revestimientos","Madera","Piletas"];
const P = id => [`${BASE}/p${id}-1`,`${BASE}/p${id}-2`,`${BASE}/p${id}-3`];
const products = [
  {id:1, sku:'LAT-20L-SIN', brand:"Sinteplast", cat:"Látex", title:"Látex Interior/Exterior 20 L", price:74900, old:84500, stock:25, imgs:P(1), desc:"Alta cobertura para interiores y exteriores. Secado rápido."},
  {id:2, sku:'REC-20L-SIN', brand:"Sinteplast", cat:"Látex", title:"Recuplast Interior Mate 20 L", price:133000, old:142000, stock:18, imgs:P(2), desc:"Premium interior mate, máxima lavabilidad y duración."},
  {id:3, sku:'Z10-20L-SHW', brand:"Sherwin-Williams", cat:"Látex", title:"Látex Interior Mate Z10 20 L", price:156000, old:176800, stock:12, imgs:P(3), desc:"Excelente cubritivo y resistencia para interiores exigentes."},
  {id:4, sku:'MEM-20L-SIN', brand:"Sinteplast", cat:"Impermeabilizantes", title:"Membrana Líquida 20 L", price:184200, old:199900, stock:10, imgs:P(4), desc:"Recuplast Tradicional. Protección de techos de larga duración."},
  {id:5, sku:'REV-15L-TER', brand:"Tersuave", cat:"Revestimientos", title:"Revestimiento Acrílico 15 L", price:122500, old:136000, stock:20, imgs:P(5), desc:"Textura acrílica de alta resistencia y terminación premium."},
  {id:6, sku:'BAR-4L-SIN', brand:"Sinteplast", cat:"Madera", title:"Barniz Marino Poliuretánico 4 L", price:93500, old:106000, stock:30, imgs:P(6), desc:"Protección UV para exteriores. Alta dureza y brillo."},
  {id:7, sku:'CIN-10M-3M', brand:"3M", cat:"Membranas", title:"Cinta Asfáltica Autoadhesiva 10 m", price:48900, old:54500, stock:35, imgs:P(7), desc:"Sellado inmediato en techos y canaletas. Fácil aplicación."},
  {id:8, sku:'PIL-20L-SIN', brand:"Sinteplast", cat:"Piletas", title:"Pintura para Piletas 20 L", price:152000, old:171000, stock:14, imgs:P(8), desc:"Color intenso y gran rendimiento en agua dulce/salada."},
];
const brands = [...new Set(products.map(p=>p.brand))];

// ===== Estado =====
let cart = JSON.parse(localStorage.getItem('pv-cart')||'[]');
function saveCart(){ localStorage.setItem('pv-cart', JSON.stringify(cart)); }

// ===== UI base =====
const catsRow = $('#catsRow'); const grid = $('#grid'); const badge = $('#cartBadge');
categories.forEach(c=>{ const b=document.createElement('button'); b.className='pill'; b.textContent=c; b.onclick=()=>filterByCategory(c); catsRow.appendChild(b); });
document.querySelectorAll('nav [data-cat]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); filterByCategory(a.dataset.cat);}));

// ===== Render =====
function imgHTML(base, alt){
  const w = `${base}.webp?${V}`, p = `${base}.png?${V}`;
  return `<picture><source srcset="${w}" type="image/webp"><img src="${p}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${p}'"></picture>`;
}
function offPct(p){ return p.old && p.old>p.price ? Math.round( (1 - (p.price/p.old)) * 100 ) : 0; }
function cardHTML(p){
  const base = p.imgs[0];
  const off = offPct(p);
  return `<div class="col">
    <div class="card">
      <div class="thumb">${imgHTML(base, p.title)}</div>
      <div class="brandline">${p.brand} · ${p.cat}</div>
      <div class="title">${p.title}</div>
      <div class="price-row">
        ${p.old?`<span class="old">${money(p.old)}</span>`:''}
        <span class="price">${money(p.price)}</span>
        ${off?`<span class="badge-off">-${off}%</span>`:''}
      </div>
      <div class="small">SKU ${p.sku} · Stock ${p.stock}</div>
      <div class="buyrow">
        <button class="btn" onclick="openProduct(${p.id})">Ver detalle</button>
        <button class="btn ghost" onclick="add(${p.id},1)">Agregar</button>
      </div>
    </div>
  </div>`;
}
function renderProducts(list=products){
  grid.innerHTML = list.map(cardHTML).join('');
  const r = $('#resultsCount'); if(r) r.textContent = `${list.length} resultados`;
}
renderProducts(products);

// ===== Filtros y Orden =====
$('#q').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  const filtered = products.filter(p=>(p.title+p.brand+p.cat+p.sku).toLowerCase().includes(q));
  renderProducts(filtered);
});
const selBrand = $('#brandFilter'); brands.forEach(b=>{ const o=document.createElement('option'); o.value=b; o.textContent=b; selBrand.appendChild(o); });
$('#brandFilter').addEventListener('change',()=>applyFilters());
const priceRange = $('#priceRange'); const priceLabel = $('#priceLabel'); priceRange.addEventListener('input',()=>applyFilters());
$('#sort').addEventListener('change',()=>applyFilters());
function applyFilters(){
  const qv = $('#q').value.toLowerCase();
  const bv = selBrand.value;
  const pv = +priceRange.value || 0; priceLabel.textContent = pv? `Hasta: ${money(pv)}` : 'Hasta: sin límite';
  let list = products.filter(p=>(p.title+p.brand+p.cat+p.sku).toLowerCase().includes(qv));
  if (bv) list = list.filter(p=>p.brand===bv);
  if (pv) list = list.filter(p=>p.price<=pv);
  const s = $('#sort').value;
  if (s==='menor') list.sort((a,b)=>a.price-b.price);
  if (s==='mayor') list.sort((a,b)=>b.price-a.price);
  if (s==='descuento') list.sort((a,b)=>offPct(b)-offPct(a));
  renderProducts(list);
}
function filterByCategory(c){
  document.querySelectorAll('.pill').forEach(p=>p.classList.toggle('active',p.textContent===c));
  renderProducts(products.filter(p=>p.cat===c));
}
window.filterByCategory = filterByCategory;

// ===== Modal Producto =====
let selected=null;
function buildModalMedia(prod){
  const main = document.querySelector('#m_main'); const thumbs = document.querySelector('#m_thumbs');
  const view = b => `<div class="media-main">${imgHTML(b, prod.title)}</div>`;
  main.innerHTML = view(prod.imgs[0]);
  thumbs.innerHTML = prod.imgs.map((b,i)=>`<button class="thumb ${i? '' : 'active'}" data-b="${b}">${imgHTML(b, 'Vista '+(i+1))}</button>`).join('');
  thumbs.querySelectorAll('.thumb').forEach(btn=>btn.onclick=()=>{
    thumbs.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active'); main.innerHTML = view(btn.dataset.b);
  });
}
window.openProduct = function(id){
  selected = products.find(p=>p.id===id);
  $('#m_brand').textContent = `${selected.brand} · ${selected.cat}`;
  $('#m_title').textContent = selected.title;
  $('#m_desc').textContent = selected.desc;
  $('#m_sku').textContent = selected.sku;
  $('#m_old').textContent  = selected.old ? money(selected.old) : '';
  $('#m_price').textContent= money(selected.price);
  const off = offPct(selected); $('#m_off').textContent = off? `-${off}%` : '';
  $('#m_stock').textContent= selected.stock;
  $('#qval').value = 1;
  $('#qminus').onclick=()=>{ const v=Math.max(1, (+$('#qval').value||1)-1 ); $('#qval').value=v; };
  $('#qplus').onclick=()=>{ const v=Math.min(selected.stock, (+$('#qval').value||1)+1 ); $('#qval').value=v; };
  $('#addBtn').onclick=()=>{ add(selected.id, +$('#qval').value||1 ); toggleModal(false); };
  buildModalMedia(selected);
  toggleModal(true);
};
function toggleModal(show){ document.querySelector('#productModal').classList.toggle('show', !!show); }
document.querySelector('#productModal .backdrop').onclick=()=>toggleModal(false);

// ===== Carrito =====
function add(id, qty=1){
  const p = products.find(x=>x.id===id);
  const i = cart.findIndex(it=>it.id===id);
  if (i>=0){ cart[i].qty = Math.min(p.stock, cart[i].qty + qty); }
  else { cart.push({id:p.id, title:p.title, brand:p.brand, price:p.price, img:p.imgs[0], qty: Math.min(qty, p.stock)}); }
  updateCart(); toast('Agregado al carrito');
}
function removeItem(idx){ cart.splice(idx,1); updateCart(); }
function changeQty(idx, delta){
  const p = products.find(x=>x.id===cart[idx].id);
  cart[idx].qty = Math.max(1, Math.min(p.stock, cart[idx].qty + delta));
  updateCart();
}
function updateCart(){
  saveCart();
  const list = $('#cartItems'); list.innerHTML='';
  let subtotal=0;
  cart.forEach((it,i)=>{
    subtotal += it.price*it.qty;
    const row = document.createElement('div'); row.className='row';
    row.innerHTML = `<img src="${it.img}.png?${V}" alt="">
      <div>
        <div class="small">${it.brand}</div>
        <div>${it.title}</div>
        <div class="small">${money(it.price)}</div>
        <div class="qty"><button onclick="changeQty(${i},-1)">−</button><input value="${it.qty}" readonly><button onclick="changeQty(${i},1)">+</button></div>
      </div>
      <button class="icon-btn" onclick="removeItem(${i})">✕</button>`;
    list.appendChild(row);
  });
  $('#cartSubtotal').textContent = money(subtotal);
  $('#cartTotal').textContent = money(subtotal);
  const count = cart.reduce((a,c)=>a+c.qty,0);
  const badge = $('#cartBadge'); badge.style.display = count? 'inline-block':'none'; badge.textContent = count;
}
updateCart();

$('#openCart').onclick=()=>document.querySelector('.cart').classList.add('open');
$('#closeCart').onclick=()=>document.querySelector('.cart').classList.remove('open');
document.querySelector('#payBtn').onclick=()=>alert('Demo: conectar Checkout luego');

function toast(t){ const el=$('#toast'); el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1300); }

// ===== Slider =====
const slides = document.querySelector('#slides'); const dots = document.querySelector('#dots'); let current=0;
function go(i){ current=i; slides.style.transform = `translateX(-${i*100}%)`; [...dots.children].forEach((d,k)=>d.classList.toggle('active',k===i)); }
function buildDots(){ dots.innerHTML=''; for(let i=0;i<3;i++){ const d=document.createElement('div'); d.className='dot'+(i===0?' active':''); d.onclick=()=>go(i); dots.appendChild(d);} }
buildDots(); setInterval(()=>{ current=(current+1)%3; go(current); }, 5000);
function scrollToProducts(){ document.querySelector('#grid').scrollIntoView({behavior:'smooth'}); }
window.scrollToProducts = scrollToProducts;
