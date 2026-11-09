import { describe, expect, test } from 'vitest'
import { NomeCompleto } from '@/modules/shared/nome-completo.vo'
import Erros from '@/modules/error/constants-erros'

describe('NomeCompleto', () => {
    test('Deve criar um nome com letras acentuadas', () => {
        const nome = NomeCompleto.criar('João da Silva')
        expect(nome.valor).toBe('João da Silva')
    })

    test('Deve comparar nomes pelo valor', () => {
        expect(NomeCompleto.criar('João da Silva').igual(NomeCompleto.criar('João da Silva'))).toBe(true)
    })

    test('Deve rejeitar um nome vazio', () => {
        expect(() => NomeCompleto.criar('')).toThrowError(Erros.NOME_VAZIO)
        expect(() => NomeCompleto.criar('   ')).toThrowError(Erros.NOME_VAZIO)
    })

    test('Deve rejeitar caracteres especiais, números e tabulações', () => {
        expect(() => NomeCompleto.criar('João da Silva!')).toThrowError(Erros.NOME_CARACTERES_INVALIDOS)
        expect(() => NomeCompleto.criar('João da Silva1')).toThrowError(Erros.NOME_CARACTERES_INVALIDOS)
        expect(() => NomeCompleto.criar('João\tda Silva')).toThrowError(Erros.NOME_CARACTERES_INVALIDOS)
    })

    test('Deve rejeitar dois ou mais espaços consecutivos', () => {
        expect(() => NomeCompleto.criar('João  da Silva')).toThrowError(Erros.NOME_ESPACOS_CONSECUTIVOS)
        expect(() => NomeCompleto.criar('João   da Silva')).toThrowError(Erros.NOME_ESPACOS_CONSECUTIVOS)
    })

    test('Deve rejeitar um nome sem sobrenome', () => {
        expect(() => NomeCompleto.criar('Alexandre')).toThrowError(Erros.NOME_SEM_SOBRENOME)
    })

    test('Deve aceitar um nome com exatamente 10 caracteres', () => {
        expect(NomeCompleto.criar('Ana Silvaa').valor).toHaveLength(10)
    })

    test('Deve rejeitar um nome com menos de 10 caracteres', () => {
        expect(() => NomeCompleto.criar('Ana Lima')).toThrowError(Erros.NOME_PEQUENO)
    })

    test('Deve aceitar um nome com exatamente 100 caracteres', () => {
        expect(NomeCompleto.criar(`${'a'.repeat(98)} b`).valor).toHaveLength(100)
    })

    test('Deve rejeitar um nome com mais de 100 caracteres', () => {
        expect(() => NomeCompleto.criar(`${'a'.repeat(100)} b`)).toThrowError(Erros.NOME_GRANDE)
    })
})
