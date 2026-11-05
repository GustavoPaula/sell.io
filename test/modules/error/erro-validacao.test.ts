import { describe, expect, test } from 'vitest'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

describe('ErroValidacao', () => {
    test('Deve usar o código desconhecido e extras vazios por padrão', () => {
        const erro = new ErroValidacao()
        expect(erro).toBeInstanceOf(Error)
        expect(erro.codigo).toBe(Erros.DESCONHECIDO)
        expect(erro.message).toBe(Erros.DESCONHECIDO)
        expect(erro.valor).toBeUndefined()
        expect(erro.extras).toEqual({})
    })

    test('Deve preservar o código, valor e extras informados', () => {
        const extras = { campo: 'id' }
        const erro = ErroValidacao.novo(Erros.ID_INVALIDO, 'inválido', extras)
        expect(erro.codigo).toBe(Erros.ID_INVALIDO)
        expect(erro.message).toBe(Erros.ID_INVALIDO)
        expect(erro.valor).toBe('inválido')
        expect(erro.extras).toBe(extras)
    })

    test('Deve aceitar argumentos omitidos', () => {
        expect(ErroValidacao.novo().codigo).toBe(Erros.DESCONHECIDO)
    })

    test('Deve propagar um erro com os dados informados', () => {
        const extras = { campo: 'id' }
        expect(() =>
            ErroValidacao.lancar(Erros.ID_INVALIDO, 'x', extras)
        ).toThrow(
            expect.objectContaining({
                codigo: Erros.ID_INVALIDO,
                valor: 'x',
                extras
            })
        )
    })
})
