document.addEventListener('DOMContentLoaded', () => {
    // A classe EcommerceAPI deve ser importada ANTES deste script.
    const api = new EcommerceAPI();
    const productListEl = document.getElementById('product-list');
    const isLoggedIn = !!localStorage.getItem('ecommerce_session');

    // --- Constantes de Dados ---
    const availableCategories = ["camping", "luta", "suplementos", "tennis", "natacao", "ciclismo", "bola"];

    // --- Referências de Elementos ---
    const buscaInputEl = document.getElementById('busca');
    const btnBuscaEl = document.getElementById('btn-busca');

    // 💡 CORREÇÃO 1: Adicionar a referência do input de preço mínimo AQUI
    const minPriceFilterInput = document.getElementById('min-price-filter-input');
    const priceFilterInput = document.getElementById('price-filter-input');

    const categoryOptionsEl = document.getElementById('category-options');
    const categoryFilterBtn = document.getElementById('category-filter-btn');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    // Referências do Modal
    const productModalEl = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalContentEl = document.getElementById('modal-product-details');
    const modalOverlayEl = document.querySelector('.modal-overlay');

    // Referência ao grupo completo de filtro de categoria
    const categoryFilterGroupEl = document.getElementById('category-filter-group');

    // --- Helpers de URL ---
    function getCategoryFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('categoria') || 'todos';
    }
    function getQueryFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return (urlParams.get('q') || '').trim();
    }

    // --- Normalização segura ---
    function norm(s) {
        if (!s) return '';
        try {
            return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        } catch (_e) {
            return String(s).toLowerCase();
        }
    }


    function isProductFavorited(productId) {
        const favorites = api.getFavorites(); 
        return favorites.some(p => p.id === productId);
    }

    async function handleProductAction(productId, target) {
        try {
            const products = await api.listProducts();
            const productToHandle = products.find(p => p.id === productId);
            if (!productToHandle) return;

            if (target.classList.contains('add-to-favorites-btn') || target.classList.contains('modal-fav-btn')) {
                const wasAdded = api.addToFavorites(productToHandle);
                if (wasAdded) {
                    alert(`${productToHandle.name} adicionado aos favoritos! ⭐`);
                    target.classList.add('favorited'); 
                    target.innerHTML = '⭐'; 
                } else {
                    alert(`${productToHandle.name} removido dos favoritos!`);
                    target.classList.remove('favorited'); 
                    target.innerHTML = '☆'; 
                }
                updateFavoriteButtons(productId);

            } else {
                api.addToCart(productToHandle);
                alert(`${productToHandle.name} adicionado ao carrinho!`);
            }
        } catch (err) {
            console.error('Erro ao manipular o produto:', err);
        }
    }

    function updateFavoriteButtons(productId) {
        const isFavorited = isProductFavorited(productId);
        document.querySelectorAll(`.add-to-favorites-btn[data-product-id="${productId}"], .modal-fav-btn[data-product-id="${productId}"]`).forEach(btn => {
            if (isFavorited) {
                btn.classList.add('favorited');
                btn.innerHTML = '⭐';
            } else {
                btn.classList.remove('favorited');
                btn.innerHTML = '☆';
            }
        });
    }

    // Listener para os botões DENTRO do Modal
    function setupModalButtonListeners() {
        const modalCartBtn = document.querySelector('#modal-product-details .modal-add-to-cart-btn');
        const modalFavBtn = document.querySelector('#modal-product-details .modal-fav-btn');

        // Garante que o listener seja removido para evitar chamadas duplicadas
        if (modalCartBtn) modalCartBtn.onclick = null;
        if (modalFavBtn) modalFavBtn.onclick = null;

        if (modalCartBtn) {
            modalCartBtn.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.productId, 10);
                handleProductAction(productId, event.target);
            });
        }

        if (modalFavBtn) {
            modalFavBtn.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.productId, 10);
                handleProductAction(productId, event.target);
            });
        }
    }

    // FUNÇÃO PARA FECHAR O MODAL
    function closeProductModal() {
        if (productModalEl) {
            productModalEl.style.display = 'none';
        }
    }

    // FUNÇÃO PARA ABRIR E PREENCHER O MODAL
    function openProductModal(product) {
        if (!productModalEl || !modalContentEl) return;

        const isFav = isProductFavorited(product.id);
        const favButtonClass = isFav ? 'add-to-favorites-btn modal-fav-btn favorited' : 'add-to-favorites-btn modal-fav-btn';
        const favButtonText = isFav ? '⭐' : '☆';

        // 1. Monta o HTML do modal
        const favoriteBtnHtml = isLoggedIn
            ? `<button class="${favButtonClass}" data-product-id="${product.id}">${favButtonText} </button>`
            : '';

        modalContentEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="300" height="350">
            <h2 id="modal-product-name">${product.name}</h2>
            
            <div class="modal-description-box">
                <h3>Detalhes do Produto</h3>
                <p id="modal-product-description">${product.description || 'Descrição não disponível.'}</p>
            </div>
            <p class="modal-product-price">R$${Number(product.price).toFixed(2)}</p>
            <button class="modal-add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
            ${favoriteBtnHtml}
        `;

        // 2. Torna o modal visível
        productModalEl.style.display = 'block';

        // 3. Adiciona listeners para os botões dentro do modal
        setupModalButtonListeners();
    }


    // --- Renderização dos produtos ---
    function renderProducts(products) {
        productListEl.innerHTML = '';
        if (!products || products.length === 0) {
            productListEl.innerHTML = '<p>Nenhum produto encontrado nesta busca/categoria.</p>';
            return;
        }
        products.forEach(product => {
            const itemEl = document.createElement('div');
            itemEl.className = 'product-item';

            const isFav = isLoggedIn && isProductFavorited(product.id);
            const favButtonClass = isFav ? 'add-to-favorites-btn favorited' : 'add-to-favorites-btn';
            const favButtonText = isFav ? '⭐' : '☆';

            const favoriteBtnHtml = isLoggedIn
                ? `<button class="${favButtonClass}" data-product-id="${product.id}">${favButtonText}</button>`
                : '';
            itemEl.innerHTML = `
                <img src="${product.image}" alt="${product.name}" width="180" height="200">
                <div class="info">
                    <h3>${product.name}</h3>
                    <div class="price">R$${Number(product.price).toFixed(2)}</div>
                </div>
                <button data-product-id="${product.id}">Adicione ao carrinho</button>
                ${favoriteBtnHtml}
            `;
            productListEl.appendChild(itemEl);
        });
    }

    // --- FUNÇÃO DE CRIAÇÃO DE CATEGORIAS ---
    function createCategoryCheckboxes() {
        if (!categoryOptionsEl) return;
        categoryOptionsEl.innerHTML = '';
        availableCategories.forEach(category => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="category" value="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            `;
            categoryOptionsEl.appendChild(label);
        });
    }

    // --- FUNÇÃO PRINCIPAL DE FILTRO ---
    async function loadAndFilterProducts(applyVisualFilters = false) {
        try {
            const allProducts = await api.listProducts();
            let filteredProducts = allProducts;

            // 1. FILTRO DE BUSCA (Texto)
            const searchTerm = buscaInputEl ? buscaInputEl.value : getQueryFromUrl();
            const nq = norm(searchTerm);

            if (nq) {
                filteredProducts = filteredProducts.filter(p => {
                    const nome = norm(p.name);
                    const cat = norm(p.category);
                    return nome.includes(nq) || cat.includes(nq);
                });
            }

            // 2. FILTRO DE CATEGORIA (URL)
            const categoriaURL = getCategoryFromUrl();
            let shouldApplyURLCategory = true;

            if (applyVisualFilters) {
                // === APLICAR FILTROS VISUAIS (Usuário clicou em Aplicar Filtros) ===

                // 2a. Checkboxes Filter
                const categoriesFromCheckboxes = Array.from(categoryOptionsEl.querySelectorAll('input:checked'))
                    .map(input => input.value);

                if (categoriesFromCheckboxes.length > 0) {
                    filteredProducts = filteredProducts.filter(product =>
                        categoriesFromCheckboxes.includes(product.category)
                    );
                    shouldApplyURLCategory = false;
                }

                // 💡 CORREÇÃO 2: Simplificar a lógica e usar as variáveis de referência globais
                
                // 3. FILTRO DE PREÇO MÍNIMO
                const minPrice = parseFloat(minPriceFilterInput ? minPriceFilterInput.value : '');
                if (!isNaN(minPrice) && minPrice >= 0) {
                    filteredProducts = filteredProducts.filter(product =>
                       product.price >= minPrice
                    );
                }
                
                // 4. FILTRO DE PREÇO MÁXIMO
                const maxPrice = parseFloat(priceFilterInput ? priceFilterInput.value : '');
                if (!isNaN(maxPrice) && maxPrice > 0) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.price <= maxPrice
                    );
                }
                
                // Opcional: Alerta se o mínimo for maior que o máximo
                if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
                     // Não é necessário um alert, pois o filtro já resultará em lista vazia ou menor, mas ajuda o usuário
                     console.warn('Atenção: O preço mínimo é maior que o preço máximo.');
                }
            }

            // 5. Aplica Categoria da URL se nenhum filtro visual foi aplicado
            if (shouldApplyURLCategory && categoriaURL !== 'todos') {
                filteredProducts = filteredProducts.filter(p => String(p.category) === String(categoriaURL));
            }


            renderProducts(filteredProducts);

        } catch (error) {
            console.error('Erro ao carregar ou filtrar produtos:', error);
            productListEl.innerHTML = '<p>Erro ao carregar produtos.</p>';
        }
    }

    // --- NOVO LISTENER PRINCIPAL DE PRODUTOS ---
    productListEl.addEventListener('click', (event) => {
        const target = event.target;
        const itemEl = target.closest('.product-item');

        // 1. Ação no Botão (Carrinho/Favorito)
        if (target.tagName === 'BUTTON' && target.dataset.productId) {
            const productId = parseInt(target.dataset.productId, 10);
            handleProductAction(productId, target);
            event.stopPropagation();
            return;
        }

        // 2. Ação no Item (Abrir Modal)
        if (itemEl) {
            const productIdEl = itemEl.querySelector('[data-product-id]');
            if (!productIdEl) return; 
            
            const productId = parseInt(productIdEl.dataset.productId, 10);
            api.listProducts().then(products => {
                const productToOpen = products.find(p => p.id === productId);
                if (productToOpen) {
                    openProductModal(productToOpen);
                }
            }).catch(err => console.error('Erro ao buscar produto para modal:', err));
        }
    });

    // --- EVENT LISTENERS PARA OS NOVOS BOTÕES DE FILTRO ---

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            loadAndFilterProducts(true);
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // 💡 LÓGICA DE LIMPEZA DO PREÇO MÍNIMO (Se a referência estiver correta)
            if (minPriceFilterInput) minPriceFilterInput.value = ''; 
            
            priceFilterInput.value = '';
            categoryOptionsEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();
            loadAndFilterProducts(false);
        });
    }

    if (categoryFilterBtn) {
        categoryFilterBtn.addEventListener('click', () => {
            categoryOptionsEl.classList.toggle('active');
        });
    }

    if (btnBuscaEl) {
        btnBuscaEl.addEventListener('click', () => {
            loadAndFilterProducts(true);
        });
    }

    // --- EVENT LISTENERS PARA FECHAR O MODAL ---

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProductModal);
    }

    if (modalOverlayEl) {
        modalOverlayEl.addEventListener('click', closeProductModal);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && productModalEl && productModalEl.style.display === 'block') {
            closeProductModal();
        }
    });


    // --- LÓGICA DE INICIALIZAÇÃO ---

    createCategoryCheckboxes();

    const categoriaSelecionadaURL = getCategoryFromUrl();
    const termoDeBuscaAtual = buscaInputEl ? buscaInputEl.value : getQueryFromUrl();


    if (categoriaSelecionadaURL !== 'todos' || termoDeBuscaAtual.trim() !== '') {

        if (categoryFilterGroupEl) {
            categoryFilterGroupEl.style.display = 'none';
        }
    }

    if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();

    if (categoriaSelecionadaURL !== 'todos') {
        if (categoryFilterGroupEl) {
            categoryFilterGroupEl.style.display = 'none';
            if (applyFiltersBtn) applyFiltersBtn.style.display = 'inline-block';
            if (clearFiltersBtn) clearFiltersBtn.style.display = 'inline-block';
        } else {
            const catButton = document.getElementById('category-filter-btn');
            if (catButton) catButton.parentElement.style.display = 'none';
        }
    }

    if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();

    loadAndFilterProducts(false);
});

 const isLoggedIn = !!localStorage.getItem('ecommerce_session');
        if (isLoggedIn) {
            document.getElementById('fav').style.display = 'inline-block';
        }