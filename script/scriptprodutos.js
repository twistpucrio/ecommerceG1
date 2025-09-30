document.addEventListener('DOMContentLoaded', () => {
  // A classe EcommerceAPI deve ser importada ANTES deste script.
  const api = new EcommerceAPI();
  const productListEl = document.getElementById('product-list');
  const isLoggedIn = !!localStorage.getItem('ecommerce_session');

  // --- Helpers de URL ---
  function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria') || 'todos';
  }
  function getQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get('q') || '').trim();
  }

  // --- Normalização segura (sem regex \p{}) ---
  function norm(s) {
    if (!s) return '';
    try {
      return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    } catch (_e) {
      return String(s).toLowerCase();
    }
  }

  // --- Renderização dos produtos ---
  function renderProducts(products) {
    productListEl.innerHTML = '';
    if (!products || products.length === 0) {
      productListEl.innerHTML = '<p>Nenhum produto encontrado nesta busca/categoria.</p>';
      return;
    }

    products.forEach(product => {
      const itemEl = document.createElement('div');
      itemEl.className = 'product-item';

      const favoriteBtnHtml = isLoggedIn
        ? `<button class="add-to-favorites-btn" data-product-id="${product.id}">❤️</button>`
        : '';

      itemEl.innerHTML = `
        <img src="${product.image}" alt="${product.name}" width="180" height="200">
        <div class="info">
          <h3>${product.name}</h3>
          <div class="price">R$${Number(product.price).toFixed(2)}</div>
        </div>
        <button data-product-id="${product.id}">Adicione ao carrinho</button>
        ${favoriteBtnHtml}
      `;
      productListEl.appendChild(itemEl);
    });
  }

  // --- Clique nos botões (carrinho/favoritos) ---
  productListEl.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName !== 'BUTTON' || !target.dataset.productId) return;

    const productId = parseInt(target.dataset.productId, 10);
    api.listProducts().then(products => {
      const productToHandle = products.find(p => p.id === productId);
      if (!productToHandle) return;

      if (target.classList.contains('add-to-favorites-btn')) {
        const wasAdded = api.addToFavorites(productToHandle);
        alert(wasAdded
          ? `${productToHandle.name} adicionado aos favoritos! ❤️`
          : `Esse produto já foi adicionado aos favoritos.`
        );
      } else {
        api.addToCart(productToHandle);
        alert(`${productToHandle.name} adicionado ao carrinho!`);
      }
    }).catch(err => console.error('Erro ao manipular o produto:', err));
  });

  // --- Carregar e aplicar filtros (categoria + q) ---
  api.listProducts().then(products => {
    let lista = Array.isArray(products) ? products : [];

    const categoriaSelecionada = getCategoryFromUrl();
    if (categoriaSelecionada !== 'todos') {
      lista = lista.filter(p => String(p.category) === String(categoriaSelecionada));
    }

    const q = getQueryFromUrl();
    if (q) {
      const nq = norm(q);
      lista = lista.filter(p => {
        const nome = norm(p.name);
        const cat  = norm(p.category);
        return nome.includes(nq) || cat.includes(nq);
      });
    }

    renderProducts(lista);
  }).catch(error => {
    console.error('Erro ao carregar produtos:', error);
    productListEl.innerHTML = '<p>Erro ao carregar produtos.</p>';
  });
});
