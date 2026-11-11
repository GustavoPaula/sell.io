import { Usuario } from '@/modules/usuarios/model/usuario.entidade'

export default interface UsuarioRepositorio {
    salvar(usuario: Usuario): Promise<void>
    buscarPorEmail(email: string): Promise<Usuario | null>
    buscarPorId(id: string): Promise<Usuario | null>
}
