import CasoDeUso from '@/modules/shared/caso-de-uso'
import { Senha } from '@/modules/shared/senha.vo'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import CryptoRepositorio from '@/modules/usuarios/provider/crypto.repositorio'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export type DadosEntrada = {
    novaSenha: string
}

export default class AlterarSenhaCasoDeUso implements CasoDeUso<DadosEntrada, void> {
    constructor(
        private readonly repo: UsuarioRepositorio,
        private readonly crypto: CryptoRepositorio
    ) {}

    async executar(dados: DadosEntrada, idUsuarioLogado: string): Promise<void> {
        const usuario = await this.repo.buscarPorId(idUsuarioLogado)
        if (!usuario) {
            return ErroValidacao.lancar(Erros.USUARIO_NAO_ENCONTRADO)
        }

        const senha = Senha.criar(dados.novaSenha).valor
        const hash = await this.crypto.criptografar(senha)
        const atualizado = usuario.clone({ senha: hash })
        await this.repo.alterarProps(usuario.id.valor, { senha: atualizado.senha })
    }
}
