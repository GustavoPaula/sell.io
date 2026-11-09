import { ObjetoValor } from '@/modules/shared/objeto-valor'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export class Email extends ObjetoValor<Email, string> {
    private constructor(valor: string) {
        super(valor)
    }

    public static criar(email: string): Email {
        this.validar(email)
        return new Email(email)
    }

    public parteLocal(): string {
        return this.valor.slice(0, this.valor.indexOf('@'))
    }

    public dominio(): string {
        return this.valor.slice(this.valor.indexOf('@') + 1)
    }

    private static validar(email: string): void {
        const formatoEmail = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![\s\S])/

        if (!email.trim()) ErroValidacao.lancar(Erros.EMAIL_VAZIO)
        if (email.length > 120) ErroValidacao.lancar(Erros.EMAIL_GRANDE)
        if (!formatoEmail.test(email)) ErroValidacao.lancar(Erros.EMAIL_INVALIDO)
        if (email.indexOf('@') > 64) ErroValidacao.lancar(Erros.EMAIL_INVALIDO)
    }
}
