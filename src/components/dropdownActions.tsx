"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "./confirmDialog";
import EditDialog from "./editLog";
import { ICondominio } from "@/service/condominio.service";

interface DropdownActionsProps {
  condominio: ICondominio;
  onDelete: () => void;
  onUpdate: (id: number, novosDados: Partial<ICondominio>) => void;
}

export default function DropdownActions({
  condominio,
  onDelete,
  onUpdate,
}: DropdownActionsProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Ações do condomínio"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Pencil className="mr-2 h-4 w-4 text-blue-600" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenConfirm(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        condominio={condominio}
        onUpdate={onUpdate}
      />

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Excluir condomínio"
        description={`Tem certeza de que deseja excluir o condomínio "${condominio.nome_condominio}"? Essa ação não poderá ser desfeita.`}
        onConfirm={onDelete}
        confirmLabel="Excluir"
      />
    </>
  );
}
