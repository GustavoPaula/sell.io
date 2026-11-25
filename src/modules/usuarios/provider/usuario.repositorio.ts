import {
    Usuario,
    type UsuarioProps
} from '@/modules/usuarios/model/usuario.entidade'

export default interface UsuarioRepositorio {
    salvar(usuario: Usuario): Promise<void>
    alterarProps(id: string, props: Partial<UsuarioProps>): Promise<void>
    buscarPorEmail(email: string): Promise<Usuario | null>
    // Inclui usuários desativados.
    buscarPorId(id: string): Promise<Usuario | null>
    // Preserva a data anterior caso o usuário já esteja desativado.
    desativarUsuario(id: string, deletadoEm: Date): Promise<void>

    // Cria o token e invalida os anteriores atomicamente, se o usuário ainda
    // estiver ativo, não verificado e com o mesmo endereço.
    criarToken(dados: { usuarioId: string, email: string, tokenHash: string, expiraEm: Date }): Promise<boolean>

    // Consome o token válido e confirma o e-mail atomicamente, verificando a
    // expiração, o endereço atual e o estado ativo do usuário.
    confirmarToken(tokenHash: string): Promise<boolean>

}
