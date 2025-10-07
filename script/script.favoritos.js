document.addEventListener('DOMContentLoaded', () => {
  const api = new EcommerceAPI();
  const favoritesListEl = document.getElementById('favorites-list');

  const loadFavorites = () => {
    try { return JSON.parse(localStorage.getItem('favorites')) || []; }
    catch { return []; }
  };
  const saveFavorites = (arr) => localStorage.setItem('favorites', JSON.stringify(arr));

  function renderFavorites(favorites) {
    favoritesListEl.innerHTML = '';
    if (!favorites.length) {
      favoritesListEl.innerHTML = '<p>Você não tem nenhum produto favorito. Adicione alguns na página de produtos!</p>';
      return;
    }
    favorites.forEach(product => {
      const itemEl = document.createElement('div');
      itemEl.className = 'favorite-item';
      const price = Number(product.price || 0);
      itemEl.innerHTML = `
        <div class="product-item">
          <img src="${product.image || ''}" alt="${product.name || ''}" width="180" height="200">
          <div class="info">
            <h3>${product.name || 'Produto'}</h3>
            <div class="price">R$${price.toFixed(2)}</div>
          </div>
          <button class="remove-from-favorites-btn" data-product-id="${product.id}">Remover dos favoritos</button>
          <button class="modal-add-to-cart-btn" data-product-id="${product.id}">Adicionar ao carrinho</button>
        </div>
      `;
      favoritesListEl.appendChild(itemEl);
    });
  }

  function removeFromFavorites(productId) {
    const next = loadFavorites().filter(p => String(p.id) !== String(productId));
    saveFavorites(next);
    renderFavorites(next);
  }

  favoritesListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-product-id]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const productIdRaw = btn.dataset.productId;
    const productId = /^\d+$/.test(String(productIdRaw)) ? Number(productIdRaw) : String(productIdRaw);

    if (btn.classList.contains('remove-from-favorites-btn')) {
      removeFromFavorites(productId);
      return;
    }
    if (btn.classList.contains('modal-add-to-cart-btn')) {
      api.addToCart({ id: productId }); // <= A TUA API QUER {id}
      alert('Produto adicionado ao carrinho!')
      setTimeout(() => (btn.textContent = 'Adicionar ao carrinho'), 1200);
      window.dispatchEvent(new Event('cart:changed'));
    }
  });

  renderFavorites(loadFavorites());

  const isLoggedIn = !!localStorage.getItem('ecommerce_session');
  if (isLoggedIn) {
    const favIcon = document.getElementById('fav');
    if (favIcon) favIcon.style.display = 'inline-block';
  }
});
