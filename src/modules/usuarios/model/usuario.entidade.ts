import { Email } from '@/modules/shared/email.vo'
import Entidade, { EntidadeProps } from '@/modules/shared/entidade'
import { HashSenha } from '@/modules/shared/hash-senha.vo'
import { NomeCompleto } from '@/modules/shared/nome-completo.vo'
import { PermissaoUsuario } from '@/modules/shared/permissao-usuario.vo'

export interface UsuarioProps extends EntidadeProps<string> {
    nomeCompleto: string
    email: string
    senha?: string | undefined
    permissao: string
}

export class Usuario extends Entidade<Usuario, UsuarioProps> {
    public readonly nomeCompleto: string
    public readonly email: string
    readonly #senha: string | undefined
    public readonly permissao: string

    constructor(props: UsuarioProps) {
        super(props)
        this.nomeCompleto = NomeCompleto.criar(props.nomeCompleto).valor
        this.email = Email.criar(props.email).valor
        this.#senha =
            props.senha === undefined
                ? undefined
                : HashSenha.criar(props.senha).valor
        this.permissao = PermissaoUsuario.criar(props.permissao).valor
    }

    semSenha(): Usuario {
        return this.clone({ senha: undefined })
    }

    get senha(): string | undefined {
        return this.#senha
    }

    get $nomeCompleto(): NomeCompleto {
        return NomeCompleto.criar(this.nomeCompleto)
    }

    get $email(): Email {
        return Email.criar(this.email)
    }

    get $senha(): HashSenha | undefined {
        return this.senha ? HashSenha.criar(this.senha) : undefined
    }

    get $permissao(): PermissaoUsuario {
        return PermissaoUsuario.criar(this.permissao)
    }

    paraJSON() {
        return {
            id: this.id.valor,
            nomeCompleto: this.nomeCompleto,
            email: this.email,
            permissao: this.permissao
        }
    }
}
