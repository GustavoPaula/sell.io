import { Usuario, type UsuarioProps } from '@/modules/usuarios/model/usuario.entidade'

export default interface UsuarioRepositorio {
    salvar(usuario: Usuario): Promise<void>
    alterarProps(id: string, props: Partial<Omit<UsuarioProps, 'id'>>): Promise<void>
    buscarPorEmail(email: string): Promise<Usuario | null>
    buscarPorId(id: string): Promise<Usuario | null>
}
