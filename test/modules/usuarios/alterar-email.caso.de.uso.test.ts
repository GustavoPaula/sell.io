import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import AlterarEmailCasoDeUso from '@/modules/usuarios/usecase/alterar-email.caso.de.uso'

describe('AlterarEmailCasoDeUso', () => {
    const usuario = Usuario.criar({
        nomeCompleto: 'Maria Silva', email: 'maria@example.com', permissao: 'MEMBRO'
    })

    function preparar() {
        const repo = {
            buscarPorId: vi.fn().mockResolvedValue(usuario),
            buscarPorEmail: vi.fn().mockResolvedValue(null),
            salvar: vi.fn(),
            alterarProps: vi.fn().mockResolvedValue(undefined)
        }
        return { repo, caso: new AlterarEmailCasoDeUso(repo) }
    }

    test('Deve alterar somente o e-mail do usuário logado', async () => {
        const { repo, caso } = preparar()
        const resultado = await caso.executar({ novoEmail: 'novo@example.com' }, usuario.id.valor)

        expect(resultado).toBeUndefined()
        expect(repo.buscarPorId).toHaveBeenCalledExactlyOnceWith(usuario.id.valor)
        expect(repo.buscarPorEmail).toHaveBeenCalledExactlyOnceWith('novo@example.com')
        expect(repo.alterarProps).toHaveBeenCalledExactlyOnceWith(usuario.id.valor, { email: 'novo@example.com' })
        expect(repo.salvar).not.toHaveBeenCalled()
        expect(usuario.email).toBe('maria@example.com')
    })

    test('Deve rejeitar e-mail cadastrado para outro usuário', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorEmail.mockResolvedValue(Usuario.criar({
            nomeCompleto: 'Mariana Silva', email: 'ana@example.com', permissao: 'MEMBRO'
        }))

        await expect(caso.executar({ novoEmail: 'ana@example.com' }, usuario.id.valor))
            .rejects.toMatchObject({ codigo: Erros.EMAIL_JA_CADASTRADO })
        expect(repo.buscarPorEmail).toHaveBeenCalledExactlyOnceWith('ana@example.com')
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve permitir manter o e-mail do próprio usuário', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorEmail.mockResolvedValue(usuario)

        await expect(caso.executar({ novoEmail: usuario.email }, usuario.id.valor)).resolves.toBeUndefined()
        expect(repo.alterarProps).toHaveBeenCalledExactlyOnceWith(usuario.id.valor, { email: usuario.email })
    })

    test('Deve propagar falha ao consultar o e-mail', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha na consulta do e-mail')
        repo.buscarPorEmail.mockRejectedValue(erro)

        await expect(caso.executar({ novoEmail: 'novo@example.com' }, usuario.id.valor)).rejects.toBe(erro)
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve rejeitar a alteração quando o usuário logado não for encontrado', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(null)
        await expect(caso.executar({ novoEmail: 'novo@example.com' }, usuario.id.valor))
            .rejects.toMatchObject({ codigo: Erros.USUARIO_NAO_ENCONTRADO })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve rejeitar um e-mail inválido sem alterar o usuário', async () => {
        const { repo, caso } = preparar()
        await expect(caso.executar({ novoEmail: 'invalido' }, usuario.id.valor))
            .rejects.toMatchObject({ erros: [{ campo: 'email', codigo: Erros.EMAIL_INVALIDO }] })
        expect(repo.buscarPorEmail).not.toHaveBeenCalled()
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao consultar o usuário', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha na consulta')
        repo.buscarPorId.mockRejectedValue(erro)
        await expect(caso.executar({ novoEmail: 'novo@example.com' }, usuario.id.valor)).rejects.toBe(erro)
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao alterar o usuário', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha ao salvar')
        repo.alterarProps.mockRejectedValue(erro)
        await expect(caso.executar({ novoEmail: 'novo@example.com' }, usuario.id.valor)).rejects.toBe(erro)
    })
})
