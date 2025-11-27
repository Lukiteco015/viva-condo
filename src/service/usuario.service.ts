"use server";

import { createClient } from "@/utils/supabase/server";
import { getUsuarioLogado } from "@/utils/supabase/auth";
import { 
  IUsuario, 
  IUsuarioCreate, 
  IUsuarioUpdate, 
  UsuarioError, 
  TABLE_NAME 
} from "./usuario.types";

function handleSupabaseError(error: any, operation: string): never {
  console.error(`[Usuario Service] Falha ao ${operation}:`, error);

  const errorMap: Record<string, { msg: string; code: string }> = {
    PGRST116: { msg: "Usuário não encontrado", code: "NOT_FOUND" },
    "23505": { msg: "Já existe um usuário com esses dados", code: "DUPLICATE" },
    "23503": {
      msg: "Não é possível excluir: existem registros relacionados",
      code: "FOREIGN_KEY_VIOLATION",
    },
  };

  const mappedError = errorMap[error?.code];

  if (mappedError) {
    throw new UsuarioError(mappedError.msg, mappedError.code, error);
  }

  throw new UsuarioError(
    error?.message || `Erro inesperado ao ${operation}`,
    error?.code || "UNKNOWN",
    error
  );
}


async function getUsuarioExecutante(): Promise<IUsuario> {
  const authUser = await getUsuarioLogado();

  if (!authUser || !authUser.id) {
    throw new UsuarioError("Usuário não autenticado.", "UNAUTHORIZED");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id_authentication", authUser.id)
    .single();

  if (error || !data) {
    throw new UsuarioError(
      "Registro de usuário não encontrado para esta conta.",
      "PROFILE_NOT_FOUND"
    );
  }

  return data as IUsuario;
}

async function verificarPermissaoAdmin(): Promise<void> {
  const usuarioExecutante = await getUsuarioExecutante();

  if (usuarioExecutante.tipo_acesso !== "admin") {
    throw new UsuarioError(
      "Ação não autorizada. Apenas administradores.",
      "FORBIDDEN"
    );
  }
}


export async function getUsuarios(): Promise<IUsuario[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("nome", { ascending: true });

    if (error) handleSupabaseError(error, "buscar usuários");
    return data ?? [];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getUsuarioById(id: number): Promise<IUsuario | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      handleSupabaseError(error, "buscar usuário por ID");
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function buscarUsuarioPorNome(nome: string): Promise<IUsuario[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .ilike("nome", `%${nome}%`)
      .order("nome");

    if (error) handleSupabaseError(error, "buscar usuário por nome");
    return data ?? [];
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createUsuario(dados: IUsuarioCreate): Promise<IUsuario> {
  try {
    const supabase = await createClient();
    
    // Verifica permissão usando o cookie da sessão atual
    await verificarPermissaoAdmin();

    if (!dados.email?.trim()) throw new Error("Email é obrigatório");
    if (!dados.senha || dados.senha.length < 6) throw new Error("Senha curta");
    if (!dados.nome?.trim()) throw new Error("Nome é obrigatório");

    // 1. Cria Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
    });

    if (authError) {
      throw new Error(authError.message === "User already registered" ? "Email já cadastrado" : authError.message);
    }
    if (!authData.user) throw new Error("Erro auth");

    // 2. Cria DB
    const { senha, ...resto } = dados;
    const { data: usuario, error: dbError } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...resto,
        id_authentication: authData.user.id,
      })
      .select()
      .single();

    if (dbError) handleSupabaseError(dbError, "criar usuário");

    return usuario!;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUsuario(id: number, dados: IUsuarioUpdate): Promise<IUsuario> {
  try {
    const supabase = await createClient();
    await verificarPermissaoAdmin();

    const usuarioAlvo = await getUsuarioById(id);
    if (!usuarioAlvo) throw new Error("Usuário não encontrado");

    // Lógica Senha/Email
    if (dados.senha) {
      if (!dados.senhaAtual) throw new Error("Senha atual obrigatória");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuarioAlvo.email,
        password: dados.senhaAtual,
      });
      if (signInError) throw new Error("Senha atual incorreta");
      
      const { error: upAuth } = await supabase.auth.updateUser({ password: dados.senha });
      if (upAuth) throw new Error("Erro update senha auth");
    }

    if (dados.email && dados.email !== usuarioAlvo.email) {
      const { error: upEmail } = await supabase.auth.updateUser({ email: dados.email });
      if (upEmail) throw new Error("Erro update email auth");
    }

    // Update DB
    const { senha, senhaAtual, ...dadosUpdateDB } = dados;
    if (Object.keys(dadosUpdateDB).length > 0) {
      const { data: usuarioAtualizado, error: dbError } = await supabase
        .from(TABLE_NAME)
        .update(dadosUpdateDB)
        .eq("id", id)
        .select()
        .single();

      if (dbError) handleSupabaseError(dbError, "atualizar usuário");
      return usuarioAtualizado!;
    }
    return usuarioAlvo;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteUsuario(id: number): Promise<void> {
  try {
    const supabase = await createClient();
    await verificarPermissaoAdmin();

    const { error: dbError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (dbError) handleSupabaseError(dbError, "excluir usuário");
  } catch (error: any) {
    throw new Error(error.message);
  }
}