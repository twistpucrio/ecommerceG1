 document.addEventListener('DOMContentLoaded', () => {
            const api = new EcommerceAPI();
            const productListEl = document.getElementById('product-list');

            /*function renderProducts() {
                let products = api.listProducts();
                productListEl.innerHTML = '';
                console.log(products);

                products.forEach(product => {
                    console.log(product);
                    const itemEl = document.createElement('div');
                    itemEl.className = 'product-item';
                    itemEl.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" width="180" height="200">
                        <div class="info">
                            <h3>${product.name}</h3>
                            <div class="price">R${product.price.toFixed(2)}</div>
                        </div>
                        <button data-product-id="${product.id}">Adicione ao carrinho</button>
                    `;
                    productListEl.appendChild(itemEl);
                   
                });
            }*/

            function renderProducts() {
    // Call loadProducts and wait for the promise to resolve

    api.listProducts().then(products => {
        const productListEl = document.querySelector("#product-list"); // Assuming you have a div with this ID
        productListEl.innerHTML = ''; // Clear previous content
        console.log(products);
        // Now that you have the products, iterate and render them
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
    });
}

            productListEl.addEventListener('click', (event) => {
                if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
                    const productId = parseInt(event.target.dataset.productId, 10);
                    // pegar a lista de produto e fazer um dinf pelo id 
                    api.addToCart(product);
                    alert(`${api.listProducts().find(p => p.id === productId).name} adicionado ao carrinho!`);
                }
            });

            renderProducts();
        });


        