import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import ErroValidacao from '@/modules/error/erro-validacao'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import BuscarPerfilUsuarioCasoDeUso from '@/modules/usuarios/usecase/buscar-perfil-usuario.caso.de.uso'

describe('BuscarPerfilUsuarioCasoDeUso', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const usuario = Usuario.criar({
        nomeCompleto: 'Maria Silva', email: 'maria@example.com', senha: hash, permissao: 'MEMBRO'
    })

    function preparar() {
        const repo = { buscarPorId: vi.fn().mockResolvedValue(usuario), buscarPorEmail: vi.fn(), salvar: vi.fn() }
        return { repo, caso: new BuscarPerfilUsuarioCasoDeUso(repo) }
    }

    test('Deve buscar o usuário pelo ID informado e retornar seu perfil sem senha', async () => {
        const { repo, caso } = preparar()
        const resultado = await caso.executar(usuario.id.valor)

        expect(repo.buscarPorId).toHaveBeenCalledExactlyOnceWith(usuario.id.valor)
        expect(resultado).toBeInstanceOf(Usuario)
        expect(resultado.paraJSON()).toEqual(usuario.paraJSON())
        expect(resultado.senha).toBeUndefined()
        expect(usuario.senha).toBe(hash)
    })

    test('Deve lançar erro quando o usuário não for encontrado', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(null)
        const resultado = caso.executar(usuario.id.valor)
        await expect(resultado).rejects.toBeInstanceOf(ErroValidacao)
        await expect(resultado).rejects.toMatchObject({ codigo: Erros.USUARIO_NAO_ENCONTRADO })
    })

    test('Deve propagar falhas da consulta ao repositório', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha no repositório')
        repo.buscarPorId.mockRejectedValue(erro)
        await expect(caso.executar(usuario.id.valor)).rejects.toBe(erro)
    })
})
