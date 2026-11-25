import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import AlterarPermissaoUsuarioCasoDeUso from '@/modules/usuarios/usecase/alterar-permissao-usuario.caso.de.uso'

describe('AlterarPermissaoUsuarioCasoDeUso', () => {
    const usuario = Usuario.criar({
        nomeCompleto: 'Maria Silva',
        email: 'maria@example.com',
        permissao: 'MEMBRO'
    })

    function preparar(alvo: Usuario = usuario) {
        const repo = {
            buscarPorId: vi.fn().mockResolvedValue(alvo),
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
            alterarProps: vi.fn().mockResolvedValue(undefined),
            desativarUsuario: vi.fn(),
            criarToken: vi.fn(),
            confirmarToken: vi.fn()
        }
        return { repo, caso: new AlterarPermissaoUsuarioCasoDeUso(repo) }
    }

    test.each([
        { anterior: 'MEMBRO', nova: 'ADMIN' },
        { anterior: 'ADMIN', nova: 'MEMBRO' }
    ])('Deve alterar a permissão de $anterior para $nova em usuário ativo', async ({ anterior, nova }) => {
        const alvo = usuario.clone({ permissao: anterior })
        const { repo, caso } = preparar(alvo)

        await expect(caso.executar({ idUsuario: alvo.id.valor, novaPermissao: nova })).resolves.toBeUndefined()
        expect(repo.buscarPorId).toHaveBeenCalledExactlyOnceWith(alvo.id.valor)
        expect(repo.alterarProps).toHaveBeenCalledExactlyOnceWith(alvo.id.valor, { permissao: nova })
        expect(alvo.permissao).toBe(anterior)
    })

    test('Deve rejeitar alteração quando o usuário não existir', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(null)

        await expect(caso.executar({ idUsuario: usuario.id.valor, novaPermissao: 'ADMIN' }))
            .rejects.toMatchObject({ codigo: Erros.USUARIO_NAO_ENCONTRADO })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve rejeitar alteração de permissão de usuário desativado', async () => {
        const { repo, caso } = preparar(usuario.clone({ deletadoEm: new Date('2026-01-01') }))

        await expect(caso.executar({ idUsuario: usuario.id.valor, novaPermissao: 'ADMIN' }))
            .rejects.toMatchObject({ codigo: Erros.USUARIO_DESATIVADO })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test.each([
        { permissao: '', codigo: Erros.PERMISSAO_USUARIO_VAZIA },
        { permissao: 'OUTRA', codigo: Erros.PERMISSAO_USUARIO_INVALIDA }
    ])('Deve rejeitar a permissão inválida $permissao', async ({ permissao, codigo }) => {
        const { repo, caso } = preparar()

        await expect(caso.executar({ idUsuario: usuario.id.valor, novaPermissao: permissao }))
            .rejects.toMatchObject({ codigo })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve impedir a remoção da permissão ADMIN do administrador de sistema', async () => {
        const alvo = usuario.clone({ permissao: 'ADMIN', administradorSistema: true })
        const { repo, caso } = preparar(alvo)

        await expect(caso.executar({ idUsuario: alvo.id.valor, novaPermissao: 'MEMBRO' }))
            .rejects.toMatchObject({ codigo: Erros.ADMINISTRADOR_SISTEMA_PERMISSAO_INVALIDA })
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao buscar o usuário', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha na busca')
        repo.buscarPorId.mockRejectedValue(erro)

        await expect(caso.executar({ idUsuario: usuario.id.valor, novaPermissao: 'ADMIN' })).rejects.toBe(erro)
        expect(repo.alterarProps).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao salvar a nova permissão', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha ao salvar')
        repo.alterarProps.mockRejectedValue(erro)

        await expect(caso.executar({ idUsuario: usuario.id.valor, novaPermissao: 'ADMIN' })).rejects.toBe(erro)
    })
})
