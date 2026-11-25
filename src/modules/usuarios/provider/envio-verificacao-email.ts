export default interface EnvioVerificacaoEmail {
    // A infraestrutura monta e envia o link com este token ao endereço indicado.
    enviar(email: string, token: string): Promise<void>
}
