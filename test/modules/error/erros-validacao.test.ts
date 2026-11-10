import { describe, expect, test } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import ErroValidacao from '@/modules/error/erro-validacao'

describe('ErroValidacao.executar', () => {
    test('Deve retornar os valores produzidos pelas validações bem-sucedidas', () => {
        expect(ErroValidacao.executar({ nome: () => 'Maria', idade: () => 20 }))
            .toEqual({ nome: 'Maria', idade: 20 })
    })

    test('Deve reunir erros de campos independentes', () => {
        expect(() => ErroValidacao.executar({
            nome: () => ErroValidacao.lancar(Erros.NOME_VAZIO),
            email: () => ErroValidacao.lancar(Erros.EMAIL_VAZIO)
        })).toThrow(expect.objectContaining({
            codigo: Erros.NOME_VAZIO,
            erros: [
                { campo: 'nome', codigo: Erros.NOME_VAZIO },
                { campo: 'email', codigo: Erros.EMAIL_VAZIO }
            ]
        }))
    })

    test('Deve propagar erros inesperados sem tratá-los como validação', () => {
        const inesperado = new Error('Falha inesperada')
        expect(() => ErroValidacao.executar({ campo: () => { throw inesperado } }))
            .toThrow(inesperado)
    })

    test('Deve preservar os campos de erros agrupados em validações aninhadas', () => {
        expect(() => ErroValidacao.executar({
            endereco: () => ErroValidacao.executar({
                cep: () => ErroValidacao.lancar(Erros.ID_INVALIDO)
            })
        })).toThrow(expect.objectContaining({
            erros: [{ campo: 'endereco.cep', codigo: Erros.ID_INVALIDO }]
        }))
    })
})
