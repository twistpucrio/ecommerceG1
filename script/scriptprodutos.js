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

  // NOVO: Referência ao grupo completo de filtro de categoria (do Passo 1)
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

  // --- Clique nos botões (carrinho/favoritos) ---
  productListEl.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName !== 'BUTTON' || !target.dataset.productId) return;
    const productId = parseInt(target.dataset.productId, 10);
    api.listProducts().then(products => {
      const productToHandle = products.find(p => p.id === productId);
      if (!productToHandle) return;
      if (target.classList.contains('add-to-favorites-btn')) {
        const wasAdded = api.addToFavorites(productToHandle);
        alert(wasAdded ? `${productToHandle.name} adicionado aos favoritos! ❤️` : `Esse produto já foi adicionado aos favoritos.`);
      } else {
        api.addToCart(productToHandle);
        alert(`${productToHandle.name} adicionado ao carrinho!`);
      }
    }).catch(err => console.error('Erro ao manipular o produto:', err));
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
      console.log(`Filtro de categoria visual oculto devido à URL ou termo de busca.`);
    }
  }

  if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();

  loadAndFilterProducts(false);


  if (categoriaSelecionadaURL !== 'todos') {

    if (categoryFilterGroupEl) {
      categoryFilterGroupEl.style.display = 'none';

      // E, por precaução, escondemos também o botão de "Aplicar Filtros"
      // e "Limpar Filtros" se a pessoa só puder filtrar por preço
      if (applyFiltersBtn) applyFiltersBtn.style.display = 'inline-block';
      if (clearFiltersBtn) clearFiltersBtn.style.display = 'inline-block';

    } else {
      // Se a referência ainda falhar (o que causaria o problema de o filtro aparecer),
      // tentamos esconder o botão de categoria diretamente como fallback.
      const catButton = document.getElementById('category-filter-btn');
      if (catButton) catButton.parentElement.style.display = 'none';
    }
  }


  // 2. Preenche o campo de busca (se existir) com o valor da URL.
  if (buscaInputEl) buscaInputEl.value = getQueryFromUrl();

  // 3. Carrega os produtos com os filtros iniciais (apenas URL/Query).
  loadAndFilterProducts(false);




});