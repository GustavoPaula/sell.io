import { ObjetoValor } from '@/modules/shared/objeto-valor'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export class NomeCompleto extends ObjetoValor<NomeCompleto, string> {
    private constructor(valor: string) {
        super(valor)
    }

    public static criar(nome: string): NomeCompleto {
        this.validar(nome)
        return new NomeCompleto(nome)
    }

    private static validar(nome: string): void {
        const caracteresPermitidos = /^[\p{L}\p{M} ]+$/u
        const espacosConsecutivos = / {2}/

        if (!nome.trim()) ErroValidacao.lancar(Erros.NOME_VAZIO)
        if (!caracteresPermitidos.test(nome)) {
            ErroValidacao.lancar(Erros.NOME_CARACTERES_INVALIDOS)
        }
        if (espacosConsecutivos.test(nome)) ErroValidacao.lancar(Erros.NOME_ESPACOS_CONSECUTIVOS)
        if (nome.trim().split(' ').length < 2) {
            ErroValidacao.lancar(Erros.NOME_SEM_SOBRENOME)
        }
        if (nome.length < 10) ErroValidacao.lancar(Erros.NOME_PEQUENO)
        if (nome.length > 100) ErroValidacao.lancar(Erros.NOME_GRANDE)
    }
}
