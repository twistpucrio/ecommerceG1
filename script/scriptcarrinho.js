document.addEventListener('DOMContentLoaded', () => {
    const api = new EcommerceAPI();
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById("clearcart-btn");

    function renderCart() {
        // 1. Obtenha a promessa dos produtos e a promessa do carrinho
        Promise.all([api.listProducts(), api.getCart().products])
            .then(([allProducts, cartProductsIds]) => {
                const cartItemDetails = cartProductsIds.map(productId => {
                    return allProducts.find(p => p.id === productId);
                }).filter(p => p); // Filtra produtos não encontrados

                // 2. Calcula o total do carrinho
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
                                <div>$${item.price.toFixed(2)}</div>
                            </div>
                            <button class="remover" data-product-id="${item.id}">
                                Remover
                            </button>
                        `;
                        cartItemsContainer.appendChild(itemEl);
                    });
                    checkoutBtn.style.display = 'block';
                }
                cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
            });
    }

    checkoutBtn.addEventListener('click', () => {
        // ... (seu código de checkout, precisa ser reajustado para usar promises)
    });

    clearCartBtn.addEventListener("click", () => {
        api.clearCart();
        renderCart();
    });

    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
            const productId = parseInt(event.target.dataset.productId, 10);
            api.removeItemFromCart(productId);
            renderCart();
        }
    });

    // Inicializa a renderização do carrinho
    renderCart();
});




// Dentro do seu script do carrinho (carrinho.js)

document.addEventListener('DOMContentLoaded', () => {
    const api = new EcommerceAPI();
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    // Verifique se o ID está correto no HTML.
    const clearCartBtn = document.getElementById("clearcart-btn"); 
    
    // ... (sua função renderCart() e os outros listeners de evento)
    
    // Este é o bloco de código que você precisa para o botão de limpar:
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            api.clearCart();
            renderCart(); // Renderiza o carrinho novamente para mostrar que está vazio
        });
    }

    // ... (o resto do seu script)
    renderCart(); // Chamada inicial para renderizar o carrinho ao carregar a página
});