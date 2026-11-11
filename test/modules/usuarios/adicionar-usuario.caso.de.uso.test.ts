import { describe, expect, test, vi } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import ErroValidacao from '@/modules/error/erro-validacao'
import AdicionarUsuarioCasoDeUso, {
    type DadosEntrada
} from '@/modules/usuarios/usecase/adicionar-usuario.caso.de.uso'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'

describe('AdicionarUsuarioCasoDeUso', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const dados: DadosEntrada = {
        nomeCompleto: 'Maria Silva',
        email: 'maria@example.com',
        senha: 'senha123',
        permissao: 'MEMBRO'
    }

    function preparar() {
        const repo = {
            buscarPorEmail: vi.fn().mockResolvedValue(null),
            buscarPorId: vi.fn(),
            salvar: vi.fn().mockResolvedValue(undefined)
        }
        const crypto = {
            criptografar: vi.fn().mockResolvedValue(hash),
            comparar: vi.fn()
        }
        return {
            repo,
            crypto,
            caso: new AdicionarUsuarioCasoDeUso(repo, crypto)
        }
    }

    test('Deve persistir um usuário com a senha convertida em hash', async () => {
        const { repo, crypto, caso } = preparar()
        await caso.executar(dados)

        expect(repo.buscarPorEmail).toHaveBeenCalledWith(dados.email)
        expect(crypto.criptografar).toHaveBeenCalledWith(dados.senha)
        expect(repo.salvar).toHaveBeenCalledOnce()
        const usuario = repo.salvar.mock.calls[0]?.[0] as Usuario
        expect(usuario).toBeInstanceOf(Usuario)
        expect(usuario.email).toBe(dados.email)
        expect(usuario.senha).toBe(hash)
    })

    test('Deve rejeitar um e-mail já cadastrado sem gerar hash ou salvar', async () => {
        const { repo, crypto, caso } = preparar()
        repo.buscarPorEmail.mockResolvedValue(
            Usuario.criar({ ...dados, senha: hash })
        )

        const resultado = caso.executar(dados)
        await expect(resultado).rejects.toBeInstanceOf(ErroValidacao)
        await expect(resultado).rejects.toMatchObject({
            codigo: Erros.EMAIL_JA_CADASTRADO,
            erros: [{ codigo: Erros.EMAIL_JA_CADASTRADO }]
        })
        expect(crypto.criptografar).not.toHaveBeenCalled()
        expect(repo.salvar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar senha inválida antes de consultar o repositório ou gerar hash', async () => {
        const { repo, crypto, caso } = preparar()
        await expect(caso.executar({ ...dados, senha: '' })).rejects.toThrow(
            Erros.SENHA_VAZIA
        )
        expect(repo.buscarPorEmail).not.toHaveBeenCalled()
        expect(crypto.criptografar).not.toHaveBeenCalled()
        expect(repo.salvar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar dados inválidos da entidade sem salvar o usuário', async () => {
        const { repo, caso } = preparar()
        for (const entrada of [
            { ...dados, nomeCompleto: '' },
            { ...dados, email: '' },
            { ...dados, permissao: '' }
        ]) {
            await expect(caso.executar(entrada)).rejects.toThrow()
        }
        expect(repo.salvar).not.toHaveBeenCalled()
    })

    test('Deve aceitar uma senha com exatamente 72 bytes em UTF-8', async () => {
        const { crypto, caso } = preparar()
        const senha = '😀'.repeat(18)
        await caso.executar({ ...dados, senha })
        expect(crypto.criptografar).toHaveBeenCalledWith(senha)
    })

    test('Deve rejeitar senha com mais de 72 bytes antes de gerar hash', async () => {
        const { repo, crypto, caso } = preparar()
        await expect(
            caso.executar({ ...dados, senha: '😀'.repeat(19) })
        ).rejects.toThrow(Erros.SENHA_EXCEDE_LIMITE_BCRYPT)
        expect(repo.buscarPorEmail).not.toHaveBeenCalled()
        expect(crypto.criptografar).not.toHaveBeenCalled()
        expect(repo.salvar).not.toHaveBeenCalled()
    })

    test('Deve rejeitar hash inválido retornado pelo provedor sem salvar', async () => {
        const { repo, crypto, caso } = preparar()
        crypto.criptografar.mockResolvedValue('hash inválido')
        await expect(caso.executar(dados)).rejects.toMatchObject({
            erros: [{ campo: 'senha', codigo: Erros.SENHA_HASH_INVALIDA }]
        })
        expect(repo.salvar).not.toHaveBeenCalled()
    })
})
