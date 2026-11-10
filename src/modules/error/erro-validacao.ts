import Erros from '@/modules/error/constants-erros'

export type ErroDeCampo = {
    campo?: string
    codigo: string
}

type Validacoes = Record<string, () => unknown>
type Resultados<T extends Validacoes> = {
    [Campo in keyof T]: ReturnType<T[Campo]>
}

export interface ErroValidacaoProps {
    codigo?: string | undefined
    valor?: any
    extras?: object
    erros?: ErroDeCampo[]
}

export default class ErroValidacao extends Error {
    readonly codigo: string
    readonly valor?: any
    readonly extras: any
    readonly erros: ErroDeCampo[]

    constructor(readonly props?: ErroValidacaoProps) {
        super(props?.codigo ?? Erros.DESCONHECIDO)
        this.codigo = props?.codigo ?? Erros.DESCONHECIDO
        this.valor = props?.valor
        this.extras = props?.extras ?? {}
        this.erros = props?.erros ?? [{ codigo: this.codigo }]
    }

    static lancar(codigo: string, valor?: any, extras?: any): never {
        throw new ErroValidacao({ codigo, valor, extras })
    }

    static executar<T extends Validacoes>(validacoes: T): Resultados<T> {
        const erros: ErroDeCampo[] = []
        const resultados: Record<string, unknown> = {}

        for (const [campo, validar] of Object.entries(validacoes)) {
            try {
                resultados[campo] = validar()
            } catch (erro: unknown) {
                if (!(erro instanceof ErroValidacao)) throw erro
                for (const detalhe of erro.erros) {
                    erros.push({
                        campo: detalhe.campo ? `${campo}.${detalhe.campo}` : campo,
                        codigo: detalhe.codigo
                    })
                }
            }
        }

        if (erros.length > 0) {
            throw new ErroValidacao({ codigo: erros[0]!.codigo, erros })
        }
        return resultados as Resultados<T>
    }
}
