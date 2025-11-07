"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCondominio, ICondominio } from "@/service/condominio.service";
import { showToast } from "@/components/toastNotification";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominio: ICondominio;
  onUpdate: (id: number, novosDados: Partial<ICondominio>) => void;
}

export default function EditDialog({
  open,
  onOpenChange,
  condominio,
  onUpdate,
}: EditDialogProps) {
  const [formData, setFormData] = React.useState(condominio);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setFormData(condominio);
  }, [condominio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const atualizado = await updateCondominio(condominio.id, formData);
      if (atualizado) {
        onUpdate(condominio.id, formData);
        showToast.success("Condomínio atualizado com sucesso!");
      }
      onOpenChange(false);
    } catch {
      showToast.error("Erro ao atualizar condomínio. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Condomínio</DialogTitle>
          <DialogDescription>Atualize as informações abaixo:</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Input name="nome_condominio" value={formData.nome_condominio} onChange={handleChange} placeholder="Nome" />
          <Input name="tipo_condominio" value={formData.tipo_condominio} onChange={handleChange} placeholder="Tipo" />
          <Input name="endereco_condominio" value={formData.endereco_condominio} onChange={handleChange} placeholder="Endereço" />
          <Input name="cidade_condominio" value={formData.cidade_condominio} onChange={handleChange} placeholder="Cidade" />
          <Input name="uf_condominio" value={formData.uf_condominio} onChange={handleChange} placeholder="UF" maxLength={2} />
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
