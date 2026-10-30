# 💊 Farmácia Certa DF

**Protótipo web responsivo | Hackathon UniProjeção 2026 — Desafio 2: Disponibilidade de Medicamentos**

> ⚠️ **AMBIENTE DE SIMULAÇÃO:** pacientes, receitas, quantidades em estoque, horários de atendimento e situação das farmácias são demonstrativos. O projeto **não consulta o estoque real de nenhuma unidade**, não autentica pelo gov.br e não valida receitas oficialmente. Alguns estabelecimentos e endereços se referem a locais reais, mas **confirme a localização e o funcionamento por canais oficiais**. Não insira dados pessoais ou senhas reais.

## 🎯 Objetivo

Ajudar uma pessoa a **consultar medicamentos antes de sair de casa**, comparar estabelecimentos, visualizar horários e intervalos, saber o que levar e encontrar o caminho até a unidade. O foco do desafio é reduzir deslocamentos desnecessários, especialmente de idosos, familiares e cuidadores.

## 🚀 Como executar

1. No GitHub, clique em **Code → Download ZIP** e extraia o conteúdo.
2. Mantenha `login.html`, `index.html` e os arquivos `.css` e `.js` juntos na mesma pasta.
3. Abra **`login.html`** no Chrome, Edge ou Firefox.
4. Para testes no celular, publique o projeto em um endereço HTTPS (por exemplo, GitHub Pages) e abra o link pelo navegador do aparelho. Abrir o arquivo do computador não permite acessá-lo automaticamente pelo celular.

**Não é preciso instalar Node.js, Java, banco de dados ou IDE** para navegar no protótipo. Algumas funcionalidades, como busca por voz, dependem de compatibilidade e permissões do navegador.

## 👤 Teste do login de paciente

1. Na tela inicial, **escolha um dos 20 pacientes fictícios** apresentados na lista.
2. Digite **qualquer senha inventada**, como `teste123` (não use senha real).
3. Clique em **Entrar**.
4. Acesse **Minha conta** e **Minhas receitas** para visualizar os dados do perfil escolhido.
5. Use **Sair** para encerrar a sessão e entrar com outro perfil.

O login é **apenas visual e demonstrativo**. A senha não é verificada em servidores governamentais.

## ✅ Roteiro para o tester

Marque as etapas conforme concluir:

- [ ] **Login:** escolher um paciente fictício, digitar uma senha de teste e entrar.
- [ ] **Página inicial:** conferir se os menus e cartões abrem corretamente.
- [ ] **Medicamento:** pesquisar `Losartana`, selecionar o item e visualizar unidades.
- [ ] **Busca múltipla:** adicionar outro medicamento e comparar unidades que fornecem todos os itens ou parte deles.
- [ ] **Filtro:** alternar entre **Todas as farmácias**, **Rede pública SUS** e **Farmácias comerciais**.
- [ ] **Horário:** mudar a **hora demonstrativa** para observar fechamento, almoço e presença simulada de farmacêutico.
- [ ] **Orientações:** abrir **Ver orientações de retirada**, conferir documentação, horários e endereço.
- [ ] **Rota:** usar **Ver rota** e verificar se um endereço é enviado ao Google Maps (requer internet).
- [ ] **Voltar:** clicar em **Voltar aos resultados** e conferir se a lista reaparece.
- [ ] **WhatsApp:** compartilhar a unidade e verificar se a mensagem contém medicamentos, endereço, horário e link da rota (requer acesso ao WhatsApp).
- [ ] **Receitas:** acessar as receitas fictícias e a verificação demonstrativa de requisitos.
- [ ] **Modo noturno:** alternar tema claro/escuro e observar se texto e botões continuam legíveis.
- [ ] **Celular:** verificar se botões, menu inferior, campos, resultados e cartões cabem na tela sem rolagem horizontal.
- [ ] **Logout:** sair e testar outro paciente.

### 🧑‍⚕️ Área da farmácia (administração demonstrativa)

Na opção **Área da farmácia**, utilize:

```text
Usuário: admin
Senha: demo123
```

Experimente selecionar uma unidade, conferir o estoque fictício, registrar uma entrada/saída demonstrativa e alterar o estado de atendimento. **Essas credenciais não são seguras e servem apenas ao protótipo.** Mudanças ficam no navegador do tester, não são enviadas a um servidor central.

## 📱 Testes recomendados

- **Celular Android / iPhone:** testar em orientação vertical, inclusive botões de WhatsApp e Google Maps.
- **Computador:** testar em Chrome, Edge ou Firefox.
- **Acessibilidade:** experimentar tamanho de fonte maior, navegação por teclado, contraste no modo escuro e busca por voz (quando disponível).
- **Internet:** necessária para abrir serviços externos, como Maps e WhatsApp; a aplicação usa arquivos locais para as consultas demonstrativas.

## 🧪 Dados simulados e integrações

| Recurso | Situação nesta versão |
|---|---|
| Pacientes e receitas | Fictícios, para teste |
| Estoque e dispensações | Dados locais simulados |
| Horários e presença de farmacêutico | Simulados, inclusive intervalos de almoço |
| Estabelecimentos e endereços | Alguns nomes/endereços reais, com funcionamento não verificado pelo app |
| CADSUS, BNAFAR, RNDS, CNES, REME e InfoSaúde | Representados por bases **mock**, sem conexão real |
| Login gov.br | Fluxo visual simulado, sem autenticação oficial |
| Google Maps / WhatsApp | Links externos para rota e compartilhamento |

A verificação de receitas utiliza **regras exemplificativas do desafio**; ela não substitui avaliação de farmacêutico ou conferência da legislação vigente.

## 🛠️ Arquivos principais

| Arquivo | Finalidade |
|---|---|
| `login.html`, `login.css`, `login.js` | Tela de entrada com perfis fictícios |
| `index.html` | Estrutura principal da aplicação |
| `style.css`, `theme.js` | Estilos responsivos e temas |
| `app.js` | Busca, navegação, regras e interações |
| `data.js` | Base de dados demonstrativa |
| `manifest.webmanifest` | Metadados da aplicação web |

## 🐞 Como relatar um problema

Abra uma **Issue** no GitHub e informe:

```text
Título: [BUG] Descrição curta

Dispositivo e navegador:
Ex.: Galaxy S20 FE / Chrome

Passos para reproduzir:
1.
2.
3.

Resultado esperado:

Resultado observado:

Captura de tela (se possível):
```

**Não publique CPF, CNS, receitas, dados médicos ou senhas reais nas Issues.**

---

**Farmácia Certa DF — Seu cuidado, mais simples.**  
Projeto acadêmico demonstrativo, sem vínculo oficial com o SUS, gov.br ou redes comerciais mencionadas.
