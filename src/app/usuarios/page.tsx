"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/barraPesquisa";
import DropdownActions from "@/components/dropdownActions";
import EditDialogBase from "@/components/editLog";
import { showToast } from "@/components/toastNotification";

// --- MUDANÇA 1: Importa a biblioteca moderna ---
import { PatternFormat } from "react-number-format";

import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
} from "@/service/usuario.service";

import { 
  IUsuario, 
  IUsuarioCreate, 
  IUsuarioUpdate 
} from "@/service/usuario.types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

// ==================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ==================================================

// Função para LIMPAR a máscara (deixar só números) antes de salvar no banco
const limparTelefone = (tel: string | null | undefined): string | null => {
  if (!tel) return null;
  // Remove tudo que NÃO for dígito (número)
  const apenasNumeros = tel.replace(/\D/g, ""); 
  // Retorna null se a string ficar vazia após limpar
  return apenasNumeros.length > 0 ? apenasNumeros : null;
};

// Função para FORMATAR o número existente para visualização
const formatarTelefoneTabela = (tel: string) => {
  const limpo = tel.replace(/\D/g, "");
  
  // Máscara para celular de 11 dígitos
  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  // Máscara para fixo de 10 dígitos (caso use)
  if (limpo.length === 10) {
    return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  // Retorna o original se não bater com os tamanhos padrão
  return tel; 
};

// ==================================================
// COMPONENTE PRINCIPAL
// ==================================================

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mantemos o estado apenas para controle visual (UI)
  const [tipoAcessoAtual, setTipoAcessoAtual] = useState<"admin" | "usuario" | null>(null);
  
  // Estado do dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);

  // Estado para senhas
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);

  // Busca permissão apenas para desenhar a tela corretamente
  useEffect(() => {
    const buscarUsuarioLogado = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("Usuário não está logado");
          setLoading(false);
          return;
        }

        // Busca o tipo de acesso na tabela pública
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .select("tipo_acesso")
          .eq("id_authentication", user.id)
          .single();

        if (usuarioError) {
          console.error("Erro ao buscar tipo de acesso:", usuarioError);
          setTipoAcessoAtual("usuario"); // Fallback seguro
        } else {
          setTipoAcessoAtual(usuarioData.tipo_acesso);
        }
      } catch (err) {
        console.error("Erro ao buscar usuário logado:", err);
        setTipoAcessoAtual("usuario");
      }
    };

    buscarUsuarioLogado();
  }, []);

  const buscarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      
      // Normalização para garantir tipagem correta
      const normalizados: IUsuario[] = data.map((u) => {
        const tipoLower = u.tipo_acesso?.toLowerCase();
        return {
          ...u,
          tipo_acesso: (tipoLower === "admin" || tipoLower === "usuario") 
            ? tipoLower as "admin" | "usuario"
            : "usuario"
        };
      });
      
      setUsuarios(normalizados);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar usuários.");
      showToast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tipoAcessoAtual) {
      buscarUsuarios();
    }
  }, [tipoAcessoAtual]);

  const handleDelete = async (id: number) => {
    try {
      await deleteUsuario(id); 
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      showToast.success("Usuário excluído com sucesso!");
    } catch (err: any) {
      showToast.error(err.message || "Erro ao excluir usuário");
    }
  };

  const handleCreate = async (dados: any) => {
    try {
      const { id, created_at, updated_at, ...dadosCreate } = dados;
      
      const dadosUsuario: IUsuarioCreate = {
        nome: dadosCreate.nome,
        id_administradora: dadosCreate.id_administradora,
        id_authentication: "",
        tipo_acesso: dadosCreate.tipo_acesso,
        email: dadosCreate.email,
        senha: dadosCreate.senha,
        // IMPORTANTE: Limpa o telefone antes de enviar pro service
        telefone: limparTelefone(dadosCreate.telefone)
      };

      const novo = await createUsuario(dadosUsuario);
      
      setUsuarios((prev) => [...prev, novo]);
      showToast.success("Usuário criado com sucesso!");
    } catch (err: any) {
      showToast.error(err.message || "Erro ao criar usuário");
    }
  };

  const handleUpdate = async (dados: any) => {
    try {
      const dadosUpdate: IUsuarioUpdate = {
        nome: dados.nome,
        id_administradora: dados.id_administradora,
        tipo_acesso: dados.tipo_acesso,
        // IMPORTANTE: Limpa o telefone antes de enviar pro service
        telefone: limparTelefone(dados.telefone)
      };

      if (dados.email && dados.email !== usuarioSelecionado.email) {
        dadosUpdate.email = dados.email;
      }

      if (dados.senha?.trim()) {
        if (!dados.senhaAtual) {
          throw new Error("Senha atual é obrigatória para alterar a senha");
        }
        dadosUpdate.senha = dados.senha;
        dadosUpdate.senhaAtual = dados.senhaAtual;
      }

      const updated = await updateUsuario(dados.id, dadosUpdate);

      setUsuarios((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      showToast.success("Usuário atualizado com sucesso!");
    } catch (err: any) {
      showToast.error(err.message || "Erro ao atualizar usuário");
    }
  };

  const abrirCriacao = () => {
    setModoEdicao(false);
    setUsuarioSelecionado({
      id: 0,
      nome: "",
      id_administradora: 1,
      tipo_acesso: "usuario",
      email: "",
      senha: "",
      senhaAtual: "",
      telefone: ""
    });
    setDialogOpen(true);
  };

  const abrirEdicao = (usuario: IUsuario) => {
    setModoEdicao(true);
    setUsuarioSelecionado({
      ...usuario,
      senha: "",
      senhaAtual: "",
      telefone: usuario.telefone || ""
    });
    setDialogOpen(true);
  };

  const validarUsuario = (data: any): string | null => {
    if (!data.nome?.trim()) return "Nome é obrigatório";
    if (!data.email?.trim()) return "Email é obrigatório";
    if (!modoEdicao && !data.senha?.trim()) return "Senha é obrigatória";
    if (data.senha && data.senha.length < 6) return "Senha deve ter no mínimo 6 caracteres";
    if (modoEdicao && data.senha?.trim() && !data.senhaAtual?.trim()) {
      return "Senha atual é obrigatória para alterar a senha";
    }
    if (!data.id_administradora) return "ID Administradora é obrigatório";
    
    // Validação opcional: verificar se o telefone está completo se foi preenchido
    if (data.telefone) {
      const numeros = limparTelefone(data.telefone) || "";
      // Verifica se tem pelo menos 10 dígitos (fixo) ou 11 (celular) se começou a digitar
      if (numeros.length > 0 && numeros.length < 10) return "Telefone incompleto";
    }

    return null;
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = filtro.toLowerCase();
    const telefoneFormatado = u.telefone ? formatarTelefoneTabela(u.telefone).toLowerCase() : "";
    const telefoneLimpo = u.telefone?.toLowerCase() || "";

    return (
      u.nome?.toLowerCase().includes(texto) ||
      u.email?.toLowerCase().includes(texto) ||
      u.tipo_acesso?.toLowerCase().includes(texto) ||
      telefoneFormatado.includes(texto) ||
      telefoneLimpo.includes(texto)
    );
  });

  if (loading || !tipoAcessoAtual) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={buscarUsuarios}
            className="mt-2 text-sm text-red-700 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        {tipoAcessoAtual === "admin" && (
          <Button onClick={abrirCriacao} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      <div className="mb-6">
        <SearchBar value={filtro} onChange={setFiltro} />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Admin.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {filtro ? "Nenhum usuário encontrado com esse filtro" : "Nenhum usuário cadastrado"}
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  
                  {/* Visualização na tabela com placeholder */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${u.telefone ? 'text-gray-500' : 'text-gray-300 italic select-none'}`}>
                    {u.telefone ? formatarTelefoneTabela(u.telefone) : "(DD) 99999-9999"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.tipo_acesso === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {u.tipo_acesso === "admin" ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id_administradora}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tipoAcessoAtual === "admin" && (
                      <DropdownActions
                        itemName={u.nome ?? "Item"}
                        onEdit={() => abrirEdicao(u)}
                        onDelete={() => handleDelete(u.id)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {usuarioSelecionado && (
        <EditDialogBase
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setMostrarSenha(false);
              setMostrarSenhaAtual(false);
            }
          }}
          title={modoEdicao ? "Editar Usuário" : "Novo Usuário"}
          initialData={usuarioSelecionado}
          onSave={modoEdicao ? handleUpdate : handleCreate}
          validate={validarUsuario}
          requireConfirmation={true}
        >
          {(data, setData) => (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium">Nome *</Label>
                <Input
                  id="nome"
                  value={data.nome || ""}
                  onChange={(e) => setData({ ...data, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                  className="mt-1"
                  disabled={modoEdicao}
                />
                {modoEdicao && <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>}
              </div>
              
              {/* --- MUDANÇA 2: INPUT COM A NOVA BIBLIOTECA --- */}
              <div>
                <Label htmlFor="telefone" className="text-sm font-medium">Telefone (Celular)</Label>
                <PatternFormat
                  format="(##) #####-####" // Define o formato. # é onde vão os números
                  mask="_" // Opcional: mostra _ onde falta digitar
                  customInput={Input} // Diz para usar o componente Input do shadcn
                  id="telefone"
                  placeholder="(DD) 99999-9999"
                  className="mt-1"
                  value={data.telefone || ""}
                  // A biblioteca cuida do evento e passa o valor formatado para o Input
                  onChange={(e) => setData({ ...data, telefone: e.target.value })}
                />
              </div>

              {modoEdicao && (
                <div>
                  <Label htmlFor="senhaAtual" className="text-sm font-medium">Senha Atual (obrigatória para alterar senha)</Label>
                  <div className="relative mt-1">
                    <Input
                      id="senhaAtual"
                      type={mostrarSenhaAtual ? "text" : "password"}
                      value={data.senhaAtual || ""}
                      onChange={(e) => setData({ ...data, senhaAtual: e.target.value })}
                      placeholder="Digite a senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="senha" className="text-sm font-medium">
                  {modoEdicao ? "Nova Senha (deixe em branco para não alterar)" : "Senha *"}
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={data.senha || ""}
                    onChange={(e) => setData({ ...data, senha: e.target.value })}
                    placeholder={modoEdicao ? "Digite a nova senha" : "Mínimo 6 caracteres"}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_acesso" className="text-sm font-medium">Tipo de Acesso *</Label>
                <select
                  id="tipo_acesso"
                  value={data.tipo_acesso || "usuario"}
                  onChange={(e) => setData({ ...data, tipo_acesso: e.target.value as 'admin' | 'usuario' })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <Label htmlFor="id_administradora" className="text-sm font-medium">ID Administradora *</Label>
                <Input
                  id="id_administradora"
                  type="number"
                  value={data.id_administradora || ""}
                  onChange={(e) => setData({ ...data, id_administradora: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </EditDialogBase>
      )}
    </div>
  );
}