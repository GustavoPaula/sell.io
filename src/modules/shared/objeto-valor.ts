export abstract class ObjetoValor<T, V = any> {
    protected constructor(readonly valor: V) {}

    igual(outro: T): boolean {
        return (
            outro instanceof ObjetoValor &&
            this.constructor === outro.constructor &&
            this.valor === outro.valor
        )
    }

    diferente(outro: T): boolean {
        return !this.igual(outro)
    }

    paraString(): string {
        return String(this.valor)
    }
}
