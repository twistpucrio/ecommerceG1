class EcommerceAPI {
    constructor() {
        this.products = [
            {
                id: 1,
                name: 'Barra de acampamento',
                price: 420.99,
                area:'',
                image: ''
            },
            {
                id: 2,
                name: 'Saco de dormir',
                price: 155.99,
                area:'',
                image: ''
            },
            {
                id: 3,
                name: 'Mochila de trilha',
                price: 230.00,
                area:'',
                image: ''
            },
            {
                id: 4,
                name: 'luvas de boxe',
                price: 56.90,
                area:'',
                image: ''
            }
        ];
        // Load cart from localStorage or initialize as empty array
        this.cart = this.loadCart();
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
    
    listProducts() {
        return this.products;
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.cart.push(productId);
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
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
    window.EcommerceAPI = EcommerceAPI;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcommerceAPI;
}