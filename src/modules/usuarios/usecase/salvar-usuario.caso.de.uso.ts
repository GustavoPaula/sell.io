import CasoDeUso from '@/modules/shared/caso-de-uso'
import UsuarioRepositorio from '@/modules/usuarios/provider/usuario.repositorio'
import CryptoRepositorio from '@/modules/usuarios/provider/crypto.repositorio'
import { Senha } from '@/modules/shared/senha.vo'
import { Usuario } from '@/modules/usuarios/model/usuario.entidade'

export type DadosEntrada = {
    nomeCompleto: string
    email: string
    senha: string
    permissao: string
}

export default class AdicionarUsuarioCasoDeUso implements CasoDeUso<
    DadosEntrada,
    void
> {
    constructor(
        private readonly repo: UsuarioRepositorio,
        private readonly crypto: CryptoRepositorio
    ) {}

    async executar(usuario: DadosEntrada): Promise<void> {
        const senhaValida = Senha.criar(usuario.senha).valor

        const usuarioExistente = await this.repo.buscarPorEmail(usuario.email)
        if (usuarioExistente) {
            throw new Error('Usuário já existe com esse e-mail cadastrado')
        }

        const senhaHash = await this.crypto.criptografar(senhaValida)
        const novoUsuario = new Usuario({
            nomeCompleto: usuario.nomeCompleto,
            email: usuario.email,
            senha: senhaHash,
            permissao: usuario.permissao
        })
        await this.repo.salvar(novoUsuario)
    }
}
