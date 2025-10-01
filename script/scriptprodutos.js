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

    // ===================================================
    // FUNÇÕES DE AÇÃO (MODAL E CARRINHO)
    // ===================================================

    // Função de manipulação de produto reutilizável (Adiciona ao Carrinho/Favoritos)
    function handleProductAction(productId, target) {
        api.listProducts().then(products => {
            const productToHandle = products.find(p => p.id === productId);
            if (!productToHandle) return;

            // Verifica se é o botão de favorito (tanto da lista quanto do modal)
            if (target.classList.contains('add-to-favorites-btn') || target.classList.contains('modal-fav-btn')) {
                const wasAdded = api.addToFavorites(productToHandle);
                alert(wasAdded ? `${productToHandle.name} adicionado aos favoritos! ❤️` : `Esse produto já foi adicionado aos favoritos.`);
            } else {
                api.addToCart(productToHandle);
                alert(`${productToHandle.name} adicionado ao carrinho!`);
            }
        }).catch(err => console.error('Erro ao manipular o produto:', err));
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

        // 1. Monta o HTML do modal
        const favoriteBtnHtml = isLoggedIn
            ? `<button class="add-to-favorites-btn modal-fav-btn" data-product-id="${product.id}">Adicionar aos Favoritos ❤️</button>`
            : '';

        modalContentEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="300" height="350">
            <h2 id="modal-product-name">${product.name}</h2>
            <p id="modal-product-description">${product.description || 'Descrição não disponível.'}</p>
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
            const favoriteBtnHtml = isLoggedIn
                ? `<button class="add-to-favorites-btn" data-product-id="${product.id}">❤️</button>`
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

                // 3. FILTRO DE PREÇO MÁXIMO
                const maxPrice = parseFloat(priceFilterInput.value);
                if (!isNaN(maxPrice) && maxPrice > 0) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.price <= maxPrice
                    );
                }
            }

            // 4. Aplica Categoria da URL se nenhum filtro visual foi aplicado
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
    // Este listener lida com: 1) Abrir Modal (clique no item) E 2) Ação de Botão (Carrinho/Favoritos)
    productListEl.addEventListener('click', (event) => {
        const target = event.target;
        // Encontra o container do produto pai (item da lista)
        const itemEl = target.closest('.product-item');

        // 1. Ação no Botão (Carrinho/Favorito)
        if (target.tagName === 'BUTTON' && target.dataset.productId) {
            const productId = parseInt(target.dataset.productId, 10);
            handleProductAction(productId, target);
            event.stopPropagation(); // Impede que o clique no botão abra o modal
            return;
        }

        // 2. Ação no Item (Abrir Modal)
        if (itemEl) {
            // Se o clique não foi em um botão de ação, mas sim no item:
            // Pegamos o ID de qualquer botão dentro do item
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
            // Alterna a VISIBILIDADE dos checkboxes
            categoryOptionsEl.classList.toggle('active');
        });
    }

    if (btnBuscaEl) {
        btnBuscaEl.addEventListener('click', () => {
            loadAndFilterProducts(true);
        });
    }

    // --- EVENT LISTENERS PARA FECHAR O MODAL ---

    // Fecha ao clicar no 'X'
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProductModal);
    }

    // Fecha ao clicar no overlay
    if (modalOverlayEl) {
        modalOverlayEl.addEventListener('click', closeProductModal);
    }

    // Fecha ao apertar a tecla ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && productModalEl && productModalEl.style.display === 'block') {
            closeProductModal();
        }
    });


    // --- LÓGICA DE INICIALIZAÇÃO ---

    // 1. Cria os checkboxes de categoria.
    createCategoryCheckboxes();

    // 💡 LÓGICA FINAL PARA OCULTAR O FILTRO DE CATEGORIA VISUAL
    const categoriaSelecionadaURL = getCategoryFromUrl();
    const termoDeBuscaAtual = buscaInputEl ? buscaInputEl.value : getQueryFromUrl();


    if (categoriaSelecionadaURL !== 'todos' || termoDeBuscaAtual.trim() !== '') {

        // Verificamos se o elemento existe antes de tentar manipulá-lo
        if (categoryFilterGroupEl) {
            // Esconde o grupo completo do filtro de categoria (botão + checkboxes)
            categoryFilterGroupEl.style.display = 'none';
        }
    }

    if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();

    // Lógica para esconder o grupo de filtros quando a categoria está na URL
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

    // 2. Preenche o campo de busca (se existir) com o valor da URL.
    if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();

    // 3. Carrega os produtos com os filtros iniciais (apenas URL/Query).
    loadAndFilterProducts(false);

});