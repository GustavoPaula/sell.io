import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import AlterarNomeCompletoCasoDeUso from '@/modules/usuarios/usecase/alterar-nome-completo.caso.de.uso'

describe('AlterarNomeCompletoCasoDeUso', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const usuario = Usuario.criar({
        nomeCompleto: 'Maria Silva', email: 'maria@example.com', senha: hash, permissao: 'MEMBRO'
    })

    function preparar() {
        const repo = {
            buscarPorId: vi.fn().mockResolvedValue(usuario),
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
            alterarProps: vi.fn().mockResolvedValue(undefined)
        }
        return { repo, caso: new AlterarNomeCompletoCasoDeUso(repo) }
    }

    test('Deve alterar somente o nome do usuário logado', async () => {
        const { repo, caso } = preparar()
        const resultado = await caso.executar({ novoNomeCompleto: 'Maria Oliveira' }, usuario.id.valor)

        expect(resultado).toBeUndefined()
        expect(repo.buscarPorId).toHaveBeenCalledExactlyOnceWith(usuario.id.valor)
        expect(repo.alterarProps).toHaveBeenCalledExactlyOnceWith(usuario.id.valor, { nomeCompleto: 'Maria Oliveira' })
        expect(repo.salvar).not.toHaveBeenCalled()
        expect(usuario.nomeCompleto).toBe('Maria Silva')
    })

    test('Deve rejeitar a alteração quando o usuário logado não for encontrado', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(null)
        await expect(caso.executar({ novoNomeCompleto: 'Maria Oliveira' }, usuario.id.valor))
            .rejects.toMatchObject({ codigo: Erros.USUARIO_NAO_ENCONTRADO })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve rejeitar um nome vazio sem alterar o usuário', async () => {
        const { repo, caso } = preparar()
        await expect(caso.executar({ novoNomeCompleto: '' }, usuario.id.valor))
            .rejects.toMatchObject({ erros: [{ campo: 'nomeCompleto', codigo: Erros.NOME_VAZIO }] })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao consultar o usuário', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha na consulta')
        repo.buscarPorId.mockRejectedValue(erro)
        await expect(caso.executar({ novoNomeCompleto: 'Maria Oliveira' }, usuario.id.valor)).rejects.toBe(erro)
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao alterar o usuário', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha ao salvar')
        repo.alterarProps.mockRejectedValue(erro)
        await expect(caso.executar({ novoNomeCompleto: 'Maria Oliveira' }, usuario.id.valor)).rejects.toBe(erro)
    })
})
