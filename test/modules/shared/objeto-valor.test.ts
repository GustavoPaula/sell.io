import { expect, expectTypeOf, test } from 'vitest'
import { ObjetoValor } from '@/modules/shared/objeto-valor'
import type { Id } from '@/modules/shared/id.vo'

test('Deve atender ao contrato de ValueObject com valor textual no Id', () => {
    expectTypeOf<Id>().toMatchTypeOf<ObjetoValor<Id, string>>()
})

class Numero extends ObjetoValor<Numero, number> {
    constructor(valor: number) {
        super(valor)
    }
}

class OutroNumero extends ObjetoValor<OutroNumero, number> {
    constructor(valor: number) {
        super(valor)
    }
}

test('Deve comparar valores e distinguir as classes dos objetos', () => {
    const numero = new Numero(42)
    expect(numero.valor).toBe(42)
    expect(numero.igual(new Numero(42))).toBe(true)
    expect(numero.igual(new Numero(43))).toBe(false)
    expect(numero.igual(new OutroNumero(42))).toBe(false)
    expect(numero.igual({ valor: 42 } as Numero)).toBe(false)
    expect(numero.diferente(new Numero(42))).toBe(false)
    expect(numero.diferente(new Numero(43))).toBe(true)
    expect(numero.paraString()).toBe('42')
})
