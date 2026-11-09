import { describe, expect, test } from 'vitest'
import { validate } from 'uuid'
import { Id } from '@/modules/shared/id.vo'
import Erros from '@/modules/error/constants-erros'

describe('Id', () => {
    const valor = '550e8400-e29b-41d4-a716-446655440000'

    test('Deve gerar um UUID quando nenhum valor é fornecido', () => {
        expect(validate(Id.criar().valor)).toBe(true)
    })

    test('Deve normalizar e expôr o valor informado', () => {
        const id = Id.criar(`  ${valor.toUpperCase()}  `)
        expect(id.valor).toBe(valor)
    })

    test('Deve comparar identificadores pelo valor e pela classe', () => {
        const id = Id.criar(valor)
        expect(id.igual(Id.criar(valor))).toBe(true)
        expect(id.igual(Id.criar('550e8400-e29b-41d4-a716-446655440001'))).toBe(
            false
        )
        expect(id.igual({ valor } as Id)).toBe(false)
        expect(id.diferente(Id.criar(valor))).toBe(false)
        expect(id.diferente(Id.criar('550e8400-e29b-41d4-a716-446655440001'))).toBe(true)
        expect(id.paraString()).toBe(valor)
    })

    test('Deve rejeitar um identificador inválido ou vazio', () => {
        expect(() => Id.criar('inválido')).toThrowError(Erros.ID_INVALIDO)
        expect(() => Id.criar('')).toThrowError(Erros.ID_INVALIDO)
        expect(() => Id.criar('   ')).toThrowError(Erros.ID_INVALIDO)
    })
})
