import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export type DadosEntrada = {
    idUsuario: string
    novaPermissao: string
}

export default class AlterarPermissaoUsuarioCasoDeUso implements CasoDeUso<
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
            return ErroValidacao.lancar(Erros.USUARIO_DESATIVADO)
        }

        const atualizado = usuario.clone({
            permissao: dados.novaPermissao
        })

        await this.repo.alterarProps(usuario.id.valor, {
            permissao: atualizado.permissao
        })
    }
}
