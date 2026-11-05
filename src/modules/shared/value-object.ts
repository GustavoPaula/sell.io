export interface ValueObject<T, V = any> {
    valor: V
    igual(outro: T): boolean
    diferente(outro: T): boolean
}
