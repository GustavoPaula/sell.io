import { ObjetoValor } from '@/modules/shared/objeto-valor'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export class PermissaoUsuario extends ObjetoValor<PermissaoUsuario, string> {
    private constructor(valor: string) {
        super(valor)
    }

    public static criar(permissao: string): PermissaoUsuario {
        this.validar(permissao)
        return new PermissaoUsuario(permissao)
    }

    private static validar(permissao: string): void {
        if (!permissao.trim()) ErroValidacao.lancar(Erros.PERMISSAO_USUARIO_VAZIA)
        if (permissao !== 'admin' && permissao !== 'membro') {
            ErroValidacao.lancar(Erros.PERMISSAO_USUARIO_INVALIDA)
        }
    }
}
