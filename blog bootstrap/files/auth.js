function traduzirErroAuth(erro) {
  const codigo = erro && erro.code ? erro.code : '';
  const mensagem = erro && erro.message ? erro.message : '';
  const porCodigo = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
    user_already_exists: 'Este e-mail já está cadastrado.',
    weak_password: 'Senha fraca. Use pelo menos 8 caracteres.',
    over_email_send_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
    over_request_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
    email_address_invalid: 'E-mail inválido.',
    validation_failed: 'Dados inválidos. Confira o e-mail e a senha.',
    signup_disabled: 'O cadastro está desativado neste projeto.'
  };
  if (porCodigo[codigo]) return porCodigo[codigo];
  if (/invalid login credentials/i.test(mensagem)) return porCodigo.invalid_credentials;
  if (/already registered/i.test(mensagem)) return porCodigo.user_already_exists;
  if (/not confirmed/i.test(mensagem)) return porCodigo.email_not_confirmed;
  if (/rate limit/i.test(mensagem)) return porCodigo.over_email_send_rate_limit;
  if (/failed to fetch|network/i.test(mensagem)) return 'Sem conexão com o servidor de autenticação.';
  return 'Não foi possível concluir a operação. Tente novamente.';
}

async function obterSessao() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) return null;
    return data.session;
  } catch (erro) {
    return null;
  }
}

async function cadastrarUsuario(nome, email, senha) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } }
    });
    if (error) return { ok: false, mensagem: traduzirErroAuth(error) };
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { ok: false, mensagem: traduzirErroAuth({ code: 'user_already_exists' }) };
    }
    return { ok: true, confirmar: !data.session };
  } catch (erro) {
    return { ok: false, mensagem: traduzirErroAuth(erro) };
  }
}

async function entrarUsuario(email, senha) {
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
    if (error) return { ok: false, mensagem: traduzirErroAuth(error) };
    return { ok: true };
  } catch (erro) {
    return { ok: false, mensagem: traduzirErroAuth(erro) };
  }
}

async function sairUsuario() {
  try {
    await supabaseClient.auth.signOut({ scope: 'local' });
  } catch (erro) {
    console.error('Erro ao sair:', erro);
  }
  window.location.href = 'index.html';
}

async function exigirLogin() {
  const sessao = await obterSessao();
  if (!sessao) {
    window.location.replace('login.html');
    return null;
  }
  return sessao;
}

function nomeDaSessao(sessao) {
  const meta = sessao.user.user_metadata || {};
  return meta.nome || sessao.user.email;
}

function iniciais(texto) {
  const partes = String(texto || '?').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const letras = partes.length > 1
    ? partes[0].charAt(0) + partes[partes.length - 1].charAt(0)
    : partes[0].slice(0, 2);
  return letras.toUpperCase();
}

function renderizarAuthNav(sessao) {
  const colapso = document.querySelector('.main-navbar .navbar-collapse');
  if (!colapso) return;

  const antigo = document.getElementById('auth-nav');
  if (antigo) antigo.remove();

  const area = document.createElement('div');
  area.id = 'auth-nav';
  area.setAttribute('ng-non-bindable', '');
  area.className = 'd-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0';

  if (sessao) {
    const perfil = document.createElement('a');
    perfil.href = 'perfil.html';
    perfil.className = 'd-flex align-items-center text-decoration-none';
    perfil.title = sessao.user.email;
    perfil.setAttribute('aria-label', 'Meu perfil');

    const avatar = document.createElement('span');
    avatar.className = 'author-avatar small';
    avatar.textContent = iniciais(nomeDaSessao(sessao));
    perfil.appendChild(avatar);

    const sair = document.createElement('button');
    sair.type = 'button';
    sair.className = 'btn-ghost py-2 px-3';
    sair.textContent = 'Sair';
    sair.addEventListener('click', sairUsuario);

    area.appendChild(perfil);
    area.appendChild(sair);
  } else {
    const entrar = document.createElement('a');
    entrar.href = 'login.html';
    entrar.className = 'btn-ghost py-2 px-3 text-decoration-none';
    entrar.textContent = 'Entrar';
    area.appendChild(entrar);
  }

  colapso.appendChild(area);
}

document.addEventListener('DOMContentLoaded', () => {
  obterSessao().then(renderizarAuthNav);
  supabaseClient.auth.onAuthStateChange((evento, sessao) => {
    renderizarAuthNav(sessao);
  });
});
