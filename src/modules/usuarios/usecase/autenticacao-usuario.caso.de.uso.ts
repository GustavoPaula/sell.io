import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import CryptoRepositorio from '@/modules/usuarios/provider/crypto.repositorio'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export type DadosEntrada = {
    email: string
    senha: string
}

export default class AutenticacaoUsuarioCasoDeUso implements CasoDeUso<DadosEntrada, Usuario> {
    constructor(
        private readonly repo: UsuarioRepositorio,
        private readonly crypto: CryptoRepositorio
    ) {}

    async executar(dados: DadosEntrada): Promise<Usuario> {
        const usuario = await this.repo.buscarPorEmail(dados.email)
        if (!usuario?.senha) {
            return ErroValidacao.lancar(Erros.CREDENCIAIS_INVALIDAS)
        }

        const senhaCorreta = await this.crypto.comparar(dados.senha, usuario.senha)
        if (!senhaCorreta) {
            return ErroValidacao.lancar(Erros.CREDENCIAIS_INVALIDAS)
        }

        return usuario.semSenha()
    }
}
