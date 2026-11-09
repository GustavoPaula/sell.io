import Erros from '@/modules/error/constants-erros'
import ErroValidacao from '@/modules/error/erro-validacao'
import { ObjetoValor } from '@/modules/shared/objeto-valor'

export class Senha extends ObjetoValor<Senha, string> {
    private constructor(valor: string) {
        super(valor)
    }

    public static criar(senha: string): Senha {
        this.validar(senha)
        return new Senha(senha)
    }

    private static validar(senha: string): void {
        const tamanho = Array.from(senha).length

        if (tamanho === 0) ErroValidacao.lancar(Erros.SENHA_VAZIA)
        if (tamanho < 6) ErroValidacao.lancar(Erros.SENHA_PEQUENA)
        if (tamanho > 50) ErroValidacao.lancar(Erros.SENHA_GRANDE)
        if (senha.includes(' ')) ErroValidacao.lancar(Erros.SENHA_CONTEM_ESPACOS)
        if (Buffer.byteLength(senha, 'utf8') > 72) {
            ErroValidacao.lancar(Erros.SENHA_EXCEDE_LIMITE_BCRYPT)
        }
    }
}
