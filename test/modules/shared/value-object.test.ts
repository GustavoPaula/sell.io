import { expectTypeOf, test } from 'vitest'
import type { ValueObject } from '@/modules/shared/value-object'
import type { Id } from '@/modules/shared/id.vo'

test('Id atende ao contrato de ValueObject com valor textual', () => {
    expectTypeOf<Id>().toMatchTypeOf<ValueObject<Id, string>>()
})
