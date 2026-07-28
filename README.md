# WR Lyrics Pro para Windows

Primeira base funcional do aplicativo de projeção para Windows.

## Versão 0.2.0

- Atalhos: Enter exibe, setas navegam, B alterna a tela preta e Esc limpa sobreposições.
- Relógio do retorno atualizado em tempo real.
- Caminhos seguros para imagens e vídeos locais no Windows.
- Filtros separados para imagens e vídeos.
- Remoção segura de itens da biblioteca e das programações.
- Cronômetro com ajuste de minutos, reinício e opção de ocultar.
- Salvamento atômico com backup automático e recuperação de dados.
- Bloqueio de abertura duplicada do aplicativo.
- Testes automatizados de persistência executados antes da Release.
- Executável acompanhado de checksum SHA-256 para conferência.

## Recursos incluídos

- Janela principal do operador.
- Janelas independentes de projeção e retorno.
- Seleção do monitor de projeção e do monitor de retorno.
- Biblioteca local persistente.
- Programações e ordem do culto.
- Criação de textos.
- Importação de arquivos TXT divididos em slides por linhas em branco.
- Importação de imagens e vídeos locais.
- Consulta bíblica com seleção de versículos.
- Temas de projeção.
- Tela preta, alertas e contagem regressiva.
- Configuração futura da pasta local do LouvorJA.
- Acesso externo ao LouvorJA Web.

## Desenvolvimento

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

## Gerar instalador do Windows

Execute em um computador Windows:

```bash
npm install
npm run dist:win
```

O instalador e a versão portátil serão gerados na pasta `dist` ou `release`,
conforme a configuração do electron-builder.

## Observações

- A pasta do LouvorJA é apenas registrada nesta versão. O leitor específico
  será implementado depois que a estrutura real dessa pasta for analisada.
- A consulta bíblica utiliza a tradução pública João Ferreira de Almeida.
- Não há músicas ou letras pré-carregadas. Somente conteúdos escolhidos pelo
  usuário entram na biblioteca.
