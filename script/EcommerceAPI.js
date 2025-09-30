class EcommerceAPI {
    constructor() {
        this.cart = this.loadCart();
        this.productsPromise = this.loadProducts();
    }

    
    // --- Helpers para "banco" simples ---
async _initUsuarios() {
  // Se já está no localStorage, usa ele
  const existente = localStorage.getItem('ecommerce_users');
  if (existente) return JSON.parse(existente);

  // Se não, tenta "semear" a partir de usuarios.json (se existir no site)
  try {
    const res = await fetch('./usuarios.json', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const arr = Array.isArray(json.usuarios) ? json.usuarios : [];
      localStorage.setItem('ecommerce_users', JSON.stringify(arr));
      return arr;
    }
  } catch (_) { /* se não existir, segue com vazio */ }

  localStorage.setItem('ecommerce_users', JSON.stringify([]));
  return [];
}

_getUsers() {
  return JSON.parse(localStorage.getItem('ecommerce_users') || '[]');
}

_setUsers(arr) {
  localStorage.setItem('ecommerce_users', JSON.stringify(arr));
}

// Baixa um usuarios.json atualizado (você decide quando clicar)
exportarUsuariosJSON() {
  const usuarios = this._getUsers();
  const blob = new Blob([JSON.stringify({ usuarios }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'usuarios.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Opcional: importar um arquivo usuarios.json escolhido pelo usuário
async importarUsuariosJSON(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const arr = Array.isArray(data.usuarios) ? data.usuarios : [];
  this._setUsers(arr);
  alert('usuarios.json importado com sucesso!');
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

   async login() {
  await this._initUsuarios(); // garante que o "banco" está carregado (seed do usuarios.json se houver)

  const username = document.getElementById('loginUsuario').value.trim();
  const senha    = document.getElementById('loginSenha').value;

  const users = this._getUsers();
  const ok = users.find(u => u.username === username && u.senha === senha);

  if (ok) {
    localStorage.setItem('ecommerce_session', JSON.stringify({ username }));
    return true; // logou
  }
  alert('Usuário ou senha inválidos.');
  return false;
}

async cadastro() {
  await this._initUsuarios();

  const user = {
    nome:        document.getElementById('nome').value.trim(),
    aniversario: document.getElementById('aniversario').value.trim(),
    cpf:         document.getElementById('cpf').value.trim(),
    cep:         document.getElementById('cep').value.trim(),
    email:       document.getElementById('email').value.trim(),
    username:    document.getElementById('loginUsuario').value.trim(),
    senha:       document.getElementById('loginSenha').value
  };

  if (!user.username || !user.senha || !user.cep || !user.cpf || !user.aniversario || !user.nome || !user.email) {
    alert('Preencha todos os campos.');
    return false;
  }

  const users = this._getUsers();
  if (users.some(u => u.username === user.username)) {
    alert('Usuário já existe. Tente outro.');
    return false;
  }

  users.push(user);
  this._setUsers(users);

  // Se quiser já baixar o usuarios.json atualizado automaticamente, descomente:
  // this.exportarUsuariosJSON();

  alert('Cadastro concluído! Faça login.');
  return true;
}

logout() {
  localStorage.removeItem('ecommerce_session');
  alert('Você saiu da conta.');
  window.location.href = 'index.html'; // redireciona para a home (ou login.html se preferir)
}


checkout() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem('ecommerce_session'));
  } catch (e) {
    session = null;
  }

  if (session && typeof session.username === 'string' && session.username.trim() !== '') {
    alert('Compra finalizada!');
    this.clearCart();
    return true;
  } else {
    sessionStorage.setItem('login_source', 'checkout');
    window.location.href = 'login.html';
    return false;
  }
}

}

    const isLoggedIn = !!localStorage.getItem('ecommerce_session');

    if (isLoggedIn) {
        document.getElementById('fav').style.display = 'inline-block';
    }
