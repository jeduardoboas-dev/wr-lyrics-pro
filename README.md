# Lyrics Pro para Windows

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
- Criação e renomeação de programações ilimitadas.
- Criação de textos.
- Importação de arquivos TXT divididos em slides por linhas em branco.
- Importação unificada de textos, áudios, imagens e vídeos locais.
- Consulta bíblica com seleção de versículos.
- Layouts de projeção persistentes, editáveis e ilimitados.
- Cenas locais com conteúdo, layout e cena OBS vinculada.
- Transições configuráveis entre conteúdos e cenas.
- Atalhos de operação personalizáveis.
- Controle e sincronização de cenas pelo OBS WebSocket 5.x.
- Ponte protegida para pesquisar o catálogo e abrir o LouvorJA original.
- Tela preta, alertas e contagem regressiva.

## Integração com o LouvorJA

O instalador permite indicar a pasta que contém o `LouvorJA.exe`. Na primeira
execução, crie um PIN administrativo de 4 a 8 dígitos. Depois, abra a aba
**Ferramentas**, desbloqueie a área **LouvorJA original**, pesquise a música ou
o álbum e escolha **Original**, **Playback** ou **Só áudio**. O aplicativo abre o
programa original e envia a música selecionada pela API local do LouvorJA.

O banco `config/database.db` é aberto somente para leitura. O Lyrics Pro não
copia músicas nem altera a instalação do LouvorJA; ele funciona apenas como
uma ponte de pesquisa e reprodução. Na primeira reprodução, o servidor local
do LouvorJA é ativado e uma cópia de segurança de `configPT.ja` é criada antes
da alteração.

## Desenvolvimento

Requer Node.js 22.5 ou superior.

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

O instalador será gerado na pasta `dist`. Para gerar a versão portátil, use
`npm run dist:portable`.

## Observações

- A consulta bíblica utiliza a tradução pública João Ferreira de Almeida.
- Não há músicas ou letras pré-carregadas. Somente conteúdos escolhidos pelo
  usuário entram na biblioteca.
