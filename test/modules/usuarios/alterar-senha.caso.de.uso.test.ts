import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import AlterarSenhaCasoDeUso from '@/modules/usuarios/usecase/alterar-senha.caso.de.uso'

describe('AlterarSenhaCasoDeUso', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const usuario = Usuario.criar({
        nomeCompleto: 'Maria Silva', email: 'maria@example.com', senha: hash, permissao: 'MEMBRO'
    })

    function preparar() {
        const repo = {
            buscarPorId: vi.fn().mockResolvedValue(usuario),
            buscarPorEmail: vi.fn(), salvar: vi.fn(),
            alterarProps: vi.fn().mockResolvedValue(undefined)
        }
        const crypto = { criptografar: vi.fn().mockResolvedValue(hash), comparar: vi.fn() }
        return { repo, crypto, caso: new AlterarSenhaCasoDeUso(repo, crypto) }
    }

    test('Deve alterar a senha do usuário logado usando o hash gerado', async () => {
        const { repo, crypto, caso } = preparar()
        const resultado = await caso.executar({ novaSenha: 'novaSenha123' }, usuario.id.valor)
        expect(resultado).toBeUndefined()
        expect(repo.buscarPorId).toHaveBeenCalledExactlyOnceWith(usuario.id.valor)
        expect(crypto.criptografar).toHaveBeenCalledExactlyOnceWith('novaSenha123')
        expect(repo.alterarProps).toHaveBeenCalledExactlyOnceWith(usuario.id.valor, { senha: hash })
        expect(repo.salvar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar a alteração quando o usuário não for encontrado', async () => {
        const { repo, crypto, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(null)
        await expect(caso.executar({ novaSenha: 'novaSenha123' }, usuario.id.valor))
            .rejects.toMatchObject({ codigo: Erros.USUARIO_NAO_ENCONTRADO })
        expect(crypto.criptografar).not.toHaveBeenCalled()
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve rejeitar senha inválida sem gerar hash ou alterar o usuário', async () => {
        const { repo, crypto, caso } = preparar()
        await expect(caso.executar({ novaSenha: '' }, usuario.id.valor)).rejects.toThrow(Erros.SENHA_VAZIA)
        expect(crypto.criptografar).not.toHaveBeenCalled()
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve rejeitar hash inválido sem alterar o usuário', async () => {
        const { repo, crypto, caso } = preparar()
        crypto.criptografar.mockResolvedValue('hash inválido')
        await expect(caso.executar({ novaSenha: 'novaSenha123' }, usuario.id.valor))
            .rejects.toMatchObject({ erros: [{ campo: 'senha', codigo: Erros.SENHA_HASH_INVALIDA }] })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha na consulta do usuário', async () => {
        const { repo, crypto, caso } = preparar()
        const erro = new Error('Falha na consulta')
        repo.buscarPorId.mockRejectedValue(erro)
        await expect(caso.executar({ novaSenha: 'novaSenha123' }, usuario.id.valor)).rejects.toBe(erro)
        expect(crypto.criptografar).not.toHaveBeenCalled()
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha na criptografia sem alterar o usuário', async () => {
        const { repo, crypto, caso } = preparar()
        const erro = new Error('Falha na criptografia')
        crypto.criptografar.mockRejectedValue(erro)
        await expect(caso.executar({ novaSenha: 'novaSenha123' }, usuario.id.valor)).rejects.toBe(erro)
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao persistir a senha', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha ao salvar')
        repo.alterarProps.mockRejectedValue(erro)
        await expect(caso.executar({ novaSenha: 'novaSenha123' }, usuario.id.valor)).rejects.toBe(erro)
    })
})
