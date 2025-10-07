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
    document.getElementById('btnCadastro').style.display = 'block';
}};

// Se existe sessão, mostra botão
const sess = localStorage.getItem('ecommerce_session');
if (sess) {
    document.getElementById('btnLogout').style.display = 'block';
    document.getElementById('fav').style.display = 'inline-block';
    document.getElementById('btnLogout').onclick = () => {
        api.logout();
    };
}

// Helpers rápidos para sessão/usuários
function getSession() {
    try { return JSON.parse(localStorage.getItem('ecommerce_session')); }
    catch { return null; }
}
function getUsers() {
    try { return JSON.parse(localStorage.getItem('ecommerce_users') || '[]'); }
    catch { return []; }
}

// Mostra perfil se logado, senão mostra formulário
function renderAuthView() {
    const sess = getSession();
    const perfilEl = document.getElementById('perfil');

    // elementos do formulário de login
    const idsForm = ['loginUsuario', 'loginSenha', 'botaoLogin'];
    const show = (id, on) => {
        const el = document.getElementById(id);
        if (el) el.style.display = on ? (id === 'btnLogout' ? 'block' : 'block') : 'none';
    };

    if (sess && sess.username) {
        const user = getUsers().find(u => u.username === sess.username) || { username: sess.username };

        // monta card simples com dados (mostre só o que quiser)
        perfilEl.innerHTML = `
        <br><br><br><br><br><br><div class="perfil-card">
          <h2>Olá, ${user.nome || user.username}! Você está logado(a).<br> <br> Dados do perfil:</h2>
          <p><strong>Usuário:</strong> ${user.username}</p>
          ${user.email ? `<p><strong>E-mail:</strong> ${user.email}</p>` : ''}
          ${user.cpf ? `<p><strong>CPF:</strong> ${user.cpf}</p>` : ''}
        </div>
      `;
        perfilEl.style.display = 'block';

        idsForm.forEach(id => show(id, false));
        show('btnLogout', true);

        // liga o sair
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                const api = new EcommerceAPI();
                api.logout(); // já limpa a sessão e redireciona
            };
        }
    } else {
        perfilEl.style.display = 'none';
        idsForm.forEach(id => show(id, true));
        show('btnLogout', false);
    }
}

// Torna global para poder chamar após login
window.renderAuthView = renderAuthView;

// Renderiza na entrada da página
document.addEventListener('DOMContentLoaded', renderAuthView);

