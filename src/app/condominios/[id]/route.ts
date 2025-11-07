import { NextResponse } from "next/server";
import { deleteCondominio } from "@/service/condominio.service";

export async function DELETE(request: Request, { params }: { params: { id: number } }) {
  try {
    await deleteCondominio(params.id);
    return NextResponse.json({ message: "Condomínio excluído com sucesso." });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao excluir condomínio." }, { status: 500 });
  }
}
