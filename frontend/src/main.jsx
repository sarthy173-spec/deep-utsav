import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const money = (paise) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);
function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem('deep-utsav-cart') || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([id, qty]) => /^[1-4]$/.test(id) && Number.isInteger(qty) && qty > 0 && qty <= 10));
  } catch { return {}; }
}
function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [cart, setCart] = useState(readCart);
  const [message, setMessage] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [orderError, setOrderError] = useState('');
  const dialog = useRef(null);
  const requestId = useRef(null);
  async function load() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('The shop could not load. Please try again.');
      setProducts(await response.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { try { localStorage.setItem('deep-utsav-cart', JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 2600); return () => clearTimeout(timer); }, [message]);
  const items = products.filter(p => cart[p.id]).map(p => ({...p, quantity: cart[p.id]}));
  const count = items.reduce((n,p) => n+p.quantity, 0);
  const subtotal = items.reduce((n,p) => n+p.price_paise*p.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 99900 ? 0 : 5900;
  let visible = products.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  if (sort !== 'featured') visible = [...visible].sort((a,b) => sort === 'low' ? a.price_paise-b.price_paise : b.price_paise-a.price_paise);
  function change(id, amount) {
    if (busy) return;
    requestId.current = null; setOrderError('');
    setCart(old => { const next = {...old}; const qty = (next[id] || 0)+amount; if (qty <= 0) delete next[id]; else next[id] = Math.min(10, qty); return next; });
  }
  function openCart() { setReceipt(null); setOrderError(''); dialog.current.showModal(); }
  async function checkout() {
    if (!items.length || busy) return;
    setBusy(true); setOrderError('');
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch('/api/orders', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({request_id:requestId.current, items:items.map(p => ({id:p.id,quantity:p.quantity}))})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to place demo order.');
      setReceipt(data); setCart({}); requestId.current = null;
    } catch (e) { setOrderError(e.message); }
    finally { setBusy(false); }
  }
  return <>
    <div className="announcement">A season of light, a home full of joy <span>✦</span> Explore the Diwali collection</div>
    <header><a className="brand" href="#" aria-label="Deep Utsav home"><span className="brand-mark">✺</span><span>deep utsav<small>THE FESTIVE EDIT</small></span></a><nav aria-label="Main navigation"><a href="#collection">Shop collection</a><a href="#story">Our inspiration</a></nav><button className="bag" onClick={openCart}>Bag <span>{count}</span></button></header>
    <main>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">THE DIWALI COLLECTION</p><h1>A little light.<br/><em>A lot of joy.</em></h1><p>Beautiful panatis, glowing kandils and thoughtful gifts. Bring the warmth of Diwali into every corner of your home.</p><a className="primary" href="#collection">Discover the collection <span>↗</span></a><div className="hero-note"><span>✺</span> Little details. Beautiful celebrations.</div></div><div className="hero-image"><img src="/images/hero.png" alt="Glowing terracotta and painted panatis with a red kandil and brass lotus holders"/><span className="image-label">LIGHT UP YOUR EVERYDAY</span></div></section>
      <div className="benefits"><span>✧ Festive favourites</span><span>✧ Gifts with a warm glow</span><span>✧ Inspired by Indian traditions</span></div>
      <section id="collection" className="collection"><div className="section-heading"><div><p className="eyebrow">SMALL THINGS, BIG CELEBRATIONS</p><h2>Find your festive glow</h2></div><p>For your home. For your favourite people.</p></div>
        <div className="toolbar"><div className="categories" aria-label="Filter products">{['All','Panatis','Decor','Gifts'].map(c => <button key={c} aria-pressed={category===c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="search-sort"><label className="search"><span className="sr-only">Search products</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the collection…" type="search"/></label><label><span className="sr-only">Sort products</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
        {loading ? <p className="state" role="status">Lighting up the collection…</p> : error ? <div className="state" role="alert"><p>{error}</p><button onClick={load}>Try again</button></div> : !visible.length ? <div className="state"><h3>No matching products</h3><button onClick={()=>{setQuery('');setCategory('All');}}>Clear filters</button></div> : <div className="product-grid">{visible.map(p=><article className="product" key={p.id}><div className="product-photo"><img src={p.image} alt={p.name} loading="lazy"/><span className="tag">{p.tag}</span></div><div className="product-meta"><small>{p.category} · {p.unit}</small><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price_paise)}</strong><button disabled={(cart[p.id]||0)>=10} aria-label={`Add ${p.name} to bag`} onClick={()=>{change(p.id,1);setMessage(`${p.name} added to your bag`);}}>{(cart[p.id]||0)>=10?'Limit reached':'Add to bag +'}</button></div></div></article>)}</div>}
        <p className="sample-note">Sample prices and AI-generated product imagery. This is a demonstration shop.</p>
      </section>
      <section id="story" className="story"><span className="story-star">✺</span><div><p className="eyebrow">ROOTED IN TRADITION</p><h2>Some traditions<br/>never lose their glow.</h2></div><div><p>The first panati at the doorstep. The kandil by the window. A little gift, wrapped with love. Deep Utsav is inspired by the moments that make Diwali feel like home.</p><a href="#collection">Make room for a little light ↗</a></div></section>
    </main>
    <footer><a className="brand" href="#">deep utsav</a><p>A little light. A lot of joy.</p><small>Portfolio demo · No real payments or deliveries</small></footer>
    <div className={`toast ${message?'show':''}`} role="status">{message}</div>
    <dialog ref={dialog} onCancel={e=>{if(busy)e.preventDefault();}}><div className="dialog-head"><h2>{receipt?'A little joy, on its way*':'Your festive bag'}</h2><button className="close" disabled={busy} onClick={()=>dialog.current.close()} aria-label="Close bag">×</button></div>
      {receipt ? <div className="receipt"><span className="success-mark">✓</span><h3>Demo order created</h3><p>Reference: <strong>{receipt.order_id}</strong></p><p>Total: <strong>{money(receipt.total_paise)}</strong></p><p>*This is a practice order. No payment was taken and nothing will be delivered.</p><button className="primary" onClick={()=>dialog.current.close()}>Continue exploring</button></div> : <>
        {!items.length ? <div className="state"><h3>Your bag is waiting for a little light.</h3><p>Add a festive favourite to get started.</p><button className="primary" onClick={()=>dialog.current.close()}>Explore collection</button></div> : <><div className="cart-items">{items.map(p=><div className="cart-item" key={p.id}><img src={p.image} alt=""/><div><h3>{p.name}</h3><p>{money(p.price_paise)} / {p.unit}</p><div className="quantity"><button disabled={busy} aria-label={`Decrease ${p.name}`} onClick={()=>change(p.id,-1)}>−</button><span>{p.quantity}</span><button disabled={busy||p.quantity>=10} aria-label={`Increase ${p.name}`} onClick={()=>change(p.id,1)}>+</button><button className="remove" disabled={busy} onClick={()=>change(p.id,-p.quantity)}>Remove</button></div></div><strong>{money(p.price_paise*p.quantity)}</strong></div>)}</div><div className="totals"><p><span>Subtotal</span><span>{money(subtotal)}</span></p><p><span>Demo delivery</span><span>{shipping?money(shipping):'Free'}</span></p><small>Free demo delivery from ₹999. Otherwise ₹59. Prices include demo taxes.</small><p className="grand-total"><span>Total</span><span>{money(subtotal+shipping)}</span></p></div><p className="checkout-note">Practice checkout only. No address, payment or personal information needed. Maximum 10 of each item per order.</p>{orderError&&<p role="alert" className="error">{orderError}</p>}<button className="primary checkout" onClick={checkout} disabled={busy}>{busy?'Creating your demo order…':'Place demo order →'}</button></>}
      </>}
    </dialog>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
