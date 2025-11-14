"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "./confirmDialog";

interface EditDialogInjectedProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

interface ActionDropdownProps {
  itemName: string;
  onEdit?: () => void;
  onDelete?: () => void;
  editDialog?: React.ReactElement<EditDialogInjectedProps> | null;
}

export default function DropdownActions({
  itemName,
  onEdit,
  onDelete,
  editDialog = null,
}: ActionDropdownProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const dialogClonado = editDialog
    ? React.cloneElement(editDialog, {
        open: openEdit,
        onOpenChange: setOpenEdit,
      })
    : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Ações"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-36">
          {onEdit && (
            <DropdownMenuItem
              onClick={() => {
                onEdit();
                setOpenEdit(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4 text-blue-600" /> Editar
            </DropdownMenuItem>
          )}

          {onDelete && (
            <DropdownMenuItem
              onClick={() => setOpenConfirm(true)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogClonado}

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title={`Excluir ${itemName}`}
        description={`Tem certeza que deseja excluir "${itemName}"? Essa ação não poderá ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={onDelete ?? (() => {})}
      />
    </>
  );
}