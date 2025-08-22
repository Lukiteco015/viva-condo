"use client"

type Morador = {
  primeiroNome: string,
  sobrenome: string
}

export default function Home () {
  const element = <span>Olá Mundo!</span>

  function formatarNomeMorador(morador: Morador) {
    return morador.primeiroNome + ' ' + morador.sobrenome
  }
  function obterSaudacao(morador: null | Morador) {
    if(morador) {
      return <span>Olá, {formatarNomeMorador(morador)}</span>
    }
    return <span>Olá, Estranho!</span>
  }

  const morador: Morador = {
    primeiroNome: 'Lucas',
    sobrenome: 'Rodrigues'
  };

  return (
    <div id="principal" className="flex items-center justify-center min-h-screen bg-black">
      <div id="componente-azul" className="card-azul">
        <h1 id="name" className="text-2xl font-bold text-center">
          {obterSaudacao(morador)}
        </h1>
      </div>
    </div>
  )

}