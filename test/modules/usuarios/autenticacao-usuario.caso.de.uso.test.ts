import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import ErroValidacao from '@/modules/error/erro-validacao'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import AutenticacaoUsuarioCasoDeUso from '@/modules/usuarios/usecase/autenticacao-usuario.caso.de.uso'

describe('AutenticacaoUsuarioCasoDeUso', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const dados = { email: 'maria@example.com', senha: 'senha123' }
    const usuario = Usuario.criar({
        nomeCompleto: 'Maria Silva', email: dados.email, senha: hash, permissao: 'MEMBRO'
    })

    function preparar() {
        const repo = { buscarPorEmail: vi.fn().mockResolvedValue(usuario), buscarPorId: vi.fn(), salvar: vi.fn() }
        const crypto = { comparar: vi.fn().mockResolvedValue(true), criptografar: vi.fn() }
        return { repo, crypto, caso: new AutenticacaoUsuarioCasoDeUso(repo, crypto) }
    }

    test('Deve retornar o usuário sem senha após comparar as credenciais', async () => {
        const { repo, crypto, caso } = preparar()
        const resultado = await caso.executar(dados)

        expect(repo.buscarPorEmail).toHaveBeenCalledWith(dados.email)
        expect(crypto.comparar).toHaveBeenCalledWith(dados.senha, hash)
        expect(resultado).toBeInstanceOf(Usuario)
        expect(resultado.paraJSON()).toEqual(usuario.paraJSON())
        expect(resultado.senha).toBeUndefined()
        expect(usuario.senha).toBe(hash)
        expect(repo.salvar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar credenciais quando o usuário não existir sem comparar senha', async () => {
        const { repo, crypto, caso } = preparar()
        repo.buscarPorEmail.mockResolvedValue(null)
        const resultado = caso.executar(dados)
        await expect(resultado).rejects.toBeInstanceOf(ErroValidacao)
        await expect(resultado).rejects.toMatchObject({ codigo: Erros.CREDENCIAIS_INVALIDAS })
        expect(crypto.comparar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar credenciais quando o usuário não tiver senha sem compará-la', async () => {
        const { repo, crypto, caso } = preparar()
        repo.buscarPorEmail.mockResolvedValue(usuario.semSenha())
        await expect(caso.executar(dados)).rejects.toMatchObject({ codigo: Erros.CREDENCIAIS_INVALIDAS })
        expect(crypto.comparar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar credenciais quando a senha estiver incorreta', async () => {
        const { crypto, caso } = preparar()
        crypto.comparar.mockResolvedValue(false)
        await expect(caso.executar(dados)).rejects.toMatchObject({ codigo: Erros.CREDENCIAIS_INVALIDAS })
        expect(crypto.comparar).toHaveBeenCalledWith(dados.senha, hash)
    })

    test('Deve propagar falhas do provedor de comparação', async () => {
        const { crypto, caso } = preparar()
        const erro = new Error('Falha no provedor')
        crypto.comparar.mockRejectedValue(erro)
        await expect(caso.executar(dados)).rejects.toBe(erro)
    })
})
