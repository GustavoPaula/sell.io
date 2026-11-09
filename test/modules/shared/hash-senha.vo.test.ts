import { describe, expect, test } from 'vitest'
import { HashSenha } from '@/modules/shared/hash-senha.vo'
import Erros from '@/modules/error/constants-erros'

describe('HashSenha', () => {
    const dadosBcrypt = `${'a'.repeat(21)}.${'a'.repeat(30)}.`

    test('Deve criar um hash de senha bcrypt válido', () => {
        const valor = `$2b$12$${dadosBcrypt}`
        expect(HashSenha.criar(valor).valor).toBe(valor)
    })

    test('Deve aceitar as versões bcrypt 2a, 2b e 2y', () => {
        expect(HashSenha.criar(`$2a$12$${dadosBcrypt}`).valor).toBe(`$2a$12$${dadosBcrypt}`)
        expect(HashSenha.criar(`$2b$12$${dadosBcrypt}`).valor).toBe(`$2b$12$${dadosBcrypt}`)
        expect(HashSenha.criar(`$2y$12$${dadosBcrypt}`).valor).toBe(`$2y$12$${dadosBcrypt}`)
    })

    test('Deve comparar hashes pelo valor', () => {
        const valor = `$2b$12$${dadosBcrypt}`
        expect(HashSenha.criar(valor).igual(HashSenha.criar(valor))).toBe(true)
    })

    test('Deve aceitar os custos bcrypt 04 e 31', () => {
        expect(HashSenha.criar(`$2b$04$${dadosBcrypt}`).valor).toBe(`$2b$04$${dadosBcrypt}`)
        expect(HashSenha.criar(`$2b$31$${dadosBcrypt}`).valor).toBe(`$2b$31$${dadosBcrypt}`)
    })

    test('Deve rejeitar um hash vazio', () => {
        expect(() => HashSenha.criar('')).toThrowError(Erros.SENHA_HASH_INVALIDA)
        expect(() => HashSenha.criar('   ')).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })

    test('Deve rejeitar uma senha em texto puro', () => {
        expect(() => HashSenha.criar('senha-em-texto-puro')).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })

    test('Deve rejeitar custos bcrypt fora do intervalo permitido', () => {
        expect(() => HashSenha.criar(`$2b$03$${dadosBcrypt}`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
        expect(() => HashSenha.criar(`$2b$32$${dadosBcrypt}`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })

    test('Deve rejeitar uma versão bcrypt não suportada', () => {
        expect(() => HashSenha.criar(`$2x$12$${dadosBcrypt}`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })

    test('Deve rejeitar um hash com tamanho inválido', () => {
        expect(() => HashSenha.criar(`$2b$12$${'a'.repeat(52)}`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
        expect(() => HashSenha.criar(`$2b$12$${'a'.repeat(54)}`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })

    test('Deve rejeitar caracteres inválidos no hash', () => {
        expect(() => HashSenha.criar(`$2b$12$${'a'.repeat(52)}!`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
        expect(() => HashSenha.criar(`$2b$12$${dadosBcrypt}\n`)).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })
})
