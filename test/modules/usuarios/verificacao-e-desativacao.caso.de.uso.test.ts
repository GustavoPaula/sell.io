import { describe, expect, test, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import DesativarUsuarioCasoDeUso from '@/modules/usuarios/usecase/desativar-usuario.caso.de.uso'
import SolicitarVerificacaoEmailCasoDeUso from '@/modules/usuarios/usecase/solicitar-verificacao-email.caso.de.uso'
import VerificarEmailCasoDeUso from '@/modules/usuarios/usecase/verificar-email.caso.de.uso'
import AutenticacaoUsuarioCasoDeUso from '@/modules/usuarios/usecase/autenticacao-usuario.caso.de.uso'
import Erros from '@/modules/error/constants-erros'

describe('DesativarUsuarioCasoDeUso', () => {
    const usuario = Usuario.criar({ nomeCompleto: 'Maria Silva', email: 'maria@example.com', permissao: 'MEMBRO' })

    function preparar() {
        const repo = {
            buscarPorId: vi.fn().mockResolvedValue(usuario),
            buscarPorEmail: vi.fn(),
            salvar: vi.fn(),
            alterarProps: vi.fn(),
            desativarUsuario: vi.fn().mockResolvedValue(undefined),
            criarToken: vi.fn(),
            confirmarToken: vi.fn()
        }
        return { repo, caso: new DesativarUsuarioCasoDeUso(repo) }
    }

    test('Deve registrar a data ao desativar um usuário ativo', async () => {
        const { repo, caso } = preparar()
        const antes = Date.now()
        await caso.executar({ idUsuario: usuario.id.valor })
        const depois = Date.now()

        expect(repo.buscarPorId).toHaveBeenCalledExactlyOnceWith(usuario.id.valor)
        expect(repo.desativarUsuario).toHaveBeenCalledExactlyOnceWith(usuario.id.valor, expect.any(Date))
        const data = repo.desativarUsuario.mock.calls[0]![1] as Date
        expect(data.getTime()).toBeGreaterThanOrEqual(antes)
        expect(data.getTime()).toBeLessThanOrEqual(depois)
    })

    test('Deve preservar a data do usuário já desativado', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(usuario.clone({ deletadoEm: new Date('2026-01-01') }))

        await expect(caso.executar({ idUsuario: usuario.id.valor })).resolves.toBeUndefined()
        expect(repo.desativarUsuario).not.toHaveBeenCalled()
    })

    test('Deve rejeitar a desativação de usuário inexistente', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(null)

        await expect(caso.executar({ idUsuario: usuario.id.valor })).rejects.toMatchObject({ codigo: Erros.USUARIO_NAO_ENCONTRADO })
        expect(repo.desativarUsuario).not.toHaveBeenCalled()
    })

    test('Deve impedir a desativação do administrador de sistema', async () => {
        const { repo, caso } = preparar()
        repo.buscarPorId.mockResolvedValue(usuario.clone({ permissao: 'ADMIN', administradorSistema: true }))

        await expect(caso.executar({ idUsuario: usuario.id.valor })).rejects.toMatchObject({ codigo: Erros.ADMINISTRADOR_SISTEMA_PROTEGIDO })
        expect(repo.desativarUsuario).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao consultar o usuário', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha na consulta')
        repo.buscarPorId.mockRejectedValue(erro)

        await expect(caso.executar({ idUsuario: usuario.id.valor })).rejects.toBe(erro)
        expect(repo.desativarUsuario).not.toHaveBeenCalled()
    })

    test('Deve propagar falha ao registrar a desativação', async () => {
        const { repo, caso } = preparar()
        const erro = new Error('Falha ao desativar')
        repo.desativarUsuario.mockRejectedValue(erro)

        await expect(caso.executar({ idUsuario: usuario.id.valor })).rejects.toBe(erro)
    })
})

describe('Verificação de e-mail', () => {
    const usuario = Usuario.criar({ nomeCompleto: 'Maria Silva', email: 'maria@example.com', permissao: 'MEMBRO' })
    function preparar() {
        const usuarios = { buscarPorEmail: vi.fn().mockResolvedValue(usuario), buscarPorId: vi.fn(), salvar: vi.fn(), alterarProps: vi.fn(), criarToken: vi.fn().mockResolvedValue(true), confirmarToken: vi.fn().mockResolvedValue(true) }
        const envio = { enviar: vi.fn().mockResolvedValue(undefined) }
        return { usuarios, verificacoes: usuarios, envio, solicitar: new SolicitarVerificacaoEmailCasoDeUso(usuarios, envio), verificar: new VerificarEmailCasoDeUso(usuarios) }
    }

    test('Deve criar hash do token, definir validade de 30 minutos e enviar o token', async () => {
        const { verificacoes, envio, solicitar } = preparar()
        const antes = Date.now()
        await solicitar.executar({ email: usuario.email })
        const depois = Date.now()
        const [email, token] = envio.enviar.mock.calls[0]!
        const dados = verificacoes.criarToken.mock.calls[0]![0]
        expect(email).toBe(usuario.email)
        expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
        expect(dados).toMatchObject({ usuarioId: usuario.id.valor, email, tokenHash: createHash('sha256').update(token).digest('hex') })
        expect(dados.expiraEm.getTime()).toBeGreaterThanOrEqual(antes + 1800000)
        expect(dados.expiraEm.getTime()).toBeLessThanOrEqual(depois + 1800000)
    })

    test.each(['inexistente', 'desativado', 'verificado'])(
        'Deve responder sem enviar token para usuário %s', async situacao => {
            const { usuarios, verificacoes, envio, solicitar } = preparar()
            usuarios.buscarPorEmail.mockResolvedValue(situacao === 'inexistente' ? null : usuario.clone(situacao === 'desativado' ? { deletadoEm: new Date() } : { emailVerificadoEm: new Date() }))
            await expect(solicitar.executar({ email: usuario.email })).resolves.toBeUndefined()
            expect(verificacoes.criarToken).not.toHaveBeenCalled()
            expect(envio.enviar).not.toHaveBeenCalled()
        }
    )

    test('Deve evitar envio quando o estado do usuário mudar antes de persistir o token', async () => {
        const { verificacoes, envio, solicitar } = preparar()
        verificacoes.criarToken.mockResolvedValue(false)
        await solicitar.executar({ email: usuario.email })
        expect(envio.enviar).not.toHaveBeenCalled()
    })

    test('Deve confirmar o hash do token por operação atômica', async () => {
        const { verificacoes, verificar } = preparar()
        const token = 'a'.repeat(43)
        await verificar.executar({ token })
        expect(verificacoes.confirmarToken).toHaveBeenCalledWith(createHash('sha256').update(token).digest('hex'))
    })

    test('Deve rejeitar token inválido ou expirado sem marcar o e-mail', async () => {
        const { verificacoes, verificar } = preparar()
        await expect(verificar.executar({ token: 'curto' })).rejects.toMatchObject({ codigo: Erros.TOKEN_VERIFICACAO_INVALIDO })
        expect(verificacoes.confirmarToken).not.toHaveBeenCalled()
        verificacoes.confirmarToken.mockResolvedValue(false)
        await expect(verificar.executar({ token: 'a'.repeat(43) })).rejects.toMatchObject({ codigo: Erros.TOKEN_VERIFICACAO_INVALIDO })
    })
})

describe('Regras de acesso e estado do usuário', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const usuario = Usuario.criar({ nomeCompleto: 'Maria Silva', email: 'maria@example.com', permissao: 'ADMIN', senha: hash })
    function autenticar(alvo: Usuario) {
        const repo = { buscarPorEmail: vi.fn().mockResolvedValue(alvo), buscarPorId: vi.fn(), salvar: vi.fn(), criarToken: vi.fn(), confirmarToken: vi.fn(), desativarUsuario: vi.fn(), alterarProps: vi.fn() }
        const crypto = { comparar: vi.fn().mockResolvedValue(true), criptografar: vi.fn() }
        return new AutenticacaoUsuarioCasoDeUso(repo, crypto).executar({ email: alvo.email, senha: 'senha123' })
    }
    test('Deve retornar o usuário com o estado de verificação pendente', async () => {
        const resultado = await autenticar(usuario)
        expect(resultado.emailVerificadoEm).toBeNull()
        expect(resultado.senha).toBeUndefined()
    })
    test('Deve preservar a identificação do administrador de sistema sem e-mail verificado', async () => {
        const resultado = await autenticar(usuario.clone({ administradorSistema: true }))
        expect(resultado.administradorSistema).toBe(true)
        expect(resultado.emailVerificadoEm).toBeNull()
        expect(resultado.senha).toBeUndefined()
    })
    test('Deve impedir autenticação de usuário desativado mesmo com e-mail verificado', async () => {
        await expect(autenticar(usuario.clone({ deletadoEm: new Date(), emailVerificadoEm: new Date() }))).rejects.toMatchObject({ codigo: Erros.CREDENCIAIS_INVALIDAS })
    })
    test('Deve preservar as datas ao clonar e remover a senha', () => {
        const data = new Date('2026-01-01')
        const copia = usuario.clone({ deletadoEm: data, emailVerificadoEm: data }).semSenha()
        expect(copia.deletadoEm).toEqual(data)
        expect(copia.emailVerificadoEm).toEqual(data)
    })
    test('Deve rejeitar administrador de sistema sem permissão ADMIN', () => {
        expect(() => usuario.clone({ administradorSistema: true, permissao: 'MEMBRO' })).toThrow(Erros.ADMINISTRADOR_SISTEMA_PERMISSAO_INVALIDA)
    })
})
