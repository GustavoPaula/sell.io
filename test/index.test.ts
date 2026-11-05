import { expect, test, vi } from 'vitest'

test('anuncia a inicialização da aplicação', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
        await import('../src/index.js')
        expect(log).toHaveBeenCalledWith('Sell.IO iniciado!')
    } finally {
        log.mockRestore()
    }
})
