import { Id } from '@/modules/shared/id.vo'

export interface EntidadeProps<ID = string | number> {
    id?: ID
}

export default abstract class Entidade<Tipo, Props extends EntidadeProps> {
    readonly id: Id
    readonly props: Props

    constructor(props: Props) {
        this.id = Id.criar(props.id as string)
        this.props = { ...props, id: this.id.valor }
    }

    igual(entidade: Entidade<Tipo, Props>): boolean {
        return this.id.igual(entidade.id)
    }

    diferente(entidade: Entidade<Tipo, Props>): boolean {
        return this.id.diferente(entidade.id)
    }

    clone(novasProps: Props, ...args: any[]): Tipo {
        return new (this.constructor as any)(
            {
                ...this.props,
                ...novasProps
            },
            ...args
        )
    }
}
