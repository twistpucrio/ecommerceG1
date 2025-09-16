class EcommerceAPI {
    constructor() {
        this.cart = this.loadCart();
        this.productsPromise = this.loadProducts();
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

    listProducts() {
        return this.productsPromise;
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
        if (product && product.id) {
            this.cart.push(product.id);
            this.saveCart();
        }
    }

    getCart() {
        return {
            products: [...this.cart],
            total: 0
        };
    }
    
    removeItemFromCart(productId) {
        const index = this.cart.findIndex(id => id === productId);
        if (index > -1) {
            this.cart.splice(index, 1);
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }
}