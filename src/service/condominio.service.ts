import { supabase } from "@/utils/supabase/client";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

export interface ICondominioCreate {
  nome_condominio: string;
  endereco_condominio?: string | null;
  cidade_condominio: string;
  uf_condominio: string;
  tipo_condominio?: string | null;
}

export interface ICondominioUpdate {
  nome_condominio?: string;
  endereco_condominio?: string | null;
  cidade_condominio?: string;
  uf_condominio?: string;
  tipo_condominio?: string | null;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

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

  if (error.code === "PGRST116") {
    throw new CondominioError(
      "Condomínio não encontrado",
      "NOT_FOUND",
      error
    );
  }

  if (error.code === "23505") {
    throw new CondominioError(
      "Já existe um condomínio com esses dados",
      "DUPLICATE",
      error
    );
  }

  if (error.code === "23503") {
    throw new CondominioError(
      "Não é possível excluir: existem registros relacionados",
      "FOREIGN_KEY_VIOLATION",
      error
    );
  }

  throw new CondominioError(
    error.message || `Erro ao ${operation}`,
    error.code,
    error
  );
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getCondominios(): Promise<ICondominio[]> {
  try {
    const { data, error } = await supabase
      .from("condominio")
      .select("*")
      .order("id", { ascending: true });

    if (error) handleSupabaseError(error, "buscar condomínios");

    return data ?? [];
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao buscar condomínios");
  }
}

export async function getCondominioById(
  id: number
): Promise<ICondominio | null> {
  try {
    const { data, error } = await supabase
      .from("condominio")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      handleSupabaseError(error, "buscar condomínio");
    }

    return data;
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao buscar condomínio");
  }
}

export async function createCondominio(
  dados: ICondominioCreate
): Promise<ICondominio> {
  try {
    if (!dados.nome_condominio?.trim()) {
      throw new CondominioError(
        "Nome do condomínio é obrigatório",
        "VALIDATION_ERROR"
      );
    }

    if (!dados.cidade_condominio?.trim()) {
      throw new CondominioError("Cidade é obrigatória", "VALIDATION_ERROR");
    }

    if (!dados.uf_condominio?.trim() || dados.uf_condominio.length !== 2) {
      throw new CondominioError(
        "UF deve ter exatamente 2 caracteres",
        "VALIDATION_ERROR"
      );
    }

    const { data, error } = await supabase
      .from("condominio")
      .insert({
        nome_condominio: dados.nome_condominio.trim(),
        endereco_condominio: dados.endereco_condominio?.trim() || null,
        cidade_condominio: dados.cidade_condominio.trim(),
        uf_condominio: dados.uf_condominio.trim().toUpperCase(),
        tipo_condominio: dados.tipo_condominio?.trim() || null,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, "criar condomínio");
    if (!data) throw new CondominioError("Erro ao criar condomínio");

    return data;
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao criar condomínio");
  }
}

/**
 * Atualiza um condomínio existente
 * @param dados - Objeto completo do condomínio com o ID
 */
export async function updateCondominio(
  dados: ICondominio
): Promise<ICondominio> {
  try {
    if (!dados.id) {
      throw new CondominioError("ID é obrigatório", "VALIDATION_ERROR");
    }

    const exists = await getCondominioById(dados.id);
    if (!exists) {
      throw new CondominioError("Condomínio não encontrado", "NOT_FOUND");
    }

    const { data, error } = await supabase
      .from("condominio")
      .update({
        nome_condominio: dados.nome_condominio?.trim(),
        endereco_condominio: dados.endereco_condominio?.trim() || null,
        cidade_condominio: dados.cidade_condominio?.trim(),
        uf_condominio: dados.uf_condominio?.trim().toUpperCase(),
        tipo_condominio: dados.tipo_condominio?.trim() || null
      })
      .eq("id", dados.id)
      .select()
      .single();

    if (error) handleSupabaseError(error, "atualizar condomínio");
    if (!data) throw new CondominioError("Erro ao atualizar condomínio");

    return data;
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao atualizar condomínio");
  }
}

/**
 * Deleta um condomínio
 */
export async function deleteCondominio(id: number): Promise<void> {
  try {
    if (!id) {
      throw new CondominioError("ID é obrigatório", "VALIDATION_ERROR");
    }

    const exists = await getCondominioById(id);
    if (!exists) {
      throw new CondominioError("Condomínio não encontrado", "NOT_FOUND");
    }

    const { error } = await supabase.from("condominio").delete().eq("id", id);

    if (error) handleSupabaseError(error, "excluir condomínio");
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao excluir condomínio");
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

export async function getCondominiosByCidade(
  cidade: string
): Promise<ICondominio[]> {
  try {
    const { data, error } = await supabase
      .from("condominio")
      .select("*")
      .ilike("cidade_condominio", `%${cidade}%`)
      .order("nome_condominio", { ascending: true });

    if (error) handleSupabaseError(error, "buscar condomínios por cidade");

    return data ?? [];
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError(
      "Erro inesperado ao buscar condomínios por cidade"
    );
  }
}

export async function getCondominiosByUF(uf: string): Promise<ICondominio[]> {
  try {
    const { data, error } = await supabase
      .from("condominio")
      .select("*")
      .eq("uf_condominio", uf.toUpperCase())
      .order("nome_condominio", { ascending: true });

    if (error) handleSupabaseError(error, "buscar condomínios por UF");

    return data ?? [];
  } catch (error) {
    if (error instanceof CondominioError) throw error;
    throw new CondominioError("Erro inesperado ao buscar condomínios por UF");
  }
}