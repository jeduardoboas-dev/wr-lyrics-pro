# WR Lyrics Pro para Windows

Primeira base funcional do aplicativo de projeção para Windows.

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

## Baixar para Windows

A versão pronta fica disponível na seção
[Releases](https://github.com/jeduardoboas-dev/wr-lyrics-pro/releases).

Baixe o arquivo `.exe` da versão mais recente e execute no Windows.

## Gerar o aplicativo no Windows

Execute em um computador Windows:

```bash
npm install
npm run dist:win
```

A versão portátil será gerada na pasta `dist`.

## Observações

- A pasta do LouvorJA é apenas registrada nesta versão. O leitor específico
  será implementado depois que a estrutura real dessa pasta for analisada.
- A consulta bíblica utiliza a tradução pública João Ferreira de Almeida.
- Não há músicas ou letras pré-carregadas. Somente conteúdos escolhidos pelo
  usuário entram na biblioteca.
