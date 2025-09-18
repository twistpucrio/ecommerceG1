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
        <button class="add-to-favorites-btn" data-product-id="${product.id}">❤️</button>
      `;
      productListEl.appendChild(itemEl);
    });
  }

productListEl.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'BUTTON' && target.dataset.productId) {
        const productId = parseInt(target.dataset.productId, 10);

        api.listProducts().then(products => {
            const productToHandle = products.find(p => p.id === productId);

            if (productToHandle) {
                if (target.classList.contains('add-to-favorites-btn')) {
                    // Captura o valor retornado pela função
                    const wasAdded = api.addToFavorites(productToHandle); 
                    if (wasAdded) {
                        alert(`${productToHandle.name} adicionado aos favoritos! ❤️`);
                    } else {
                        alert(`Esse produto já foi adicionado aos favoritos.`);
                    }
                } else {
                    api.addToCart(productToHandle);
                    alert(`${productToHandle.name} adicionado ao carrinho!`);
                }
            }
        }).catch(error => {
            console.error('Erro ao manipular o produto:', error);
        });
    }
});
  // Chamada para renderizar os produtos
  api.listProducts().then(products => {
    renderProducts(products);
  });
  
});



