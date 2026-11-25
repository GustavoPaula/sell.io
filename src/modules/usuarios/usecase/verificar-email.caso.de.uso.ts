import { createHash } from 'node:crypto'
import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export type DadosEntrada = { token: string }

export default class VerificarEmailCasoDeUso implements CasoDeUso<DadosEntrada, void> {
    constructor(private readonly repo: Pick<UsuarioRepositorio, 'confirmarToken'>) {}

    async executar(dados: DadosEntrada): Promise<void> {
        if (!/^[A-Za-z0-9_-]{43}$/.test(dados.token)) return ErroValidacao.lancar(Erros.TOKEN_VERIFICACAO_INVALIDO)
        const tokenHash = createHash('sha256').update(dados.token).digest('hex')
        if (!await this.repo.confirmarToken(tokenHash)) {
            return ErroValidacao.lancar(Erros.TOKEN_VERIFICACAO_INVALIDO)
        }
    }
}
