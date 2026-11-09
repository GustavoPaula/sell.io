export default interface CryptoRepositorio {
    criptografar(senha: string): Promise<string>
    comparar(senha: string, senhaHash: string): Promise<boolean>
}
