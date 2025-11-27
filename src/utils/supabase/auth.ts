import { createClient } from "./server";

export async function getUsuarioLogado() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return null;
    }

    return {
        id: data.user.id
    }
}