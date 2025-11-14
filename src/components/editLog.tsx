"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./confirmDialog";

interface EditDialogBaseProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialData: T;
  onSave: (data: T) => void | Promise<void>;
  validate?: (data: T) => string | null; // retorna mensagem de erro ou null
  requireConfirmation?: boolean; // controla se precisa de confirmação
  children: (data: T, setData: (data: T) => void) => React.ReactNode;
}

export default function EditDialogBase<T>({
  open,
  onOpenChange,
  title = "Editar",
  initialData,
  onSave,
  validate,
  requireConfirmation = false,
  children,
}: EditDialogBaseProps<T>) {
  // Estado local - cópia dos dados para edição
  const [data, setData] = useState<T>(initialData);
  const [openConfirmSave, setOpenConfirmSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reseta o estado quando o dialog abre/fecha
  React.useEffect(() => {
    if (open) {
      setData(initialData);
      setError(null);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    // Validação
    if (validate) {
      const validationError = validate(data);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (requireConfirmation) {
      setOpenConfirmSave(true);
    } else {
      handleSave();
    }
  };

  const handleConfirmSave = () => {
    setOpenConfirmSave(false);
    handleSave();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {children(data, setData)}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <Button 
              onClick={handleSaveClick}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {requireConfirmation && (
        <ConfirmDialog
          open={openConfirmSave}
          onOpenChange={setOpenConfirmSave}
          title="Confirmar alterações"
          description="Deseja realmente salvar as alterações?"
          confirmLabel="Salvar"
          onConfirm={handleConfirmSave}
        />
      )}
    </>
  );
}