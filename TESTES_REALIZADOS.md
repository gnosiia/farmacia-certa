# Testes da atualização de busca e voz — 30/10/2026

## Executados com Chromium/Playwright

- **122/122** asserções aprovadas na suíte principal (7 larguras: 320, 360, 390, 700, 768, 1024 e 1366 px).
- Não houve transbordamento horizontal nos tamanhos testados.
- Testados: interface única, responsividade do campo e microfone, sugestões vazias no início, interpretação de frase longa, correção de erro ortográfico, foto substituta para medicamentos sem foto confirmada, disponibilidade de unidades, navegação e ausência de exceções JavaScript nas rotas acessadas.
- Extratores testados para: “me dá aquele dipirona de 500”, “dipironna”, “novalgina”, “glifage”, “insulina regular”, “insulina” (ambígua), termo desconhecido e apenas concentração (não deve inventar medicamento).
- Teste de reconhecimento de voz com **simulação da API Web Speech**: início, estado visível, cinco barras de áudio, extração de Dipirona, encerramento e cancelamento. Microfone e permissão reais devem ser testados em HTTPS/dispositivo físico.
- Cadastro fictício continua funcional e não gera preferência de modo por idade.
- Testes complementares aprovados: modo noturno, retorno de orientações aos resultados, painel administrativo, entrada de estoque e logout.

## Limites

- APIs de embalagem: integração condicional com DailyMed. Não há garantia de imagem para todas as apresentações e não foi possível verificar a disponibilidade ao vivo neste ambiente. O sistema usa indicação neutra quando não encontra foto compatível ou a chamada falha.
- As informações de medicamentos, estoque e horários deste protótipo são simuladas; sem integração com SES-DF ou validação de receita.
- O formato de retorno da API de fotos foi conferido por simulação, sem confirmar disponibilidade externa ao vivo.
- Não foram realizados testes reais com usuário, leitores de tela e dispositivos físicos. Ausência de erros nos testes não garante sistema livre de defeitos.
