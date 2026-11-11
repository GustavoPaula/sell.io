---
name: caso-de-uso
description: Cria casos de uso no projeto sell.io a partir dos dados de entrada e do tipo de retorno informados.
---

# Caso de uso

Para criar um caso de uso, obtenha do usuário o nome ou objetivo, os dados de entrada e o tipo de retorno, incluindo `void` quando não houver retorno. Se algum desses dados estiver ausente ou o comportamento necessário estiver ambíguo, peça as informações necessárias antes de implementar; não invente regras de negócio. Identifique o módulo pelo pedido ou pelo código existente e esclareça se não for possível determiná-lo.

Leia `src/modules/usuarios/usecase/adicionar-usuario.caso.de.uso.ts` e `src/modules/shared/caso-de-uso.ts`, além das entidades, objetos de valor e interfaces de provedores pertinentes ao caso solicitado. Crie o arquivo em `src/modules/<modulo>/usecase/<nome-em-kebab-case>.caso.de.uso.ts`, seguindo as convenções existentes.

Exporte uma classe padrão com nome em PascalCase e sufixo `CasoDeUso`, que implemente `CasoDeUso<Entrada, Saida>` e exponha `executar` assíncrono com os tipos informados. Defina e exporte o tipo de entrada quando necessário. Injete pelo construtor os repositórios e provedores necessários, programando contra interfaces; reutilize os existentes ou adapte-os quando o comportamento exigir. Use entidades, objetos de valor e erros existentes para aplicar as regras solicitadas. Adapte o fluxo ao caso de uso: não copie validações, consulta por e-mail ou criptografia do exemplo quando não forem pertinentes.

Implemente testes dos comportamentos e regras solicitados, incluindo falhas relevantes e interações com dependências, e execute as verificações apropriadas do projeto. Siga as instruções de testes do `AGENTS.md`.
