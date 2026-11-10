import { describe, expect, test } from 'vitest'
import { PermissaoUsuario } from '@/modules/shared/permissao-usuario.vo'
import Erros from '@/modules/error/constants-erros'

describe('PermissaoUsuario', () => {
    test('Deve aceitar as permissões ADMIN e MEMBRO', () => {
        expect(PermissaoUsuario.criar('ADMIN').valor).toBe('ADMIN')
        expect(PermissaoUsuario.criar('MEMBRO').valor).toBe('MEMBRO')
    })

    test('Deve rejeitar uma permissão vazia', () => {
        expect(() => PermissaoUsuario.criar('')).toThrowError(
            Erros.PERMISSAO_USUARIO_VAZIA
        )
        expect(() => PermissaoUsuario.criar('   ')).toThrowError(
            Erros.PERMISSAO_USUARIO_VAZIA
        )
    })

    test('Deve rejeitar valores diferentes de ADMIN e MEMBRO', () => {
        expect(() => PermissaoUsuario.criar('visitante')).toThrowError(
            Erros.PERMISSAO_USUARIO_INVALIDA
        )
        expect(() => PermissaoUsuario.criar('Admin')).toThrowError(
            Erros.PERMISSAO_USUARIO_INVALIDA
        )
        expect(() => PermissaoUsuario.criar(' ADMIN ')).toThrowError(
            Erros.PERMISSAO_USUARIO_INVALIDA
        )
    })

    test('Deve comparar permissões pelo valor', () => {
        expect(
            PermissaoUsuario.criar('ADMIN').igual(
                PermissaoUsuario.criar('ADMIN')
            )
        ).toBe(true)
        expect(
            PermissaoUsuario.criar('ADMIN').igual(
                PermissaoUsuario.criar('MEMBRO')
            )
        ).toBe(false)
    })
})
