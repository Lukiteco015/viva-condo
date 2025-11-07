// middleware.ts

import { NextResponse, type NextRequest } from 'next/server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
 
export async function middleware(request: NextRequest) {

  // 1. Cria uma resposta base que será usada e possivelmente modificada

  let response = NextResponse.next({

    request: {

      headers: request.headers,

    },

  });
 
  // 2. Cria o cliente Supabase DENTRO do middleware (seu método)

  const supabase = createServerClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    {

      cookies: {

        get(name: string) {

          return request.cookies.get(name)?.value;

        },

        set(name: string, value: string, options: CookieOptions) {

          // O `createServerClient` precisa ser capaz de definir cookies na requisição e na resposta

          request.cookies.set({ name, value, ...options });

          response = NextResponse.next({

            request: {

              headers: request.headers,

            },

          });

          response.cookies.set({ name, value, ...options });

        },

        remove(name: string, options: CookieOptions) {

          // O `createServerClient` precisa ser capaz de remover cookies na requisição e na resposta

          request.cookies.set({ name, value: '', ...options });

          response = NextResponse.next({

            request: {

              headers: request.headers,

            },

          });

          response.cookies.set({ name, value: '', ...options });

        },

      },

    }

  );
 
  // 3. Busca a sessão do usuário (isso também atualiza o cookie se necessário)

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
 
  // 4. LÓGICA DE REDIRECIONAMENTO (a parte mais importante)

  // ----------------------------------------------------------------

  // Define as rotas públicas que não exigem login

  // Usei '/' como sua página de login, ajuste se for '/login'

  const publicRoutes = ['/'];
 
  // CASO 1: Usuário está LOGADO e tenta acessar a página de login

  if (session && publicRoutes.includes(pathname)) {

    console.log("✅ Usuário logado tentando acessar rota pública. Redirecionando para /dashboard...");

    // Altere '/dashboard' para a sua página principal após o login

    return NextResponse.redirect(new URL('/condominios', request.url));

  }
 
  // CASO 2: Usuário NÃO está LOGADO e tenta acessar uma rota protegida

  if (!session && !publicRoutes.includes(pathname)) {

    console.log("🚫 Usuário deslogado tentando acessar rota protegida. Redirecionando para a página inicial...");

    // Redireciona para a página de login

    return NextResponse.redirect(new URL('/', request.url));

  }

  // Se nenhuma regra de redirecionamento for acionada, permite o acesso

  console.log(`➡️ Acesso permitido para a rota: ${pathname}`);

  return response;

}
 
// 5. CONFIGURAÇÃO DO MATCHER (igual a antes, para rodar em todas as rotas)

// ----------------------------------------------------------------

export const config = {

  matcher: [

    /*

     * Corresponde a todas as rotas, exceto as que começam com:

     * - _next/static (arquivos estáticos)

     * - _next/image (imagens otimizadas)

     * - favicon.ico (ícone do site)

     * - qualquer coisa com uma extensão de arquivo (e.g., .svg, .png)

     */

    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

  ],

};
 