  const api = new EcommerceAPI();

  document.getElementById('botaoLogin').onclick = async () => {
  const ok = await api.login(); // <-- AQUI!
  if (ok) {
    const src = sessionStorage.getItem('login_source');
    sessionStorage.removeItem('login_source');
    if (src === 'checkout') {
      window.location.href = 'carrinho.html';
    } else {
      window.location.href = 'index.html';
    }
  } else {
    document.getElementById('btnCadastro').style.display = 'inline-block';
  }
};

  // Se existe sessão, mostra botão
  const sess = localStorage.getItem('ecommerce_session');
  if (sess) {
    document.getElementById('btnLogout').style.display = 'inline-block';
    document.getElementById('fav').style.display = 'inline-block';
    document.getElementById('btnLogout').onclick = () => {
      api.logout();
    };
  }
