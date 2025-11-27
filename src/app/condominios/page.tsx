"use client";
import { useEffect, useState } from "react";
import SearchBar from "@/components/barraPesquisa";
import DropdownActions from "@/components/dropdownActions";
import EditDialogBase from "@/components/editLog";
import { showToast } from "@/components/toastNotification";
import {
  getCondominios,
  createCondominio,
  updateCondominio,
  deleteCondominio,
  ICondominio,
  ICondominioCreate,
} from "@/service/condominio.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ListaCondominios() {
  const [condominios, setCondominios] = useState<ICondominio[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do dialog (único para criar E editar)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [condominioSelecionado, setCondominioSelecionado] =
    useState<ICondominio | null>(null);

  const buscarCondominios = async () => {
    try {
      setLoading(true);
      const data = await getCondominios();
      setCondominios(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar condomínios.");
      showToast.error("Erro ao carregar condomínios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarCondominios();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCondominio(id);
      setCondominios((prev) => prev.filter((c) => c.id !== id));
      showToast.success("Condomínio excluído com sucesso!");
    } catch (err: any) {
      showToast.error(err.message || "Erro ao excluir condomínio");
    }
  };

  const handleCreate = async (dados: ICondominio) => {
    try {
      const { id, created_at, updated_at, ...dadosCreate } = dados;
      const novo = await createCondominio(dadosCreate as ICondominioCreate);
      setCondominios((prev) => [...prev, novo]);
      showToast.success("Condomínio criado com sucesso!");
    } catch (err: any) {
      showToast.error(err.message || "Erro ao criar condomínio");
      throw err;
    }
  };

  const handleUpdate = async (dados: ICondominio) => {
    try {
      const updated = await updateCondominio(dados.id, dados);
      setCondominios((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showToast.success("Condomínio atualizado com sucesso!");
    } catch (err: any) {
      showToast.error(err.message || "Erro ao atualizar condomínio");
      throw err;
    }
  };

  const abrirCriacao = () => {
    setModoEdicao(false);
    setCondominioSelecionado({
      id: 0,
      nome_condominio: "",
      endereco_condominio: "",
      cidade_condominio: "",
      uf_condominio: "",
      tipo_condominio: "",
    });
    setDialogOpen(true);
  };

  const abrirEdicao = (condominio: ICondominio) => {
    setModoEdicao(true);
    setCondominioSelecionado(condominio);
    setDialogOpen(true);
  };

  const validarCondominio = (data: ICondominio): string | null => {
    if (!data.nome_condominio?.trim()) {
      return "Nome do condomínio é obrigatório";
    }
    if (!data.cidade_condominio?.trim()) {
      return "Cidade é obrigatória";
    }
    if (!data.uf_condominio?.trim()) {
      return "UF é obrigatória";
    }
    if (data.uf_condominio.length !== 2) {
      return "UF deve ter 2 caracteres";
    }
    return null;
  };

  const condominiosFiltrados = condominios.filter((c) => {
    const texto = filtro.toLowerCase();
    return (
      c.nome_condominio?.toLowerCase().includes(texto) ||
      c.endereco_condominio?.toLowerCase().includes(texto) ||
      c.cidade_condominio?.toLowerCase().includes(texto) ||
      c.uf_condominio?.toLowerCase().includes(texto) ||
      c.tipo_condominio?.toLowerCase().includes(texto)
    );
  });

  if (loading) {
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
            onClick={buscarCondominios}
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
        <h1 className="text-2xl font-bold text-gray-800">Condomínios</h1>
        <Button onClick={abrirCriacao} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Condomínio
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar value={filtro} onChange={setFiltro} />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endereço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {condominiosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {filtro
                    ? "Nenhum condomínio encontrado com esse filtro"
                    : "Nenhum condomínio cadastrado"}
                </td>
              </tr>
            ) : (
              condominiosFiltrados.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {c.nome_condominio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.endereco_condominio || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.cidade_condominio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.uf_condominio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.tipo_condominio || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DropdownActions
                      itemName={c.nome_condominio ?? "Item"}
                      onEdit={() => abrirEdicao(c)}
                      onDelete={() => handleDelete(c.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog único para criar E editar */}
      {condominioSelecionado && (
        <EditDialogBase
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={modoEdicao ? "Editar Condomínio" : "Novo Condomínio"}
          initialData={condominioSelecionado}
          onSave={modoEdicao ? handleUpdate : handleCreate}
          validate={validarCondominio}
          requireConfirmation={true}
        >
          {(data, setData) => (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome do Condomínio *
                </Label>
                <Input
                  id="nome"
                  value={data.nome_condominio || ""}
                  onChange={(e) =>
                    setData({ ...data, nome_condominio: e.target.value })
                  }
                  placeholder="Digite o nome"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endereco" className="text-sm font-medium">
                  Endereço
                </Label>
                <Input
                  id="endereco"
                  value={data.endereco_condominio || ""}
                  onChange={(e) =>
                    setData({ ...data, endereco_condominio: e.target.value })
                  }
                  placeholder="Digite o endereço"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade" className="text-sm font-medium">
                    Cidade *
                  </Label>
                  <Input
                    id="cidade"
                    value={data.cidade_condominio || ""}
                    onChange={(e) =>
                      setData({ ...data, cidade_condominio: e.target.value })
                    }
                    placeholder="Cidade"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="uf" className="text-sm font-medium">
                    UF *
                  </Label>
                  <Input
                    id="uf"
                    value={data.uf_condominio || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        uf_condominio: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SP"
                    maxLength={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tipo" className="text-sm font-medium">
                  Tipo
                </Label>
                <Input
                  id="tipo"
                  value={data.tipo_condominio || ""}
                  onChange={(e) =>
                    setData({ ...data, tipo_condominio: e.target.value })
                  }
                  placeholder="Residencial, Comercial, etc."
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