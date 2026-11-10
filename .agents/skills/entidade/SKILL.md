---
name: entidade
description: Cria entidades no projeto sell.io a partir do nome, atributos e objetos de valor informados pelo usuário.
---

# Entidade

Para criar uma entidade, obtenha do usuário o nome, os atributos e os objetos de valor que validam cada atributo. Se faltar alguma dessas informações ou o vínculo entre atributo e objeto de valor estiver ambíguo, peça os dados necessários antes de implementar; não invente regras de validação.

Leia `src/modules/usuarios/model/usuario.entidade.ts` e `src/modules/shared/entidade.ts` para seguir o padrão atual do projeto. Inspecione os objetos de valor informados para usar suas APIs e tipos corretamente. Se algum objeto de valor necessário não existir ou não puder validar o atributo como solicitado, peça esclarecimento antes de prosseguir.

Crie a entidade em `src/modules/<nome-no-plural>/model/<nome-no-singular>.entidade.ts`, usando nomes em kebab-case. Por exemplo, Usuario fica em `src/modules/usuarios/model/usuario.entidade.ts`. Reutilize diretórios existentes quando apropriado e preserve arquivos existentes. Exporte a classe com nome em PascalCase e adapte a interface de propriedades, a herança e os acessores de objetos de valor ao modelo de usuário e aos atributos informados. Não copie comportamentos específicos de usuário, como tratamento de senha, para entidades que não os necessitem.

Na criação da entidade, siga o padrão de `Usuario.criar`: use `ErroValidacao.executar` para validar os atributos independentes com seus objetos de valor e reunir os erros por campo; aproveite os objetos retornados para construir a entidade somente após a validação. Use construtor privado e, como `Entidade.clone` chama o construtor diretamente, sobrescreva `clone` para recriar e validar a entidade, preservando a identidade e os demais atributos. Mantenha os comportamentos opcionais adequados aos atributos informados.

Verifique a entidade com testes pertinentes, incluindo a coleta de erros de vários campos e a validação ao clonar, e execute as verificações apropriadas do projeto. Siga as instruções de testes do `AGENTS.md`.
