document.addEventListener('DOMContentLoaded', () => {
    const favoritesListEl = document.getElementById('favorites-list');

    function loadFavorites() {
        try {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            return favorites;
        } catch (e) {
            console.error("Failed to load favorites from localStorage", e);
            return [];
        }
    }

    

    function renderFavorites(favorites) {
        favoritesListEl.innerHTML = '';
        if (favorites.length === 0) {
            favoritesListEl.innerHTML = '<p>Você não tem nenhum produto favorito. Adicione alguns na página de produtos!</p>';
            return;
        }

        favorites.forEach(product => {
            const itemEl = document.createElement('div');
            itemEl.className = 'favorite-item';
            itemEl.innerHTML = `
            <div class="product-item">
                <img src="${product.image}" alt="${product.name}" width="180" height="200">
                <div class="info">
                    <h3>${product.name}</h3>
                    <div class="price">R$${product.price.toFixed(2)}</div>
                </div>
                <button id="removeIndividualFav" class="remove-from-favorites-btn" data-product-id="${product.id}">Remover dos favoritos</button>
                <button class="modal-add-to-cart-btn" data-product-id="${product.id}">Adicionar ao carrinho</button>
            <\div>
                `;
            favoritesListEl.appendChild(itemEl);
        });
    }

    function removeFromFavorites(productId) {
        let favorites = loadFavorites();
        const newFavorites = favorites.filter(p => p.id !== productId);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        renderFavorites(newFavorites);
    }

    favoritesListEl.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('remove-from-favorites-btn') && target.dataset.productId) {
            const productId = parseInt(target.dataset.productId, 10);
            removeFromFavorites(productId);
        }
    });

    const favorites = loadFavorites();
    renderFavorites(favorites);
});

 const isLoggedIn = !!localStorage.getItem('ecommerce_session');
        if (isLoggedIn) {
            document.getElementById('fav').style.display = 'inline-block';
        }