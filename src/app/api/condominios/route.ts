import { NextResponse } from "next/server";
import { getCondominios } from "@/service/condominio.service";
import { count, error } from "console";

export async function GET () {
    try {
        const data = await getCondominios();

        return NextResponse.json({
            sucess: true,
            count: data.length,
            data,
        }, { status: 200})
    } catch (e: any) {
        return NextResponse.json({
            sucess: false,
            error: e.message ?? "Erro inesperado",
        }, { status: 400})
    }
}