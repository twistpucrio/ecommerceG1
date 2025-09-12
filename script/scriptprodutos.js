 document.addEventListener('DOMContentLoaded', () => {
            const api = new EcommerceAPI();
            const productListEl = document.getElementById('product-list');

            function renderProducts() {
                const products = api.listProducts();
                productListEl.innerHTML = '';

                products.forEach(product => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'product-item';
                    itemEl.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" width="80" height="80">
                        <div class="info">
                            <h3>${product.name}</h3>
                            <div class="price">$${product.price.toFixed(2)}</div>
                        </div>
                        <button data-product-id="${product.id}">Adicione ao carrinho</button>
                    `;
                    productListEl.appendChild(itemEl);
                });
            }

            productListEl.addEventListener('click', (event) => {
                if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
                    const productId = parseInt(event.target.dataset.productId, 10);
                    api.addToCart(productId);
                    alert(`${api.listProducts().find(p => p.id === productId).name} adicionado ao carrinho!`);
                }
            });

            renderProducts();
        });