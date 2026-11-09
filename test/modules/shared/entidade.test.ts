import { describe, expect, test } from 'vitest'
import { validate } from 'uuid'
import Entidade, { type EntidadeProps } from '@/modules/shared/entidade'
import ErroValidacao from '@/modules/error/erro-validacao'

interface PessoaProps extends EntidadeProps {
    nome: string
}

class Pessoa extends Entidade<Pessoa, PessoaProps> {
    readonly nome: string

    constructor(
        props: PessoaProps,
        readonly origem = 'padrão'
    ) {
        super(props)
        this.nome = props.nome
    }
}

describe('Entidade', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    const outroId = '550e8400-e29b-41d4-a716-446655440001'

    test('Deve gerar um ID e preserva as propriedades sem alterar o objeto original', () => {
        const props: PessoaProps = { nome: 'Ana' }
        const pessoa = new Pessoa(props)

        expect(validate(pessoa.id.valor)).toBe(true)
        expect(pessoa.clone({}).id.valor).toBe(pessoa.id.valor)
        expect(props).toEqual({ nome: 'Ana' })
    })

    test('Deve normalizar o ID informado e rejeitar IDs inválidos', () => {
        const pessoa = new Pessoa({ id: ` ${id.toUpperCase()} `, nome: 'Ana' })
        expect(pessoa.id.valor).toBe(id)
        expect(pessoa.clone({}).id.valor).toBe(id)
        expect(() => new Pessoa({ id: 'inválido', nome: 'Ana' })).toThrow(
            ErroValidacao
        )
    })

    test('Deve comparar entidades por seus IDs', () => {
        const pessoa = new Pessoa({ id, nome: 'Ana' })
        const mesmoId = new Pessoa({ id, nome: 'Bia' })
        const idDiferente = new Pessoa({ id: outroId, nome: 'Ana' })

        expect(pessoa.igual(mesmoId)).toBe(true)
        expect(pessoa.igual(idDiferente)).toBe(false)
        expect(pessoa.diferente(mesmoId)).toBe(false)
        expect(pessoa.diferente(idDiferente)).toBe(true)
    })

    test('Deve clonar a entidade, mescla propriedades e repassar argumentos ao construtor', () => {
        const pessoa = new Pessoa({ id, nome: 'Ana' })
        const clone = pessoa.clone({ nome: 'Bia' }, 'importada')

        expect(clone).toBeInstanceOf(Pessoa)
        expect(clone).not.toBe(pessoa)
        expect(clone.id.valor).toBe(id)
        expect(clone.nome).toBe('Bia')
        expect(clone.origem).toBe('importada')
        expect(pessoa.id.valor).toBe(id)
        expect(pessoa.nome).toBe('Ana')

        const comNovoId = pessoa.clone({ id: outroId, nome: 'Bia' })
        expect(comNovoId.id.valor).toBe(outroId)
        expect(comNovoId.diferente(pessoa)).toBe(true)
    })
})
