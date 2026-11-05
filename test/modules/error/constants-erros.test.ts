import { expect, test } from 'vitest'
import Erros from '@/modules/error/constants-erros'

test('Devem corresponder os códigos de erro aos respectivos nomes', () => {
    expect(Object.keys(Erros).length).toBeGreaterThan(0)
    for (const [nome, codigo] of Object.entries(Erros)) {
        expect(codigo).toBe(nome)
    }
})
