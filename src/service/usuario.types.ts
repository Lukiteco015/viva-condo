export const TABLE_NAME = "usuarios";

export interface IUsuario {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  id_administradora: number;
  id_authentication: string;
  tipo_acesso: "admin" | "usuario";
  created_at?: string;
  updated_at?: string;
}

export type IUsuarioCreate = Omit<
  IUsuario,
  "id" | "created_at" | "updated_at"
> & {
  senha: string;
};

export type IUsuarioUpdate = Partial<
  Omit<IUsuario, "id" | "created_at" | "updated_at" | "id_authentication">
> & {
  senha?: string;
  senhaAtual?: string;
};

export class UsuarioError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "UsuarioError";
  }
}