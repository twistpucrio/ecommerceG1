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


    addToFavorites(product) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isAlreadyFavorite = favorites.some(p => p.id === product.id);

    if (!isAlreadyFavorite) {
        favorites.push(product);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log(`Produto adicionado aos favoritos: ${product.name}`);
        return true; 
    } else {
        console.log(`Este produto já está na sua lista de favoritos: ${product.name}`);
        return false; 
    }
}

 removeFromFavorites(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const newFavorites = favorites.filter(p => p.id !== productId);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }

    login() {

        const username = document.getElementById('loginUsuario').value.trim();
        const senha    = document.getElementById('loginSenha').value;

        const users = JSON.parse(localStorage.getItem('ecommerce_users') || '[]');
        const ok = users.find(u => u.username === username && u.senha === senha);

        
        if (ok) {
        localStorage.setItem('ecommerce_session', JSON.stringify({ username }));
        return true; // logou
    }
        alert('Usuário ou senha inválidos.');
        return false;
    }

    cadastro() {
        const user = {
    nome:        document.getElementById('nome').value.trim(),
    aniversario: document.getElementById('aniversario').value.trim(),
    cpf:         document.getElementById('cpf').value.trim(),
    cep:         document.getElementById('cep').value.trim(),
    email:       document.getElementById('email').value.trim(),
    username:    document.getElementById('loginUsuario').value.trim(),
    senha:       document.getElementById('loginSenha').value
  };

  
  if (!user.username || !user.senha || !user.cep || !user.cpf || !user.aniversario || !user.nome  || !user.email) {
    alert('Preencha todos os campos.');
    return false;
  }

  const users = JSON.parse(localStorage.getItem('ecommerce_users') || '[]');

  if (users.some(u => u.username === user.username)) {
    alert('Usuário já existe. Tente outro.');
    return false;
  }

  users.push(user);
  localStorage.setItem('ecommerce_users', JSON.stringify(users));

  alert('Cadastro concluído! Faça login.');
  return true;
}
    }



    