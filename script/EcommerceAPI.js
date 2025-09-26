class EcommerceAPI {
    constructor() {
        // Load cart from localStorage or initialize as empty array
        this.products = this.listProducts();
        this.cart = this.loadCart();
    }

    loadProducts() {
        return fetch("script/prod.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => data.products)
            .catch(error => {
                console.error('There was a problem loading the products:', error);
                return [];
            });
    }

    // Your original listProducts method, which calls the asynchronous loadProducts
    listProducts() {
        // This method needs to return the promise from loadProducts
        return this.loadProducts();
    }

    async filterProducts(term) {
        const products = await this.listProducts();
        const lowerTerm = term.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(lowerTerm));
    }

    loadCart() {
        try {
            const cartJson = localStorage.getItem('ecommerce_cart');
            return cartJson ? JSON.parse(cartJson) : [];
        } catch (e) {
            console.error("Failed to load cart from localStorage", e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('ecommerce_cart', JSON.stringify(this.cart));
        } catch (e) {
            console.error("Failed to save cart to localStorage", e);
        }
    }

    addToCart(product) {
        if (product) {
            this.cart.push(product);
            this.saveCart(); // Save cart after modification
        }
    }

    getCart() {
        const total = this.cart.reduce((acc, productId) => {
            const product = this.products.find(p => p.id === productId);
            return acc + (product ? product.price : 0);
        }, 0);

        return {
            products: [...this.cart],
            total,
        };
    }

    checkout() {
        const cartData = this.getCart();
        const order = {
            success: true,
            orderId: Date.now().toString(),
            total: cartData.total,
            products: cartData.products,
        };
        this.clearCart();
        return order;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();

    }

    removeItemFromCart(productId) {
        const index = this.cart.indexOf(productId);
        if (index > -1) {
            this.cart.splice(index, 1);
            this.saveCart(); // Save cart after modification
        }
    }

    if(searchButton) {
        searchButton.addEventListener('click', async () => {
            const termo = searchInput.value.trim();
            if (termo) {
                const filtered = await api.filterProducts(termo);
            }
        });
    }


    if(searchInput) {
        searchInput.addEventListener('keyup', async (e) => {
            if (e.key === 'Enter') {
                const termo = searchInput.value.trim();
                if (termo) {
                    const filtered = await api.filterProducts(termo);
                }
            }
        });
    }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
    window.EcommerceAPI = EcommerceAPI;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcommerceAPI;
}

