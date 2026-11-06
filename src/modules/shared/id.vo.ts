import { ObjetoValor } from '@/modules/shared/objeto-valor'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'
import { v4 as uuidv4, validate as isUuid } from 'uuid'

export class Id extends ObjetoValor<Id, string> {
    private constructor(valor: string) {
        super(valor)
    }

    public static criar(id?: string): Id {
        const valor = id?.trim().toLowerCase() ?? uuidv4()
        this.validar(valor)
        return new Id(valor)
    }

    private static validar(id: string): void {
        if (!isUuid(id)) {
            ErroValidacao.lancar(Erros.ID_INVALIDO)
        }
    }
}
