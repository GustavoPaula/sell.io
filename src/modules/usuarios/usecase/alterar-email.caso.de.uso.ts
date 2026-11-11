import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export type DadosEntrada = {
    novoEmail: string
}

export default class AlterarEmailCasoDeUso implements CasoDeUso<DadosEntrada, void> {
    constructor(private readonly repo: UsuarioRepositorio) {}

    async executar(dados: DadosEntrada, idUsuarioLogado: string): Promise<void> {
        const usuario = await this.repo.buscarPorId(idUsuarioLogado)
        if (!usuario) {
            return ErroValidacao.lancar(Erros.USUARIO_NAO_ENCONTRADO)
        }

        const atualizado = usuario.clone({ email: dados.novoEmail })
        const usuarioExistente = await this.repo.buscarPorEmail(atualizado.email)
        if (usuarioExistente && usuarioExistente.id.valor !== usuario.id.valor) {
            return ErroValidacao.lancar(Erros.EMAIL_JA_CADASTRADO)
        }

        await this.repo.alterarProps(usuario.id.valor, { email: atualizado.email })
    }
}
