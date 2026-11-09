import { describe, expect, test } from 'vitest'
import { Email } from '@/modules/shared/email.vo'
import Erros from '@/modules/error/constants-erros'

describe('Email', () => {
    test('Deve criar um email válido', () => {
        const email = Email.criar('fulano@zmail.com')
        expect(email.valor).toBe('fulano@zmail.com')
    })

    test('Deve retornar a parte local do email', () => {
        const email = Email.criar('nome.sobrenome+loja@sub.exemplo.com.br')
        expect(email.parteLocal()).toBe('nome.sobrenome+loja')
    })

    test('Deve retornar o domínio do email', () => {
        const email = Email.criar('nome.sobrenome+loja@sub.exemplo.com.br')
        expect(email.dominio()).toBe('sub.exemplo.com.br')
    })

    test('Deve comparar emails pelo valor', () => {
        expect(Email.criar('fulano@zmail.com').igual(Email.criar('fulano@zmail.com'))).toBe(true)
    })

    test('Deve rejeitar um email vazio', () => {
        expect(() => Email.criar('')).toThrowError(Erros.EMAIL_VAZIO)
        expect(() => Email.criar('   ')).toThrowError(Erros.EMAIL_VAZIO)
    })

    test('Deve rejeitar um email com formato inválido', () => {
        expect(() => Email.criar('usuario@@exemplo.com')).toThrowError(Erros.EMAIL_INVALIDO)
        expect(() => Email.criar('usuario@exemplo')).toThrowError(Erros.EMAIL_INVALIDO)
        expect(() => Email.criar('usuario@-exemplo.com')).toThrowError(Erros.EMAIL_INVALIDO)
        expect(() => Email.criar('usuario@exemplo..com')).toThrowError(Erros.EMAIL_INVALIDO)
        expect(() => Email.criar('usuario nome@exemplo.com')).toThrowError(Erros.EMAIL_INVALIDO)
        expect(() => Email.criar('usuario@exemplo.com\n')).toThrowError(Erros.EMAIL_INVALIDO)
    })

    test('Deve rejeitar pontos consecutivos na parte local', () => {
        expect(() => Email.criar('usuario..nome@exemplo.com')).toThrowError(Erros.EMAIL_INVALIDO)
    })

    test('Deve rejeitar a parte local iniciada ou terminada com ponto', () => {
        expect(() => Email.criar('.usuario@exemplo.com')).toThrowError(Erros.EMAIL_INVALIDO)
        expect(() => Email.criar('usuario.@exemplo.com')).toThrowError(Erros.EMAIL_INVALIDO)
    })

    test('Deve rejeitar a parte local com mais de 64 caracteres', () => {
        expect(() => Email.criar(`${'a'.repeat(65)}@exemplo.com`)).toThrowError(Erros.EMAIL_INVALIDO)
    })

    test('Deve aceitar um email com exatamente 120 caracteres', () => {
        const valor = `${'a'.repeat(60)}@${'b'.repeat(55)}.com`
        expect(valor).toHaveLength(120)
        expect(Email.criar(valor).valor).toBe(valor)
    })

    test('Deve rejeitar um email com mais de 120 caracteres', () => {
        const valor = `${'a'.repeat(60)}@${'b'.repeat(56)}.com`
        expect(() => Email.criar(valor)).toThrowError(Erros.EMAIL_GRANDE)
    })
})
