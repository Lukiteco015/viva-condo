"use client";
import { useEffect, useState } from "react";
import SearchBar from "@/components/barraPesquisa";
import DropdownActions from "@/components/dropdownActions";
import { showToast } from "@/components/toastNotification";
import { getCondominios, deleteCondominio, ICondominio } from "@/service/condominio.service";

export default function ListaCondominios() {
  const [condominios, setCondominios] = useState<ICondominio[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarCondominios = async () => {
    try {
      setLoading(true);
      const data = await getCondominios();
      setCondominios(data);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar condomínios.");
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
    } catch {
      showToast.error("Erro ao excluir condomínio.");
    }
  };

  const handleUpdate = (id: number, novosDados: Partial<ICondominio>) => {
    setCondominios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...novosDados } : c))
    );
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

  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Condomínios</h1>
      <div className="mb-6">
        <SearchBar value={filtro} onChange={setFiltro} />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {condominiosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Nenhum condomínio encontrado.
                </td>
              </tr>
            ) : (
              condominiosFiltrados.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-600">{i + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.nome_condominio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.endereco_condominio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.cidade_condominio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.uf_condominio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.tipo_condominio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <DropdownActions
                      condominio={c}
                      onDelete={() => handleDelete(c.id)}
                      onUpdate={handleUpdate}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
