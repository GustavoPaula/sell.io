import { ValueObject } from '@/modules/shared/value-object'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'
import { v4 as uuidv4, validate as isUuid } from 'uuid'

export class Id implements ValueObject<Id, string> {
    private readonly _valor: string

    private constructor(valor: string) {
        this._valor = valor
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

    public get valor(): string {
        return this._valor
    }

    public igual(outro: Id): boolean {
        return this._valor === outro._valor
    }

    public diferente(outro: Id): boolean {
        return this._valor !== outro._valor
    }
}
