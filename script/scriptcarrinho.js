document.addEventListener('DOMContentLoaded', () => {
  const api = new EcommerceAPI();
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('finalizarCompraBtn')
  const clearCartBtn = document.getElementById("clearcart-btn");

  function renderCart() {
    // A chamada api.getCart() retorna um objeto com 'products' (array de IDs) e 'total'.
    const cartData = api.getCart();
    const cartProductIds = cartData.products;

    // Usa a promessa dos produtos para encontrar os detalhes
    api.listProducts().then(allProducts => {
      const cartItemDetails = cartProductIds.map(productId => {
        return allProducts.find(p => p.id === productId);
      }).filter(p => p);

      // Calcula o total com base nos produtos encontrados
      const total = cartItemDetails.reduce((acc, item) => acc + item.price, 0);

      if (cartItemDetails.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio. <a href="produtos.html">Continue a comprar</a>.</p>';
        checkoutBtn.style.display = 'none';
      } else {
        cartItemsContainer.innerHTML = '';
        cartItemDetails.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = 'cart-item';
          itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" width="60" height="60">
            <div class="info">
              <h4>${item.name}</h4>
              <div>R$${item.price.toFixed(2)}</div>
            </div>
            <button class="remover" data-product-id="${item.id}">Remover</button>
          `;
          cartItemsContainer.appendChild(itemEl);
        });
        checkoutBtn.style.display = 'block';
      }
      cartTotalEl.textContent = `Total: R$${total.toFixed(2)}`;
    });
  }


  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      api.clearCart();
      renderCart();
    });
  }

  cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
      const productId = parseInt(event.target.dataset.productId, 10);
      api.removeItemFromCart(productId);
      renderCart();
    }
  });

  renderCart(); // Chamada inicial para renderizar o carrinho ao carregar a página

  
  document.getElementById('finalizarCompraBtn').addEventListener('click', () => {
  const ok = api.checkout();
  if (ok) renderCart();  
});

});


