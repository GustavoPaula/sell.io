import { ObjetoValor } from '@/modules/shared/objeto-valor'
import ErroValidacao from '@/modules/error/erro-validacao'
import Erros from '@/modules/error/constants-erros'

export class SenhaHash extends ObjetoValor<SenhaHash, string> {
    private constructor(valor: string) {
        super(valor)
    }

    public static criar(hash: string): SenhaHash {
        this.validar(hash)
        return new SenhaHash(hash)
    }

    private static validar(hash: string): void {
        const formatoBcrypt = /^\$2[aby]\$(?:0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{21}[.Oeu][./A-Za-z0-9]{30}[.CGKOSWaeimquy26](?![\s\S])/

        if (!hash.trim() || !formatoBcrypt.test(hash)) {
            ErroValidacao.lancar(Erros.SENHA_HASH_INVALIDA)
        }
    }
}
