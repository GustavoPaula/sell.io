import CasoDeUso from '@/modules/shared/caso-de-uso'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'

export type DadosEntrada = {
    idUsuario: string
}

export default class DesativarUsuarioCasoDeUso implements CasoDeUso<
    DadosEntrada,
    void
> {
    constructor(private readonly repo: UsuarioRepositorio) {}

    async executar(dados: DadosEntrada): Promise<void> {
        const usuario = await this.repo.buscarPorId(dados.idUsuario)

        if (!usuario) {
            return ErroValidacao.lancar(Erros.USUARIO_NAO_ENCONTRADO)
        }

        if (usuario.deletadoEm !== null) {
            return
        }

        if (usuario.administradorSistema) {
            return ErroValidacao.lancar(
                Erros.ADMINISTRADOR_SISTEMA_PROTEGIDO
            )
        }

        await this.repo.desativarUsuario(
            usuario.id.valor,
            new Date()
        )
    }
}
