import { supabase } from "@/utils/supabase/client";

const TABLE_NAME = "condominio";


export interface ICondominio {
  id: number;
  nome_condominio: string;
  endereco_condominio: string | null;
  cidade_condominio: string;
  uf_condominio: string;
  tipo_condominio: string | null;
  created_at?: string;
  updated_at?: string;
}


export type ICondominioCreate = Omit<ICondominio, "id" | "created_at" | "updated_at">;


export type ICondominioUpdate = Partial<ICondominioCreate>;


export class CondominioError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "CondominioError";
  }
}


function handleSupabaseError(error: any, operation: string): never {
  console.error(`[Condominio Service] ${operation} error:`, error);

  const errorMap: Record<string, { msg: string; code: string }> = {
    "PGRST116": { msg: "Condomínio não encontrado", code: "NOT_FOUND" },
    "23505": { msg: "Já existe um condomínio com esses dados", code: "DUPLICATE" },
    "23503": { msg: "Não é possível excluir: existem registros relacionados", code: "FOREIGN_KEY_VIOLATION" }
  };

  const mappedError = errorMap[error.code];

  if (mappedError) {
    throw new CondominioError(mappedError.msg, mappedError.code, error);
  }

  throw new CondominioError(
    error.message || `Erro ao ${operation}`,
    error.code || "UNKNOWN",
    error
  );
}

function sanitizarDados<T extends Partial<ICondominioCreate>>(dados: T): T {
  const sanitizado = { ...dados };

  if (sanitizado.nome_condominio) sanitizado.nome_condominio = sanitizado.nome_condominio.trim();
  if (sanitizado.endereco_condominio) sanitizado.endereco_condominio = sanitizado.endereco_condominio.trim();
  if (sanitizado.cidade_condominio) sanitizado.cidade_condominio = sanitizado.cidade_condominio.trim();
  if (sanitizado.uf_condominio) sanitizado.uf_condominio = sanitizado.uf_condominio.trim().toUpperCase();
  if (sanitizado.tipo_condominio) sanitizado.tipo_condominio = sanitizado.tipo_condominio.trim();

  return sanitizado;
}


function validarPayload(dados: Partial<ICondominioCreate>, isUpdate: boolean = false) {
  if (!isUpdate) {
    if (!dados.nome_condominio) throw new CondominioError("Nome do condomínio é obrigatório", "VALIDATION_ERROR");
    if (!dados.cidade_condominio) throw new CondominioError("Cidade é obrigatória", "VALIDATION_ERROR");
    if (!dados.uf_condominio) throw new CondominioError("UF é obrigatória", "VALIDATION_ERROR");
  }

  if (dados.uf_condominio && dados.uf_condominio.length !== 2) {
    throw new CondominioError("UF deve ter exatamente 2 caracteres", "VALIDATION_ERROR");
  }
}

export async function getCondominios(): Promise<ICondominio[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: true });

    if (error) handleSupabaseError(error, "buscar condomínios");
    return data ?? [];
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao buscar lista de condomínios");
  }
}

export async function getCondominioById(id: number): Promise<ICondominio | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      handleSupabaseError(error, "buscar condomínio por ID");
    }
    return data;
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao buscar condomínio");
  }
}

/**
 * Cria um novo condomínio
 */
export async function createCondominio(dados: ICondominioCreate): Promise<ICondominio> {
  try {
    const dadosLimpos = sanitizarDados(dados);
    validarPayload(dadosLimpos, false);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(dadosLimpos)
      .select()
      .single();

    if (error) handleSupabaseError(error, "criar condomínio");
    if (!data) throw new CondominioError("Erro ao retornar dados do condomínio criado");

    return data;
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao criar condomínio");
  }
}

/**
 * Atualiza um condomínio existente.
 * Aceita partial update (envie apenas o que mudou).
 */
export async function updateCondominio(id: number, dados: ICondominioUpdate): Promise<ICondominio> {
  try {
    if (!id) throw new CondominioError("ID é obrigatório para atualização", "VALIDATION_ERROR");

    // Sanitiza apenas os campos enviados
    const dadosLimpos = sanitizarDados(dados);
    validarPayload(dadosLimpos, true);

    // Dica: Em sistemas de alta performance, removemos o "getById" antes do update para economizar request,
    // confiando que o update retornará erro se o ID não existir ou se retornar null.
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(dadosLimpos)
      .eq("id", id)
      .select()
      .single();

    if (error) handleSupabaseError(error, "atualizar condomínio");
    if (!data) throw new CondominioError("Condomínio não encontrado para atualização", "NOT_FOUND");

    return data;
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao atualizar condomínio");
  }
}

export async function deleteCondominio(id: number): Promise<void> {
  try {
    if (!id) throw new CondominioError("ID inválido", "VALIDATION_ERROR");

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) handleSupabaseError(error, "excluir condomínio");
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao excluir condomínio");
  }
}


export async function getCondominiosByFiltro(
  campo: "cidade_condominio" | "uf_condominio", 
  valor: string
): Promise<ICondominio[]> {
  try {
    let query = supabase
      .from(TABLE_NAME)
      .select("*")
      .order("nome_condominio", { ascending: true });

    if (campo === "cidade_condominio") {
      query = query.ilike(campo, `%${valor}%`);
    } else {
      query = query.eq(campo, valor.toUpperCase());
    }

    const { data, error } = await query;

    if (error) handleSupabaseError(error, `buscar condomínios por ${campo}`);
    return data ?? [];
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError(`Erro ao filtrar condomínios por ${campo}`);
  }
}