import { describe, expect, test } from 'vitest'
import Erros from '@/modules/error/constants-erros'
import ErroValidacao from '@/modules/error/erro-validacao'
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
        const usuario = Usuario.criar(dados)

        expect(usuario.$nomeCompleto.valor).toBe(dados.nomeCompleto)
        expect(usuario.$email.valor).toBe(dados.email)
        expect(usuario.$senha?.valor).toBe(hash)
        expect(usuario.$permissao.valor).toBe(dados.permissao)
    })

    test('Deve reunir os erros de todos os atributos inválidos', () => {
        try {
            Usuario.criar({ nomeCompleto: '', email: '', senha: 'inválido', permissao: '' })
            expect.fail('Era esperado um erro de validação')
        } catch (erro: unknown) {
            expect(erro).toBeInstanceOf(ErroValidacao)
            if (!(erro instanceof ErroValidacao)) throw erro
            expect(erro.erros).toEqual([
                { campo: 'nomeCompleto', codigo: Erros.NOME_VAZIO },
                { campo: 'email', codigo: Erros.EMAIL_VAZIO },
                { campo: 'senha', codigo: Erros.SENHA_HASH_INVALIDA },
                { campo: 'permissao', codigo: Erros.PERMISSAO_USUARIO_VAZIA }
            ])
        }
    })

    test('Deve rejeitar uma alteração inválida ao clonar', () => {
        const usuario = Usuario.criar(dados)
        expect(() => usuario.clone({ email: '' })).toThrow(ErroValidacao)
    })

    test('Deve permitir usuário sem senha', () => {
        const usuario = Usuario.criar({ ...dados, senha: undefined })
        expect(usuario.senha).toBeUndefined()
        expect(usuario.$senha).toBeUndefined()
    })

    test('Deve clonar com alterações parciais preservando a identidade e os demais valores', () => {
        const usuario = Usuario.criar(dados)
        const clone = usuario.clone({ email: 'nova@example.com' })
        expect(clone.id.valor).toBe(usuario.id.valor)
        expect(clone.email).toBe('nova@example.com')
        expect(clone.senha).toBe(hash)
        expect(usuario.email).toBe(dados.email)
    })

    test('Deve remover o hash da cópia sem alterar o usuário original', () => {
        const usuario = Usuario.criar(dados)
        const copia = usuario.semSenha()
        expect(copia.id.valor).toBe(usuario.id.valor)
        expect(copia.senha).toBeUndefined()
        expect(copia.$senha).toBeUndefined()
        expect(usuario.senha).toBe(hash)
    })

    test('Deve retornar os dados públicos com ID em texto ao chamar paraJSON', () => {
        const usuario = Usuario.criar(dados)
        expect(usuario.paraJSON()).toEqual({
            id: usuario.id.valor,
            nomeCompleto: dados.nomeCompleto,
            email: dados.email,
            permissao: dados.permissao
        })
    })

    test('Deve omitir o hash e as propriedades internas na serialização e no espalhamento', () => {
        const usuario = Usuario.criar(dados)
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
