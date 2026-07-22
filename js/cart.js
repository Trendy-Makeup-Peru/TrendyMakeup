// Shared cart utilities (localStorage based, per-browser cart)
const CART_KEY = 'tm_cart_v1';

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; }
}
function saveCartRaw(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(productId, qty){
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if(existing) existing.qty += qty;
  else cart.push({ id: productId, qty: qty });
  saveCartRaw(cart);
}
function removeFromCart(productId){
  saveCartRaw(getCart().filter(i => i.id !== productId));
}
function setQty(productId, qty){
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if(!item) return;
  if(qty <= 0){ removeFromCart(productId); return; }
  item.qty = qty;
  saveCartRaw(cart);
}
function clearCart(){ saveCartRaw([]); }
function cartCount(){ return getCart().reduce((s,i) => s + i.qty, 0); }
function cartItemsResolved(){
  return getCart().map(i => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return p ? { ...p, qty: i.qty } : null;
  }).filter(Boolean);
}
function cartSubtotal(){
  return cartItemsResolved().reduce((s,p) => s + (p.promo || p.price) * p.qty, 0);
}
function updateCartBadge(){
  const c = cartCount();
  document.querySelectorAll('.cart-badge').forEach(el=>{
    el.textContent = c;
    el.style.display = c > 0 ? 'flex' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', updateCartBadge);
