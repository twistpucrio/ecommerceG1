document.addEventListener('DOMContentLoaded', () => {
  const api = new EcommerceAPI();
  const productListEl = document.getElementById('product-list');
  const searchInput = document.getElementById('busca');   // campo de texto
  const searchButton = document.getElementById('btn-busca'); // botão
  
  // Renderizar produtos
  function renderProducts(products) {
    productListEl.innerHTML = ''; // limpa antes de renderizar
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

  const urlParams = new URLSearchParams(window.location.search);
  const termoBusca = urlParams.get('search');
  if (termoBusca) {
    api.filterProducts(termoBusca).then(renderProducts);
  } 

  searchButton.addEventListener('click', () => {
    const termo = searchInput.value.trim();
    if (termo) {
      window.location.href = `produtos.html?search=${encodeURIComponent(termo)}`;//codifica partes da url
    }
  });

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const termo = searchInput.value.trim();
      if (termo) {
        window.location.href = `produtos.html?search=${encodeURIComponent(termo)}`;
      }
    }
  });

  // Adicionar ao carrinho
  productListEl.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
      const productId = parseInt(event.target.dataset.productId, 10);
      await api.addToCart(productId);

      const products = await api.listProducts();
      const product = products.find(p => p.id === productId);
      alert(`${product.name} adicionado ao carrinho!`);
    }
  });


  // Função de busca
  function searchProducts() {
    const value = searchInput.value.toLowerCase().trim();
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(value)
    );
    renderProducts(filtered);
  }

  // Enter no input
  searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") searchProducts();
  });

})