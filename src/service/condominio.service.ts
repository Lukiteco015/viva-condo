import { supabase } from "@/utils/supabase/client";

export interface ICondominio {
  id: number;
  nome_condominio: string;
  endereco_condominio: string;
  cidade_condominio: string;
  uf_condominio: string;
  tipo_condominio: string;
}

export async function getCondominios() {
  const { data, error } = await supabase
    .from("condominio")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteCondominio(id: number) {
  const { error } = await supabase.from("condominio").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateCondominio(
  id: number,
  dadosAtualizados: Partial<ICondominio>
) {
  const { data, error } = await supabase
    .from("condominio")
    .update(dadosAtualizados)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data?.[0];
}
