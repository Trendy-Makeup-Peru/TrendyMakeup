(function(){
  const grid = document.getElementById('grid');
  const brandScroller = document.getElementById('brandScroller');
  const searchInput = document.getElementById('searchInput');
  const productCount = document.getElementById('productCount');
  const emptyState = document.getElementById('emptyState');

  let activeBrand = 'Todas';
  let query = '';

  function money(n){ return 'S/.' + n; }

  function renderBrandChips(){
    const chips = ['Todas', ...BRANDS];
    brandScroller.innerHTML = chips.map(b =>
      `<button class="brand-chip${b===activeBrand?' active':''}" data-brand="${escapeAttr(b)}">${b}</button>`
    ).join('');
    brandScroller.querySelectorAll('.brand-chip').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeBrand = btn.dataset.brand;
        renderBrandChips();
        renderGrid();
      });
    });
  }

  function escapeAttr(s){ return s.replace(/"/g,'&quot;'); }
  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function matches(p){
    const brandOk = activeBrand==='Todas' || p.brand===activeBrand;
    if(!brandOk) return false;
    if(!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  }

  function renderGrid(){
    const list = PRODUCTS.filter(matches);
    productCount.textContent = PRODUCTS.length;
    if(list.length===0){
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';
    grid.innerHTML = list.map(p => `
      <a class="card" href="product.html?id=${p.id}" target="_blank" rel="noopener">
        <div class="card-media">
          <span class="tag-num">#${p.id+1}</span>
          ${p.promo ? '<span class="tag-promo">Promo</span>' : ''}
          <img src="${p.images[0]}" alt="${escapeAttr(p.name)}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-brand">${escapeHtml(p.brand)}</div>
          <div class="card-name">${escapeHtml(p.name)}</div>
          <div class="price-row">
            <span class="price-now">${money(p.promo || p.price)}</span>
            ${p.promo ? `<span class="price-was">${money(p.price)}</span>` : ''}
          </div>
          <button class="add-btn" data-id="${p.id}">+ Agregar al carrito</button>
        </div>
      </a>
    `).join('');
    grid.querySelectorAll('.add-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault(); e.stopPropagation();
        addToCart(parseInt(btn.dataset.id,10), 1);
        btn.textContent = 'Agregado ✓';
        setTimeout(()=>{ btn.textContent = '+ Agregar al carrito'; }, 1200);
      });
    });
  }

  searchInput.addEventListener('input', (e)=>{
    query = e.target.value.trim();
    renderGrid();
  });

  renderBrandChips();
  renderGrid();
})();
