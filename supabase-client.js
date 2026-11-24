// Configuração do Supabase
// Substitua com suas credenciais do Supabase

const SUPABASE_URL = 'https://zlqtquameofcnnmyvpjz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F9_sT07L9DiwiwbRjA38IQ_hUVcA-y3';

// Inicializar cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções auxiliares para usar o banco

// 1. BUSCAR TODOS OS ARTIGOS
async function buscarArtigos() {
  try {
    const { data, error } = await supabaseClient
      .from('artigos')
      .select('*')
      .order('data_publicacao', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return [];
  }
}

// 2. BUSCAR ARTIGOS POR CATEGORIA
async function buscarArtigosPorCategoria(categoria) {
  try {
    const { data, error } = await supabaseClient
      .from('artigos')
      .select('*')
      .eq('categoria', categoria)
      .order('data_publicacao', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return [];
  }
}

// 3. BUSCAR UM ARTIGO ESPECÍFICO POR ID
async function buscarArtigoPorId(id) {
  try {
    const { data, error } = await supabaseClient
      .from('artigos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    return null;
  }
}

// 4. ADICIONAR UM NOVO ARTIGO (requer autenticação)
async function adicionarArtigo(artigo) {
  try {
    const { data, error } = await supabaseClient
      .from('artigos')
      .insert([artigo])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Erro ao adicionar artigo:', error);
    return null;
  }
}

// 5. BUSCAR COMENTÁRIOS DE UM ARTIGO
async function buscarComentarios(artigoId) {
  try {
    const { data, error } = await supabaseClient
      .from('comentarios')
      .select('*')
      .eq('artigo_id', artigoId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }
}

// 6. ADICIONAR COMENTÁRIO
async function adicionarComentario(artigoId, nome, email, mensagem) {
  try {
    const { data, error } = await supabaseClient
      .from('comentarios')
      .insert([{ artigo_id: artigoId, nome, email, mensagem }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return null;
  }
}

// 7. BUSCAR ARTIGOS COM BUSCA DE TEXTO
async function buscarArtigos_PorTexto(textoSearch) {
  try {
    const { data, error } = await supabaseClient
      .from('artigos')
      .select('*')
      .or(`titulo.ilike.%${textoSearch}%,descricao.ilike.%${textoSearch}%`)
      .order('data_publicacao', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return [];
  }
}
