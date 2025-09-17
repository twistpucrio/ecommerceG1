document.addEventListener('DOMContentLoaded', () => {
  const api = new EcommerceAPI();
  const productListEl = document.getElementById('product-list');
  

  function renderProducts(products) {
    productListEl.innerHTML = ''; // Limpa o conteúdo antes de renderizar
    products.forEach(product => {
      const itemEl = document.createElement('div');
      itemEl.className = 'product-item';
      itemEl.innerHTML = `
        <img src="${product.image}" alt="${product.name}" width="180" height="200">
        <div class="info">
          <h3>${product.name}</h3>
          <div class="price">R$${product.price.toFixed(2)}</div>
        </div>
        <button data-product-id="${product.id}">Adicione ao carrinho</button>
      `;
      productListEl.appendChild(itemEl);
    });
  }

  productListEl.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
      const productId = parseInt(event.target.dataset.productId, 10);

      api.listProducts().then(products => {
        const productToAdd = products.find(p => p.id === productId);
        if (productToAdd) {
          api.addToCart(productToAdd);
          alert(`${productToAdd.name} adicionado ao carrinho!`);
        }
      }).catch(error => {
        console.error('Erro ao adicionar produto ao carrinho:', error);
      });
    }
  });

  // Chamada para renderizar os produtos
  api.listProducts().then(products => {
    renderProducts(products);
  });
  
});

