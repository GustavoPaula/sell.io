import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export type DadosEntrada = {
    novoNomeCompleto: string
}

export default class AlterarNomeCompletoCasoDeUso implements CasoDeUso<DadosEntrada, void> {
    constructor(private readonly repo: UsuarioRepositorio) {}

    async executar(dados: DadosEntrada, idUsuarioLogado: string): Promise<void> {
        const usuario = await this.repo.buscarPorId(idUsuarioLogado)
        if (!usuario) {
            return ErroValidacao.lancar(Erros.USUARIO_NAO_ENCONTRADO)
        }

        const atualizado = usuario.clone({ nomeCompleto: dados.novoNomeCompleto })
        await this.repo.alterarProps(usuario.id.valor, { nomeCompleto: atualizado.nomeCompleto })
    }
}
