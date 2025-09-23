document.addEventListener('DOMContentLoaded', () => {
    // A classe EcommerceAPI deve ser importada ou definida antes deste script.
    const api = new EcommerceAPI(); 
    const productListEl = document.getElementById('product-list');

    // **Função para buscar a categoria da URL**
    function getCategoryFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        // Retorna o valor do parâmetro 'categoria', ou 'todos' se não houver
        return urlParams.get('categoria') || 'todos';
    }

    // **Função de renderização dos produtos**
    function renderProducts(products) {
        productListEl.innerHTML = '';
        if (products.length === 0) {
            productListEl.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        }

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

    // **Função para lidar com os cliques nos botões de produto**
    productListEl.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON' && target.dataset.productId) {
            const productId = parseInt(target.dataset.productId, 10);

            api.listProducts().then(products => {
                const productToHandle = products.find(p => p.id === productId);

                if (productToHandle) {
                    if (target.classList.contains('add-to-favorites-btn')) {
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

    // **Lógica principal: Carrega e filtra os produtos ao carregar a página**
    api.listProducts().then(products => {
        const categoriaSelecionada = getCategoryFromUrl();

        if (categoriaSelecionada === 'todos') {
            renderProducts(products);
        } else {
            const produtosFiltrados = products.filter(p => p.category === categoriaSelecionada);
            renderProducts(produtosFiltrados);
        }
    }).catch(error => {
        console.error('Erro ao carregar produtos:', error);
    });

});