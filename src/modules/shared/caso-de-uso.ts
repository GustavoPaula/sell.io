export default interface CasoDeUso<Entrada, Saida> {
    executar(dados: Entrada, idUsuarioLogado?: string): Promise<Saida>
}
