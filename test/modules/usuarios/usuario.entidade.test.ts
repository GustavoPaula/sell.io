import { describe, expect, test } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import { Usuario, type UsuarioProps } from '@/modules/usuarios/model/usuario.entidade'

describe('Usuario', () => {
    const hash = `$2b$12$${'a'.repeat(21)}.${'a'.repeat(30)}.`
    const dados: UsuarioProps = {
        nomeCompleto: 'Maria Silva',
        email: 'maria@example.com',
        senha: hash,
        permissao: 'MEMBRO'
    }

    test('Deve criar um usuário com os valores validados e acesso aos objetos de valor', () => {
        const usuario = new Usuario(dados)

        expect(usuario.$nomeCompleto.valor).toBe(dados.nomeCompleto)
        expect(usuario.$email.valor).toBe(dados.email)
        expect(usuario.$senha?.valor).toBe(hash)
        expect(usuario.$permissao.valor).toBe(dados.permissao)
    })

    test('Deve rejeitar valores inválidos para os dados obrigatórios', () => {
        expect(() => new Usuario({ ...dados, nomeCompleto: '' })).toThrowError(Erros.NOME_VAZIO)
        expect(() => new Usuario({ ...dados, email: '' })).toThrowError(Erros.EMAIL_VAZIO)
        expect(() => new Usuario({ ...dados, permissao: '' })).toThrowError(Erros.PERMISSAO_USUARIO_VAZIA)
    })

    test('Deve rejeitar senha informada que não seja um hash bcrypt válido', () => {
        expect(() => new Usuario({ ...dados, senha: '' })).toThrowError(Erros.SENHA_HASH_INVALIDA)
        expect(() => new Usuario({ ...dados, senha: 'senha em texto puro' })).toThrowError(Erros.SENHA_HASH_INVALIDA)
    })

    test('Deve permitir usuário sem senha', () => {
        const usuario = new Usuario({ ...dados, senha: undefined })
        expect(usuario.senha).toBeUndefined()
        expect(usuario.$senha).toBeUndefined()
    })

    test('Deve clonar com alterações parciais preservando a identidade e os demais valores', () => {
        const usuario = new Usuario(dados)
        const clone = usuario.clone({ email: 'nova@example.com' })
        expect(clone.id.valor).toBe(usuario.id.valor)
        expect(clone.email).toBe('nova@example.com')
        expect(clone.senha).toBe(hash)
        expect(usuario.email).toBe(dados.email)
    })

    test('Deve remover o hash da cópia sem alterar o usuário original', () => {
        const usuario = new Usuario(dados)
        const copia = usuario.semSenha()
        expect(copia.id.valor).toBe(usuario.id.valor)
        expect(copia.senha).toBeUndefined()
        expect(copia.$senha).toBeUndefined()
        expect(usuario.senha).toBe(hash)
    })

    test('Deve retornar os dados públicos com ID em texto ao chamar paraJSON', () => {
        const usuario = new Usuario(dados)
        expect(usuario.paraJSON()).toEqual({
            id: usuario.id.valor,
            nomeCompleto: dados.nomeCompleto,
            email: dados.email,
            permissao: dados.permissao
        })
    })

    test('Deve omitir o hash e as propriedades internas na serialização e no espalhamento', () => {
        const usuario = new Usuario(dados)
        expect(JSON.parse(JSON.stringify(usuario))).toEqual({
            id: { valor: usuario.id.valor },
            nomeCompleto: dados.nomeCompleto,
            email: dados.email,
            permissao: dados.permissao
        })
        expect(JSON.stringify({ ...usuario })).not.toContain(hash)
        expect(JSON.stringify(usuario.semSenha())).not.toContain(hash)
    })
})
