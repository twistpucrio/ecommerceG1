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
      // 1) Agrega quantidades por ID
      const qtyById = cartProductIds.reduce((acc, id) => {
        const key = String(id); // normaliza tipo (string/number)
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // 2) Constrói a lista final (detalhes + count), apenas itens únicos
      const cartItemDetails = Object.entries(qtyById)
        .map(([id, count]) => {
          const prod = allProducts.find(p => String(p.id) === id);
          return prod ? { ...prod, count } : null;
        })
        .filter(Boolean);

      // 3) Total considerando a quantidade
      const total = cartItemDetails.reduce((acc, item) => acc + (item.price * item.count), 0);

      if (cartItemDetails.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        checkoutBtn.style.display = 'none';
      } else {
        cartItemsContainer.innerHTML = '';
        cartItemDetails.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = 'cart-item';
          itemEl.innerHTML = `
          <div class="product-item" data-product-id="${item.id}">  <img src="${item.image}" alt="${item.name}" width="60" height="60">
           <div class="info">
          <h4>${item.name}</h4>

                       <div class="quantity-control">
                           <button class="qty-btn-minus" data-product-id="${item.id}" ${item.count <= 1 ? 'disabled' : ''}>-</button>
                           <span class="product-qty" data-product-id="${item.id}">${item.count}</span>
                           <button class="qty-btn-plus" data-product-id="${item.id}">+</button>
                       </div>
                       <div>R$${(item.price * item.count).toFixed(2)}</div> </div>
           <button class="remover" data-product-id="${item.id}">Remover Item</button>
          <\div>
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
    const target = event.target;
    if (target.tagName !== 'BUTTON') return;

    const productId = parseInt(target.dataset.productId, 10);
    if (isNaN(productId)) return;


    // 1. Botão de AUMENTAR QUANTIDADE (+)
    if (target.classList.contains('qty-btn-plus')) {
        api.addOneToCart(productId); // Novo método na API
        renderCart();
        return;
    }

    if (target.classList.contains('qty-btn-minus')) {
    
      const productQtyEl = document.querySelector(`.product-qty[data-product-id="${productId}"]`);
      const currentQty = productQtyEl ? parseInt(productQtyEl.textContent, 10) : 0;
      
      if (currentQty > 1) {
          api.removeOneFromCart(productId); // Novo método na API
          renderCart();
      } else {
       
          console.log("Não é possível reduzir mais. Use o botão 'Remover Tudo' ou altere a lógica.");
      }
      return;
  }
  
  if (target.classList.contains('remover')) {

      api.removeAllItemsOfProduct(productId); 
      renderCart();
      return;
  }
});
    

  renderCart(); 


  document.getElementById('finalizarCompraBtn').addEventListener('click', () => {
    const ok = api.checkout();
    if (ok) renderCart();
  });

});

const isLoggedIn = !!localStorage.getItem('ecommerce_session');
if (isLoggedIn) {
  document.getElementById('fav').style.display = 'inline-block';
}

