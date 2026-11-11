import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export default class BuscarPerfilUsuarioCasoDeUso implements CasoDeUso<string, Usuario> {
    constructor(private readonly repo: UsuarioRepositorio) {}

    async executar(idUsuarioLogado: string): Promise<Usuario> {
        const usuario = await this.repo.buscarPorId(idUsuarioLogado)
        if (!usuario) {
            return ErroValidacao.lancar(Erros.USUARIO_NAO_ENCONTRADO)
        }
        return usuario.semSenha()
    }
}
