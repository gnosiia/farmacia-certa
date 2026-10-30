# Farmácia Certa DF — protótipo unificado (Hackathon SES-DF)

Este protótipo une a estrutura azul do projeto Farmácia Certa DF à navegação simplificada para todos os públicos, com ícones SVG claros inspirados no padrão de navegação dos portais de saúde. **Não é um serviço oficial do SUS, da SES-DF, do DATASUS ou do gov.br.** Estoques, horários de farmácia, receitas, cadastros e movimentações são *simulações*. Endereços indicados no mapa devem ser confirmados pelo usuário.

## Rodar

1. Descompacte o ZIP preservando a pasta e todos os arquivos.
2. Abra `index.html` para o protótipo público. Em navegadores que restringem arquivos locais, use um servidor web local: `python -m http.server 8000` na pasta do projeto, e acesse `http://localhost:8000/`.
3. A consulta é livre. Use **Minha conta** → **Entrar ou criar perfil fictício** para testar perfis.
4. Se você criou um perfil, também pode entrar digitando o **e-mail fictício** na opção expansível do login, sem senha (demonstração, não autenticação real).
5. Para testar perfis prontos: escolha um da lista e digite qualquer *senha inventada*. O sistema não valida senhas reais.
6. Todas as pessoas usam agora **a mesma navegação**: consulta simplificada com botões grandes e busca por voz opcional. Cadastro e idade não alteram o layout.
7. O campo de busca aceita nomes, trechos ou frases como “me dá aquele dipirona de 500”. Na dúvida, escolha o medicamento correto nas sugestões.

## Recursos

- Busca por nome, princípio ativo, concentração, seleção de vários medicamentos, filtro SUS/comerciais.
- Estoques fictícios com informação de atualização, falta, documentação e separação por unidade.
- Horários simulados, horário de almoço, fechamentos temporários, farmacêutico e alertas de funcionamento.
- Abertura de rotas pelo Google Maps e texto para compartilhar no WhatsApp incluindo a rota.
- Receitas de demonstração associadas aos perfis fictícios, verificação orientativa de requisitos, seleção de foto sem envio/analise.
- Uma interface de consulta acessível para todos, com botões grandes, textos objetivos, busca por voz (quando suportada), ondas animadas enquanto escuta e aumento/diminuição de fonte.
- Catálogo de nomes/alternativas local (`med-search.js`) com busca aproximada por digitação ou fala e confirmação para nomes parecidos.
- Fotografias opcionais de caixas somente se a API pública do **DailyMed (EUA)** retornar embalagem com princípio ativo e concentração identificados; quando isso não for confirmado, aparece “Foto da caixa indisponível”. Nenhuma fotografia é garantia de que a caixa corresponde ao produto dispensado no Brasil. A consulta pode falhar por CORS, rede, limite ou ausência de foto.
- Tema claro/noturno persistente; navegação responsiva e por teclado.
- Área da farmácia: **admin / demo123**, exclusivamente para testar atualização de horário/estoque, entradas, saídas e histórico.
- Central de integrações de exemplo: CADSUS, BNAFAR, RNDS, REME, CNES, InfoSaúde e conceito de gov.br (nenhuma API real).
- Botão **Restaurar base fictícia original** disponível em *Sobre e privacidade*.

## Segurança, privacidade e implantação

A versão é inteiramente front-end, sem servidor: `localStorage` armazena dados fictícios e preferências, `sessionStorage` armazena o perfil demonstrativo. **Nunca informe CPF, CNS, receitas, senhas ou dados pessoais reais.** O formulário de foto não lê e não envia imagens. O perfil `admin` e qualquer login são **demonstrações sem autenticação segura**, não apropriadas para produção. Não há escolha de Modo Fácil ou Normal e a idade de demonstração não altera a aparência do site. A busca aproximada consulta apenas o catálogo local; não oferece orientação clínica.

Para produção de verdade: backend + banco com controle de acesso, integração autorizada com SES-DF, autenticação segura, avaliação LGPD, auditoria, validação clínica/normativa, dados reais homologados, testes de segurança/uso e monitoramento. Não inferir que o medicamento está garantido ao cidadão porque aparece "informado disponível".

## Testes manuais recomendados

- Navegação pública sem cadastro; home → medicamento → unidade → rota/WhatsApp → voltar aos resultados.
- Cadastro fictício, saída e retorno pelo perfil; confirmar interface idêntica nas faixas de idade.
- Dark mode nas telas principal/receita/unidades/admin e depois de atualizar a página.
- Pesquisa sem termo, termo inexistente, erro ortográfico (dipironna), frase longa (“me dá aquele dipirona de 500”), insulina ambígua e vários medicamentos, filtro SUS/comerciais.
- Receita com data futura, categoria incompatível, validação e foto (sem upload).
- Horário de almoço e fechamento da farmácia; entrada/saída de estoque negativa recusada.
- Celular com 360–390 px, toque e navegação por teclado; com leitor de tela quando possível.

## Arquivos principais

`index.html` página pública · `style.css` estilos · `app.js` lógica · `med-search.js` reconhecimento local · `med-images.js` fotos condicionais · `data.js` dados fictícios · `icons.js` ícones SVG · `theme.js` tema compartilhado · `login.html`, `login.css` e `login.js` perfis fictícios.
