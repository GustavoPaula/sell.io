import { Email } from '@/modules/shared/email.vo'
import Entidade, { EntidadeProps } from '@/modules/shared/entidade'
import { SenhaHash } from '@/modules/shared/senha-hash.vo'
import { NomeCompleto } from '@/modules/shared/nome-completo.vo'
import { PermissaoUsuario } from '@/modules/shared/permissao-usuario.vo'
import ErroValidacao from '@/modules/error/erro-validacao'

export interface UsuarioProps extends EntidadeProps<string> {
    nomeCompleto: string
    email: string
    senha?: string | undefined
    permissao: string
}

type UsuarioValidado = {
    nomeCompleto: NomeCompleto
    email: Email
    senha: SenhaHash | undefined
    permissao: PermissaoUsuario
}

export class Usuario extends Entidade<Usuario, UsuarioProps> {
    public readonly nomeCompleto: string
    public readonly email: string
    readonly #senha: string | undefined
    public readonly permissao: string

    private constructor(props: UsuarioProps, dados: UsuarioValidado) {
        super(props)
        this.nomeCompleto = dados.nomeCompleto.valor
        this.email = dados.email.valor
        this.#senha = dados.senha?.valor
        this.permissao = dados.permissao.valor
    }

    static criar(props: UsuarioProps): Usuario {
        const dados = ErroValidacao.executar({
            nomeCompleto: () => NomeCompleto.criar(props.nomeCompleto),
            email: () => Email.criar(props.email),
            senha: () => props.senha === undefined ? undefined : SenhaHash.criar(props.senha),
            permissao: () => PermissaoUsuario.criar(props.permissao)
        })
        return new Usuario(props, dados)
    }

    override clone(novasProps: Partial<UsuarioProps>): Usuario {
        return Usuario.criar({
            id: this.id.valor,
            nomeCompleto: this.nomeCompleto,
            email: this.email,
            senha: this.#senha,
            permissao: this.permissao,
            ...novasProps
        })
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

    get $senha(): SenhaHash | undefined {
        return this.senha ? SenhaHash.criar(this.senha) : undefined
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
