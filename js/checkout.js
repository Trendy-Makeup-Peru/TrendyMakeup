(function(){
  const cartContent = document.getElementById('cartContent');
  function money(n){ return 'S/.' + n; }
  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  let deliveryMethod = 'motorizado';
  let district = Object.keys(DELIVERY_ZONES)[0];
  let paymentMethod = 'yape';

  function deliveryFee(){
    if(deliveryMethod === 'motorizado') return DELIVERY_ZONES[district] ?? null;
    return null; // Shalom / Olva: se coordina según agencia/destino
  }

  function render(){
    const items = cartItemsResolved();

    if(items.length === 0){
      cartContent.innerHTML = `
        <div class="empty-state">
          <p>Tu carrito está vacío.</p>
          <p><a class="cta-secondary" href="index.html">Ver catálogo</a> &nbsp;·&nbsp;
          <a class="cta-secondary" href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">O pide directo por WhatsApp</a></p>
        </div>`;
      return;
    }

    const subtotal = cartSubtotal();
    const fee = deliveryFee();
    const total = subtotal + (fee || 0);

    cartContent.innerHTML = `
      <div class="cart-items">
        ${items.map(p => `
          <div class="cart-item">
            <img src="${p.images[0]}" alt="${escapeHtml(p.name)}">
            <div class="ci-info">
              <div class="card-brand">${escapeHtml(p.brand)}</div>
              <div class="card-name">${escapeHtml(p.name)}</div>
              <div class="price-row">
                <span class="price-now">${money(p.promo || p.price)}</span>
                ${p.promo ? `<span class="price-was">${money(p.price)}</span>` : ''}
              </div>
            </div>
            <div class="ci-controls">
              <div class="qty-stepper">
                <button type="button" class="ci-minus" data-id="${p.id}">−</button>
                <span>${p.qty}</span>
                <button type="button" class="ci-plus" data-id="${p.id}">+</button>
              </div>
              <button type="button" class="ci-remove" data-id="${p.id}">Quitar</button>
            </div>
            <div class="ci-total">${money((p.promo || p.price) * p.qty)}</div>
          </div>
        `).join('')}
      </div>

      <div class="price-block">
        <h4 style="margin-bottom:10px">Método de envío</h4>
        <div class="option-tabs" id="deliveryTabs">
          <button class="option-tab${deliveryMethod==='motorizado'?' active':''}" data-d="motorizado">
            <span class="t-label">Motorizado</span>
            <span class="t-sub">Solo Lima · según distrito</span>
          </button>
          <button class="option-tab${deliveryMethod==='shalom'?' active':''}" data-d="shalom">
            <span class="t-label">Shalom</span>
            <span class="t-sub">Envío a todo el Perú</span>
          </button>
          <button class="option-tab${deliveryMethod==='olva'?' active':''}" data-d="olva">
            <span class="t-label">Olva Courier</span>
            <span class="t-sub">Envío a todo el Perú</span>
          </button>
        </div>

        <div class="option-panel" id="deliveryPanel"></div>

        <h4 style="margin:20px 0 10px">Método de pago</h4>
        <div class="option-tabs" id="paymentTabs">
          <button class="option-tab${paymentMethod==='yape'?' active':''}" data-p="yape">
            <span class="t-label">Yape</span>
            <span class="t-sub">Al instante</span>
          </button>
          <button class="option-tab${paymentMethod==='transferencia'?' active':''}" data-p="transferencia">
            <span class="t-label">Transferencia</span>
            <span class="t-sub">BCP / BBVA / Interbank</span>
          </button>
          <button class="option-tab${paymentMethod==='tarjeta'?' active':''}" data-p="tarjeta">
            <span class="t-label">Tarjeta</span>
            <span class="t-sub">Link de pago Izipay</span>
          </button>
        </div>
        <div class="option-panel" id="paymentPanel"></div>

        <div class="row"><span class="k">Subtotal</span><span class="v">${money(subtotal)}</span></div>
        <div class="row"><span class="k">Envío</span><span class="v" id="feeLabel">${fee != null ? money(fee) : 'A coordinar'}</span></div>
        <div class="row"><span class="k" style="font-weight:700">Total estimado</span><span class="v" style="font-size:17px" id="totalLabel">${fee != null ? money(total) : money(subtotal) + ' + envío'}</span></div>

        <button class="cta-primary" id="checkoutBtn" style="margin-top:14px">Confirmar pedido por WhatsApp</button>
        <p class="admin-note" style="text-align:center">También puedes <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">escribirnos directo al 944 320 685</a> para pedir por WhatsApp.</p>
      </div>
    `;

    renderDeliveryPanel();
    renderPaymentPanel();
    wireItemControls();
    wireTabs();
    wireCheckout(items, subtotal);
  }

  function renderDeliveryPanel(){
    const panel = document.getElementById('deliveryPanel');
    if(deliveryMethod === 'motorizado'){
      panel.innerHTML = `
        <p>Tarifa plana según distrito en Lima y Callao.</p>
        <div class="row" style="border-top:none">
          <span class="k">Distrito</span>
          <select id="districtSelect">
            ${Object.keys(DELIVERY_ZONES).map(d => `<option value="${d}" ${d===district?'selected':''}>${d} — ${money(DELIVERY_ZONES[d])}</option>`).join('')}
          </select>
        </div>
        <div class="row"><span class="k">Costo de envío</span><span class="v">${money(DELIVERY_ZONES[district])}</span></div>
        <p><a href="${COVERAGE_MAP_URL}" target="_blank" rel="noopener">Ver zonas de cobertura en el mapa &rarr;</a></p>
      `;
      const sel = document.getElementById('districtSelect');
      sel.addEventListener('change', ()=>{ district = sel.value; render(); });
    } else if(deliveryMethod === 'shalom'){
      panel.innerHTML = `<p>Envío por agencia Shalom a nivel nacional. El costo lo indica la agencia según destino y se paga al recojo o coordinando por WhatsApp.</p>`;
    } else {
      panel.innerHTML = `<p>Envío por Olva Courier a nivel nacional. El costo lo indica la agencia según destino y se paga al recojo o coordinando por WhatsApp.</p>`;
    }
  }

  function renderPaymentPanel(){
    const panel = document.getElementById('paymentPanel');
    if(paymentMethod === 'yape'){
      panel.innerHTML = `
        <h4>Paga con Yape</h4>
        <div class="row" style="border-top:none"><span class="k">Número</span><span class="v">${YAPE_NUMBER}</span></div>
        <div class="row"><span class="k">A nombre de</span><span class="v">${YAPE_NAME}</span></div>
        <p>Realiza el Yape y envía tu comprobante por WhatsApp para confirmar tu pedido.</p>
      `;
    } else if(paymentMethod === 'transferencia'){
      panel.innerHTML = `
        <h4>Transferencia bancaria</h4>
        <p>Escríbenos por WhatsApp y te compartimos el número de cuenta para tu transferencia.</p>
      `;
    } else {
      panel.innerHTML = `
        <h4>Pago con tarjeta (Izipay)</h4>
        <p>Al confirmar, te escribimos por WhatsApp para generar tu link de pago seguro con Izipay y completar tu compra con tarjeta.</p>
      `;
    }
  }

  function wireItemControls(){
    document.querySelectorAll('.ci-minus').forEach(b=>b.addEventListener('click', ()=>{
      const id = parseInt(b.dataset.id,10);
      const item = getCart().find(i=>i.id===id);
      if(item) setQty(id, item.qty - 1);
      render();
    }));
    document.querySelectorAll('.ci-plus').forEach(b=>b.addEventListener('click', ()=>{
      const id = parseInt(b.dataset.id,10);
      const item = getCart().find(i=>i.id===id);
      if(item) setQty(id, item.qty + 1);
      render();
    }));
    document.querySelectorAll('.ci-remove').forEach(b=>b.addEventListener('click', ()=>{
      removeFromCart(parseInt(b.dataset.id,10));
      render();
    }));
  }

  function wireTabs(){
    document.querySelectorAll('#deliveryTabs .option-tab').forEach(t=>t.addEventListener('click', ()=>{
      deliveryMethod = t.dataset.d; render();
    }));
    document.querySelectorAll('#paymentTabs .option-tab').forEach(t=>t.addEventListener('click', ()=>{
      paymentMethod = t.dataset.p; render();
    }));
  }

  function wireCheckout(items, subtotal){
    const btn = document.getElementById('checkoutBtn');
    btn.addEventListener('click', ()=>{
      const fee = deliveryFee();
      const total = subtotal + (fee || 0);
      let lines = [`Hola! Quiero confirmar mi pedido:`, ''];
      items.forEach(p=>{
        lines.push(`• ${p.name} (${p.brand}) x${p.qty} — ${money((p.promo||p.price)*p.qty)}`);
      });
      lines.push('');
      lines.push(`Subtotal: ${money(subtotal)}`);

      const deliveryLabelMap = { motorizado: `Motorizado — ${district}`, shalom: 'Shalom (envío nacional)', olva: 'Olva Courier (envío nacional)' };
      lines.push(`Envío: ${deliveryLabelMap[deliveryMethod]}${fee != null ? ' — ' + money(fee) : ' (costo a coordinar)'}`);
      if(fee != null) lines.push(`Total estimado: ${money(total)}`);

      if(paymentMethod === 'yape'){
        lines.push(`Pago: Yape al ${YAPE_NUMBER} (${YAPE_NAME}). Adjunto mi comprobante.`);
      } else if(paymentMethod === 'transferencia'){
        lines.push(`Pago: Transferencia bancaria. Por favor comparte el número de cuenta.`);
      } else {
        lines.push(`Pago: Tarjeta. Por favor genera mi link de pago Izipay.`);
      }

      const waText = lines.join('\n');
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
    });
  }

  render();
})();
