---
name: objeto-valor
description: Cria objetos de valor no projeto sell.io a partir do nome e das validações informados pelo usuário.
---

# Objeto de valor

Para criar um objeto de valor, obtenha do usuário o nome e as validações desejadas. Se qualquer um deles estiver ausente ou as regras forem ambíguas, peça as informações necessárias antes de implementar; não invente validações.

Leia `src/modules/shared/id.vo.ts` e `src/modules/shared/objeto-valor.ts` para seguir o padrão atual do projeto. Crie o arquivo em `src/modules/shared`, com o nome informado convertido para kebab-case e o sufixo `.vo.ts` (por exemplo, Nome Completo → `nome-completo.vo.ts`).

Exporte a classe com nome em PascalCase e faça-a estender `ObjetoValor<Classe, TipoDoValor>`. Conforme `id.vo.ts`, use construtor privado, método `public static criar` que valida antes de retornar uma nova instância e método `private static validar` com as regras informadas. Adapte os tipos e parâmetros ao objeto solicitado; não copie a geração ou normalização de UUID do exemplo sem que seja pertinente.

Siga os padrões existentes de erros de validação do projeto e acrescente constantes necessárias quando apropriado. Verifique o comportamento das regras solicitadas com os testes ou verificações pertinentes do projeto.
