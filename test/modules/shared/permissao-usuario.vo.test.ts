import { describe, expect, test } from 'vitest'
import { PermissaoUsuario } from '@/modules/shared/permissao-usuario.vo'
import Erros from '@/modules/error/constants-erros'

describe('PermissaoUsuario', () => {
    test('Deve aceitar as permissões admin e membro', () => {
        expect(PermissaoUsuario.criar('admin').valor).toBe('admin')
        expect(PermissaoUsuario.criar('membro').valor).toBe('membro')
    })

    test('Deve rejeitar uma permissão vazia', () => {
        expect(() => PermissaoUsuario.criar('')).toThrowError(Erros.PERMISSAO_USUARIO_VAZIA)
        expect(() => PermissaoUsuario.criar('   ')).toThrowError(Erros.PERMISSAO_USUARIO_VAZIA)
    })

    test('Deve rejeitar valores diferentes de admin e membro', () => {
        expect(() => PermissaoUsuario.criar('visitante')).toThrowError(Erros.PERMISSAO_USUARIO_INVALIDA)
        expect(() => PermissaoUsuario.criar('Admin')).toThrowError(Erros.PERMISSAO_USUARIO_INVALIDA)
        expect(() => PermissaoUsuario.criar(' admin ')).toThrowError(Erros.PERMISSAO_USUARIO_INVALIDA)
    })

    test('Deve comparar permissões pelo valor', () => {
        expect(PermissaoUsuario.criar('admin').igual(PermissaoUsuario.criar('admin'))).toBe(true)
        expect(PermissaoUsuario.criar('admin').igual(PermissaoUsuario.criar('membro'))).toBe(false)
    })
})
