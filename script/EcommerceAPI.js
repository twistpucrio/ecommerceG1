class EcommerceAPI {
    constructor() {
        this.products = [
            {
                id: 1,
                name: 'Barra de acampamento',
                price: 420.99,
                category:'camping',
                image: ''
            },
            {
                id: 2,
                name: 'Saco de dormir',
                price: 155.99,
                category:'camping',
                image: ''
            },
            {
                id: 3,
                name: 'Mochila de trilha',
                price: 230.00,
                category:'camping',
                image: ''
            },
            {
                id: 4,
                name: 'Luvas de boxe',
                price: 56.90,
                category:'luta',
                image: ''
            },
            {
                id: 5,
                name: 'Whey Protein',
                price: 100.00,
                category:'suplementos',
                image: ''
            },
            {
                id: 6,
                name: 'Ômega 3',
                price: 80.00,
                category:'suplementos',
                image: ''
            },
            {
                id: 7,
                name: 'Barra de proteína',
                price: 12.00,
                category:'suplementos',
                image: ''
            },
            {
                id: 8,
                name: 'Raquete de Beach Tennis',
                price: 500.00,
                category:'tennis',
                image: ''
            },
            {
                id: 9,
                name: 'Bola de Beach Tennis',
                price: 100.00,
                category:'tennis',
                image: ''
            },
            {
                id: 10,
                name: 'Grip para a raquete',
                price: 20.00,
                category:'tennis',
                image: ''
            },
            {
                id: 11,
                name: 'Touca para natação',
                price: 45.00,
                category:'natacao',
                image: ''
            },
            {
                id: 12,
                name: 'Óculos para natação',
                price: 50.90,
                category:'natacao',
                image: ''
            },
            {
                id: 13,
                name: 'Pé de pato',
                price: 120.90,
                category:'natacao',
                image: ''
            },
            {
                id: 14,
                name: 'Capacete',
                price: 40.00,
                category:'ciclismo',
                image: ''
            },
            {
                id: 15,
                name: 'Luvas para ciclismo',
                price: 50.90,
                category:'ciclismo',
                image: ''
            },
            {
                id: 16,
                name: 'Suporte de garrafa',
                price: 56.90,
                category:'ciclismo',
                image: ''
            },
            {
                id: 17,
                name: 'Bola de futebol',
                price: 99.90,
                category:'bola',
                image: ''
            },
            {
                id: 18,
                name: 'Bola de vólei',
                price: 78.90,
                category:'bola',
                image: ''
            },
            {
                id: 19,
                name: 'Bola de basquete',
                price: 90.00,
                category:'luta',
                image: ''
            },
            {
                id: 20,
                name: 'Protetor bucal',
                price: 29.90,
                category:'luta',
                image: ''
            },
            {
                id: 21,
                name: 'Saco de pancadas',
                price: 200.00,
                category:'luta',
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
        this._saveCart();

    }

    removeItemFromCart(productId) {
        const index = this.cart.indexOf(productId);
        if (index > -1) {
            this.cart.splice(index, 1);
            this._saveCart(); // Save cart after modification
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