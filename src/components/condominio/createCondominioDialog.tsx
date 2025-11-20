"use client";

import { useState, useEffect } from "react";
import EditDialogBase from "@/components/editLog";
import { ICondominioCreate } from "@/service/condominio.service";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: ICondominioCreate) => Promise<void>;
  validate: (data: ICondominioCreate) => string | null;
}

export default function CreateCondominioDialog({
  open,
  onOpenChange,
  onSave,
  validate,
}: Props) {
  const [data, setData] = useState<ICondominioCreate>({
    nome_condominio: "",
    endereco_condominio: "",
    cidade_condominio: "",
    uf_condominio: "",
    tipo_condominio: "",
  });

  // Resetar formulário ao abrir
  useEffect(() => {
    if (open) {
      setData({
        nome_condominio: "",
        endereco_condominio: "",
        cidade_condominio: "",
        uf_condominio: "",
        tipo_condominio: "",
      });
    }
  }, [open]);

  return (
    <EditDialogBase
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Condomínio"
      initialData={data}
      onSave={onSave}
      validate={validate}
      requireConfirmation={false}
    >
      {(data, setData) => (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium">Nome *</label>
            <input
              value={data.nome_condominio}
              onChange={(e) =>
                setData({ ...data, nome_condominio: e.target.value })
              }
              className="mt-1 w-full border rounded p-2"
              placeholder="Nome do condomínio"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Endereço</label>
            <input
              value={data.endereco_condominio || ""}
              onChange={(e) =>
                setData({ ...data, endereco_condominio: e.target.value })
              }
              className="mt-1 w-full border rounded p-2"
              placeholder="Endereço"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cidade *</label>
              <input
                value={data.cidade_condominio}
                onChange={(e) =>
                  setData({ ...data, cidade_condominio: e.target.value })
                }
                className="mt-1 w-full border rounded p-2"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="text-sm font-medium">UF *</label>
              <input
                value={data.uf_condominio}
                onChange={(e) =>
                  setData({
                    ...data,
                    uf_condominio: e.target.value.toUpperCase(),
                  })
                }
                maxLength={2}
                className="mt-1 w-full border rounded p-2"
                placeholder="SP"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <input
              value={data.tipo_condominio || ""}
              onChange={(e) =>
                setData({ ...data, tipo_condominio: e.target.value })
              }
              className="mt-1 w-full border rounded p-2"
              placeholder="Residencial, Comercial..."
            />
          </div>
        </div>
      )}
    </EditDialogBase>
  );
}
