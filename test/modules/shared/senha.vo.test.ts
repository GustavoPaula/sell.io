import { describe, expect, test } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import { Senha } from '@/modules/shared/senha.vo'

describe('Senha', () => {
    test('Deve preservar uma senha válida e compará-la pelo valor', () => {
        const senha = Senha.criar('abc123!')
        expect(senha.valor).toBe('abc123!')
        expect(senha.igual(Senha.criar('abc123!'))).toBe(true)
        expect(senha.diferente(Senha.criar('outra123'))).toBe(true)
    })

    test('Deve rejeitar uma senha vazia', () => {
        expect(() => Senha.criar('')).toThrowError(Erros.SENHA_VAZIA)
    })

    test('Deve aceitar senha com 6 caracteres e rejeitar senha com 5', () => {
        expect(Senha.criar('123456').valor).toBe('123456')
        expect(() => Senha.criar('12345')).toThrowError(Erros.SENHA_PEQUENA)
    })

    test('Deve aceitar senha com 50 caracteres e rejeitar senha com 51', () => {
        expect(Senha.criar('a'.repeat(50)).valor).toBe('a'.repeat(50))
        expect(() => Senha.criar('a'.repeat(51))).toThrowError(Erros.SENHA_GRANDE)
    })

    test('Deve contar caracteres Unicode suplementares como um caractere cada', () => {
        expect(() => Senha.criar('😀'.repeat(5))).toThrowError(Erros.SENHA_PEQUENA)
        expect(Senha.criar('😀'.repeat(6)).valor).toBe('😀'.repeat(6))
        expect(() => Senha.criar('😀'.repeat(51))).toThrowError(Erros.SENHA_GRANDE)
    })

    test('Deve rejeitar espaços no início, no meio e no fim da senha', () => {
        for (const senha of [' abcdef', 'abc def', 'abcdef ', '      ']) {
            expect(() => Senha.criar(senha)).toThrowError(Erros.SENHA_CONTEM_ESPACOS)
        }
    })
})
