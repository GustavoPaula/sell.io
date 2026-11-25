import { createHash, randomBytes } from 'node:crypto'
import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import EnvioVerificacaoEmail from '@/modules/usuarios/provider/envio-verificacao-email'

export type DadosEntrada = { email: string }

export default class SolicitarVerificacaoEmailCasoDeUso implements CasoDeUso<DadosEntrada, void> {
    constructor(
        private readonly usuarios: Pick<UsuarioRepositorio, 'buscarPorEmail' | 'criarToken'>,
        private readonly envio: EnvioVerificacaoEmail
    ) {}

    async executar(dados: DadosEntrada): Promise<void> {
        const usuario = await this.usuarios.buscarPorEmail(dados.email)
        if (!usuario || usuario.deletadoEm !== null || usuario.emailVerificadoEm !== null) return
        const token = randomBytes(32).toString('base64url')
        const tokenHash = createHash('sha256').update(token).digest('hex')
        const expiraEm = new Date(Date.now() + 30 * 60 * 1000)
        const criado = await this.usuarios.criarToken({ usuarioId: usuario.id.valor, email: usuario.email, tokenHash, expiraEm })
        if (criado) await this.envio.enviar(usuario.email, token)
    }
}
