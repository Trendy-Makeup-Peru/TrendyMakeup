(function(){
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'), 10);
  const isAdmin = params.get('admin') === '1';
  const product = PRODUCTS.find(p => p.id === id);
  const content = document.getElementById('content');

  if(!product){
    content.innerHTML = '<p>No encontramos este producto. <a href="index.html">Volver al catálogo</a>.</p>';
    return;
  }

  function money(n){ return 'S/.' + n; }
  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  const finalPrice = product.promo || product.price;
  const depositAmount = 30;
  const balanceApartado = Math.max(finalPrice - depositAmount, 0);
  const storageKey = 'preorden_precio_' + product.id;
  const defaultPreorden = Math.round(finalPrice * 0.85);
  let preordenPrice = parseInt(localStorage.getItem(storageKey), 10);
  if(isNaN(preordenPrice)) preordenPrice = defaultPreorden;

  document.title = product.name + ' — Trendy Makeup Perú';

  content.innerHTML = `
    <div class="detail-grid">
      <div>
        <div class="gallery-main"><img id="mainImg" src="${product.images[0]}" alt="${escapeHtml(product.name)}"></div>
        ${product.images.length > 1 ? `<div class="gallery-thumbs">
          ${product.images.map((src,i)=>`<button class="thumb${i===0?' active':''}" data-src="${src}"><img src="${src}" alt=""></button>`).join('')}
        </div>` : ''}
      </div>
      <div>
        <div class="detail-brand">${escapeHtml(product.brand)}</div>
        <h1 class="detail-name">${escapeHtml(product.name)}</h1>
        <p class="detail-desc">${escapeHtml(product.description) || 'Producto original, disponibilidad sujeta a stock.'}</p>

        <div class="price-block">
          <div class="price-display">
            <span class="now" id="priceNow">${money(finalPrice)}</span>
            ${product.promo ? `<span class="was">${money(product.price)}</span><span class="save">Promo</span>` : ''}
          </div>

          <div class="option-tabs">
            <button class="option-tab active" data-opt="completo">
              <span class="t-label">Pago completo</span>
              <span class="t-sub">Envío inmediato según stock</span>
            </button>
            <button class="option-tab" data-opt="apartado">
              <span class="t-label">Apartado</span>
              <span class="t-sub">Desde S/.30 · hasta 2 semanas</span>
            </button>
            <button class="option-tab" data-opt="preorden">
              <span class="t-label">Pre-Orden</span>
              <span class="t-sub">Precio especial · 20 días hábiles</span>
            </button>
          </div>

          <div id="panelCompleto" class="option-panel">
            <h4>Pago completo — entrega inmediata</h4>
            <p>Pagas el precio de stock y eliges el envío y método de pago al finalizar tu compra.</p>
            <div class="row"><span class="k">Precio en stock</span><span class="v">${money(finalPrice)}</span></div>
            <div class="qty-row">
              <span class="k">Cantidad</span>
              <div class="qty-stepper">
                <button type="button" id="qtyMinus">−</button>
                <span id="qtyValue">1</span>
                <button type="button" id="qtyPlus">+</button>
              </div>
            </div>
          </div>

          <div id="panelApartado" class="option-panel" style="display:none">
            <h4>Aparta este producto</h4>
            <p>Reservas el producto con un adelanto de S/.30. Tienes hasta 2 semanas para completar el pago restante y coordinar la entrega.</p>
            <div class="row"><span class="k">Adelanto para apartar</span><span class="v">${money(depositAmount)}</span></div>
            <div class="row"><span class="k">Saldo pendiente</span><span class="v">${money(balanceApartado)}</span></div>
            <div class="row"><span class="k">Plazo máximo</span><span class="v">2 semanas</span></div>
          </div>

          <div id="panelPreorden" class="option-panel" style="display:none">
            <h4>Pre-Orden a precio especial</h4>
            <p>Pre-ordena este producto a un precio más bajo. El tiempo de espera es de hasta 20 días hábiles porque se trae a pedido especial.</p>
            <div class="row"><span class="k">Precio Pre-Orden</span><span class="v" id="preordenPriceLabel">${money(preordenPrice)}</span></div>
            <div class="row"><span class="k">Tiempo de espera</span><span class="v">20 días hábiles</span></div>
            ${isAdmin ? `
              <div class="admin-edit">
                <input type="number" id="preordenInput" value="${preordenPrice}" min="1">
                <button id="savePreorden">Guardar precio</button>
              </div>
              <p class="admin-note">Modo tienda: este precio se guarda en este navegador. Visible solo para ti mientras uses este enlace con ?admin=1.</p>
            ` : ''}
          </div>

          <button class="cta-primary" id="ctaBtn">Comprar por WhatsApp</button>
          <a class="cta-secondary" id="ctaSecondary" href="cart.html" style="display:none">Ver carrito y finalizar compra &rarr;</a>

          <div class="trust-row">
            <div class="item">Producto 100% original</div>
            <div class="item">Traído a pedido desde USA</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // gallery thumbs
  document.querySelectorAll('.thumb').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById('mainImg').src = btn.dataset.src;
      document.querySelectorAll('.thumb').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // admin save
  const saveBtn = document.getElementById('savePreorden');
  if(saveBtn){
    saveBtn.addEventListener('click', ()=>{
      const val = parseInt(document.getElementById('preordenInput').value, 10);
      if(!isNaN(val) && val > 0){
        localStorage.setItem(storageKey, val);
        preordenPrice = val;
        document.getElementById('preordenPriceLabel').textContent = money(val);
        updateCta();
      }
    });
  }

  let currentOpt = 'completo';
  let qty = 1;
  const tabs = document.querySelectorAll('.option-tab');
  const panels = { completo: document.getElementById('panelCompleto'), apartado: document.getElementById('panelApartado'), preorden: document.getElementById('panelPreorden') };
  const cta = document.getElementById('ctaBtn');
  const ctaSecondary = document.getElementById('ctaSecondary');

  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  qtyMinus.addEventListener('click', ()=>{ if(qty>1){ qty--; qtyValue.textContent = qty; } });
  qtyPlus.addEventListener('click', ()=>{ qty++; qtyValue.textContent = qty; });

  function updateCta(){
    cta.classList.remove('sage','gold');
    ctaSecondary.style.display = 'none';
    let text = '';
    let waText = '';
    if(currentOpt === 'completo'){
      text = 'Agregar al carrito';
      cta.onclick = () => {
        addToCart(product.id, qty);
        cta.textContent = 'Agregado ✓ — Ver carrito';
        ctaSecondary.style.display = 'block';
      };
      cta.textContent = text;
      return;
    } else if(currentOpt === 'apartado'){
      cta.classList.add('sage');
      text = 'Apartar por WhatsApp — ' + money(depositAmount);
      waText = `Hola! Quiero apartar *${product.name}* (${product.brand}) con un adelanto de ${money(depositAmount)}. Entiendo que tengo hasta 2 semanas para pagar el saldo de ${money(balanceApartado)}.`;
    } else {
      cta.classList.add('gold');
      text = 'Pre-ordenar por WhatsApp — ' + money(preordenPrice);
      waText = `Hola! Quiero hacer Pre-Orden de *${product.name}* (${product.brand}) por ${money(preordenPrice)}, entiendo que el tiempo de espera es de 20 días hábiles.`;
    }
    cta.textContent = text;
    cta.onclick = () => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
  }

  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      currentOpt = tab.dataset.opt;
      Object.keys(panels).forEach(k=> panels[k].style.display = (k===currentOpt ? 'block' : 'none'));
      updateCta();
    });
  });

  updateCta();
})();
