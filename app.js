"use strict";
// Demonstração local: dados fictícios. Sem autenticação real, API SUS ou validação clínica.
const $ = (id) => document.getElementById(id);
const app = {
  page: "inicio",
  selected: [],
  query: "",
  hour: 10,
  admin: false,
  unit: 1,
  patient: null,
  font: 0,
  easy: true, // Consulta acessível igual para todos; não existe alternância de modo.
  showAllEasy: false,
  filter: "todos",
  recipe: null,
};
const KEY = "farmacia-certa-df-v4";
// Apenas perfis locais fictícios. Nunca solicitar CPF ou senha do gov.br.
const initial = {
  stocks: S,
  units: U,
  movements: MOV,
  dispensations: DISP,
  patients: PAC,
};
function readState() {
  try {
    const x = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!x) return;
    if (x.stocks && typeof x.stocks === "object") Object.assign(S, x.stocks);
    if (Array.isArray(x.units))
      x.units.forEach((p) => {
        const u = U.find((u) => u.id === p.id);
        if (u) Object.assign(u, p);
      });
    if (Array.isArray(x.movements)) MOV.splice(0, MOV.length, ...x.movements);
    if (Array.isArray(x.dispensations))
      DISP.splice(0, DISP.length, ...x.dispensations);
    if (Array.isArray(x.patients)) {
      PAC.splice(0, PAC.length, ...x.patients);
    }
  } catch (e) {
    console.warn("Dados locais não puderam ser carregados", e);
  }
}
function save() {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        stocks: S,
        units: U,
        movements: MOV,
        dispensations: DISP,
        patients: PAC,
      }),
    );
  } catch (e) {
    toast("Não foi possível guardar os dados neste navegador.");
  }
}
readState();
// Receitas de exemplo individualizadas por cadastro, usando registros fictícios já existentes.
for (const person of PAC) {
  if (!Array.isArray(person.rx)) {
    const rows = DISP.filter((d) => d[1] === person.id);
    const items = rows.length
      ? rows.map((d) => Number(d[2]))
      : [M[(Number(person.id.slice(1)) - 1) % M.length].id];
    person.rx = items.map((m, i) => ({
      m,
      d: Date.now() - (i + 2) * 86400000,
      pre: "Profissional fictício · demonstração",
    }));
  }
}
try {
  if (sessionStorage.getItem("fcdf-demo-access") === "yes") {
    const pid = sessionStorage.getItem("fcdf-demo-profile");
    app.patient = PAC.find((p) => p.id === pid) || null;
  }
} catch (e) {}
// Única navegação: fluxo de consulta simplificado para qualquer idade.
// O tamanho do texto continua ajustável como recurso de acessibilidade.
const FONT_PREFIX = "fcdf-font-px:";
const fontKey = () => FONT_PREFIX + (app.patient?.id || "visitante");
let textPx = 16;
function initPreferences() {
  try {
    const raw=localStorage.getItem(fontKey());
    const n=Number(raw);
    textPx=raw!==null && n>=16 && n<=28 && n%2===0 ? n : 16;
  } catch (e) { textPx=16; }
  applyPreferences();
}
function applyPreferences() {
  document.documentElement.style.fontSize=`${textPx}px`;
  const text=document.querySelector(".account-shortcut");
  if (text) text.textContent=app.patient ? "♙ " + app.patient.n.split(" ")[0] : "♙ Minha conta";
}
function adjustText(delta) {
  textPx = Math.min(28, Math.max(16, textPx + delta));
  try { localStorage.setItem(fontKey(), String(textPx)); } catch (e) {}
  applyPreferences();
  toast("Tamanho das letras ajustado.");
}
function readPage() {
  if (!("speechSynthesis" in window)) {
    toast("Leitura em voz alta não está disponível neste navegador.");
    return;
  }
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    toast("Leitura interrompida.");
    return;
  }
  const content = $("content")?.innerText?.slice(0, 4200) || "";
  if (!content.trim()) return;
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = "pt-BR";
  utterance.rate = 0.88;
  speechSynthesis.speak(utterance);
  toast("Lendo as informações da página. Toque em Ouvir para interromper.");
}
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const med = (id) => M.find((x) => x.id === Number(id));
const unit = (id) => U.find((x) => x.id === Number(id));
const datefmt = (t) =>
  new Date(t).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
const days = (t) => Math.floor((Date.now() - t) / 864e5);
const ago = (t) => (t ? datefmt(t) : "sem atualização");
const badge = (kind, label) =>
  `<span class="status ${kind.toLowerCase()}">${esc(label || kind)}</span>`;
const fmtH = (x) =>
  x
    ? x.map((v) => String(v).padStart(2, "0") + "h").join(" às ")
    : "não informado";
const fmtHour = (v) => String(v).padStart(2, "0") + "h";
const hasPh = (u) =>
  !!(u.phOn && u.ph && app.hour >= u.ph[0] && app.hour < u.ph[1]);
const closed = (u) => {
  if (u.closure?.active) return u.closure.reason || "Fechamento temporário";
  if (!u.ph) return "Farmácia sem horário cadastrado";
  if (app.hour < u.ph[0] || app.hour >= u.ph[1])
    return "Fora do horário da farmácia";
  const [a, b] = u.break || [];
  if (Number.isFinite(a) && app.hour >= a && app.hour < b)
    return "Intervalo de almoço";
  return "";
};
const isOpen = (u) => !closed(u) && app.hour >= u.h[0] && app.hour < u.h[1];
const workHours = (u) => {
  if (!u.ph) return 0;
  const base = Math.max(0, (u.ph[1] || 0) - (u.ph[0] || 0));
  const rest =
    u.break && Number.isFinite(u.break[0]) && Number.isFinite(u.break[1])
      ? Math.max(0, u.break[1] - u.break[0])
      : 0;
  return Math.max(0, base - rest);
};
const reduced = (u) => workHours(u) < 8;
const scheduleText = (u) => {
  if (!u.ph) return "Horário não informado";
  const start = u.ph[0],
    end = u.ph[1];
  if (u.break && Number.isFinite(u.break[0]) && Number.isFinite(u.break[1]))
    return `${fmtHour(start)} às ${fmtHour(u.break[0])} • ${fmtHour(u.break[1])} às ${fmtHour(end)}`;
  return fmtH(u.ph);
};
const breakText = (u) =>
  u.break
    ? `${fmtHour(u.break[0])} às ${fmtHour(u.break[1])}`
    : "Sem intervalo cadastrado";
const mapsLink = (u) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(u.addr || u.loc || u.ra || u.n)}`;
function stock(m, u) {
  const x = S[`${m.id}-${u.id}`];
  if (!x)
    return {
      kind: "cinza",
      label: "Sem informação",
      msg: "Não existe informação de estoque para esta unidade. Confirme antes de sair.",
    };
  if (x.q <= 0)
    return {
      kind: "vermelho",
      label: "Indisponível",
      msg: "Unidade informou estoque zerado.",
      x,
    };
  if ((Date.now() - x.t) / 36e5 > STALE)
    return {
      kind: "amarelo",
      label: "Desatualizado",
      msg: "Estoque com mais de 48 horas sem confirmação. Telefone antes de ir.",
      x,
    };
  return {
    kind: "verde",
    label: "Informado disponível",
    msg: "Saldo fictício informado. Não constitui reserva nem garantia de entrega.",
    x,
  };
}
function supply(m, u) {
  return m.s.includes(u.t);
}
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.style.display = "none"), 3500);
}
function route(p) {
  app.page = p;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  $("content")?.focus({ preventScroll: true });
}
function render() {
  applyPreferences();
  document.querySelectorAll("[data-nav]").forEach((b) => {
    const on = b.dataset.nav === app.page;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const views = {
    inicio,
    consulta,
    receitas,
    unidades,
    ajuda,
    farmacia,
    integracoes,
    sobre,
    acesso,
  };
  $("content").innerHTML = (views[app.page] || inicio)();
  $("global-search").value=app.query;
  bindView();
  if (app.page==="consulta") loadMedicinePhotos();
}
function homeTile(name, title, description, page, isPrimary = false) {
  return `<button class="health-tile ${isPrimary ? "featured" : ""}" data-nav="${page}">
    <span class="health-icon">${fcIcon(name)}</span>
    <span class="health-tile-label"><b>${title}</b><small>${description}</small></span>
    <span class="tile-chevron" aria-hidden="true">${fcIcon("chevron")}</span>
  </button>`;
}
function inicio() {
  const person = app.patient ? `, ${esc(app.patient.n.split(" ")[0])}` : "";
  return `<section class="hero home-hero">
    <div><span class="hero-eyebrow">FARMÁCIA CERTA DF · DEMONSTRAÇÃO</span>
    <h1>Olá${person}! Como podemos ajudar?</h1>
    <p>Consulte um medicamento, confira o horário e veja o caminho até a farmácia antes de sair de casa.</p>
    <button class="btn hero-cta" data-nav="consulta">${fcIcon("search")} Procurar meu remédio ${fcIcon("chevron")}</button>
    </div><div class="hero-art" aria-hidden="true">${fcIcon("pill")}</div>
  </section>
  <section class="home-options" aria-labelledby="actions-heading">
    <h2 class="section-title" id="actions-heading">O que você precisa hoje?</h2>
    <p class="sub">Toque em uma opção para começar. Você não precisa se cadastrar para consultar.</p>
    <div class="health-grid">
      ${homeTile("pill", "Procurar remédio", "Onde encontrar e disponibilidade", "consulta", true)}
      ${homeTile("clock", "Horários e locais", "Veja atendimento e rota", "unidades")}
      ${homeTile("prescription", "Conferir receita", "Orientação sobre documentos", "receitas")}
      ${homeTile("help", "Preciso de ajuda", "Instruções passo a passo", "ajuda")}
    </div>
  </section>
  <section class="help-banner"><span class="help-banner-icon">${fcIcon("info")}</span><div><b>Atenção: este é um protótipo.</b>
    <p>Medicamentos, estoques e horários são simulados. Confirme tudo com a unidade antes de ir.</p></div>
    <button class="btn sm" data-nav="sobre">Entenda a simulação</button></section>
  <section class="panel extras-panel"><h2>Mais recursos da demonstração</h2><div class="inline-actions">
  <button class="btn sm" data-nav="farmacia">${fcIcon("store")} Área da farmácia</button>
  <button class="btn sm" data-nav="integracoes">${fcIcon("hospital")} Bases simuladas</button>
  <button class="btn sm" data-nav="acesso">${fcIcon("account")} Minha conta</button>
  </div></section>`;
}
function easyConsulta() {
  const opts=findMedMatches(app.query,8).map(x=>x.med).filter(m=>!app.selected.includes(m.id));
  return `<div class="easy-flow"><button class="back-home" data-nav="inicio">← Voltar ao início</button>
    <section class="panel"><h1>${fcIcon("pill")} Qual remédio você procura?</h1>
      <p>Digite o remédio ou toque em <b>Falar</b>.</p>
      <label for="medicine-search" class="strong-label">Nome do remédio</label>
      <div class="searchline medicine-searchline"><div class="medicine-input-wrap">
        <input id="medicine-search" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" spellcheck="false" aria-controls="suggestions" placeholder="Ex.: Dipirona" value="${esc(app.query)}" />
        <button class="btn voice-easy" type="button" data-action="voice" aria-label="Falar o nome do remédio" aria-pressed="false">${fcIcon("mic")} <span>Falar</span></button>
      </div></div>
      <div id="suggestions" class="suggestions" aria-label="Sugestões de remédios" aria-live="polite">${suggestions(opts)}</div>
      <div class="tags">${app.selected.map(id=>`<span class="tag">${esc(med(id)?.n || "")} ${esc(med(id)?.c || "")}<button data-action="remove-med" data-id="${id}" aria-label="Remover medicamento">×</button></span>`).join("")}</div>
      ${app.selected.length ? `<div class="selected-medicine-images">${app.selected.map(id=>med(id)).filter(Boolean).map(m=>`<div class="selected-medicine">${medPhotoMarkup(m)}<div><b>${esc(m.n)}</b><p class="small muted">${esc(m.c)} · ${esc(m.f)}. Confira o nome e a apresentação na receita.</p></div></div>`).join("")}</div>` : ""}
      <button class="btn primary easy-search-btn" data-action="search">${fcIcon("search")} Procurar nas farmácias</button>
      <p class="small muted">Você pode escolher mais de um remédio. Estoques e horários são fictícios.</p>
    </section>
    <section class="panel"><label class="strong-label" for="source-filter">Quais farmácias você quer ver?</label>
    <select id="source-filter"><option value="todos" ${app.filter === "todos" ? "selected" : ""}>Todas</option><option value="publicas" ${app.filter === "publicas" ? "selected" : ""}>Unidades SUS</option><option value="comerciais" ${app.filter === "comerciais" ? "selected" : ""}>Farmácias comerciais</option></select>
    <label class="strong-label" for="hour">Qual horário você quer simular?</label>
    <select id="hour">${[8,10,11,12,13,15,18,21].map(h=>`<option value="${h}" ${app.hour===h?"selected":""}>${String(h).padStart(2,"0")}h</option>`).join("")}</select>
    <p class="small muted">O horário mostrado não é o horário real de hoje.</p></section>
    <div id="results" aria-live="polite">${app.selected.length ? results() : ""}</div>
  </div>`;
}
function consulta() { return easyConsulta(); }
function suggestions(opts) {
  if (app.query.trim().length < 2) return "";
  return opts.length
    ? `<p class="small suggestion-intro">Selecione o remédio correto:</p>` + opts.map(m=>
        `<button data-action="add-med" data-id="${m.id}">${fcIcon("pill")} <span><b>${esc(m.n)}</b><small>${esc(m.c)} · ${esc(m.f)}</small></span></button>`).join("")
    : '<p class="small muted">Não encontrei esse remédio na lista de demonstração. Verifique o nome.</p>';
}
function resultItem(m, u) {
  const s = stock(m, u);
  return `<div class="item"><b>${esc(m.n)} · ${esc(m.c)} · ${esc(m.f)}</b>${badge(s.kind, s.label)} <span class="small muted">${esc(s.msg)}</span>${s.x ? `<div class="small muted">Saldo fictício: ${s.x.q} · lote ${esc(s.x.lote)} · atualizado em ${ago(s.x.t)}</div>` : ""}<div class="small muted">Documentação: ${esc(m.rq)}</div></div>`;
}
function easyResults() {
  const selected = app.selected.map(med).filter(Boolean);
  if (!selected.length) return "";
  const items = U.filter(u=>app.filter === "todos" || (app.filter === "comerciais" ? u.comercial : !u.comercial))
    .map(u=>({u, matches:selected.filter(m=>supply(m,u))})).filter(x=>x.matches.length)
    .sort((a,b)=>{
      const good = x=>x.matches.filter(m=>stock(m,x.u).kind==="verde").length;
      const ready = x=>Number(x.matches.length === selected.length && good(x) === selected.length && isOpen(x.u));
      return ready(b)-ready(a) || good(b)-good(a) || b.matches.length-a.matches.length;
    });
  const visible = app.showAllEasy ? items : items.slice(0, 5);
  return `<div class="easy-results"><h2>${fcIcon("hospital")} Farmácias encontradas (${items.length})</h2>
  <div class="alert info">Consulta feita para as ${String(app.hour).padStart(2,"0")}h (horário simulado). Não representam estoque ou funcionamento real.</div>
  ${visible.map(({u,matches})=>`<article class="easy-unit panel">
    <h3>${esc(u.n)}</h3>
    <p><b>${fcIcon("clock")} Horário:</b> ${esc(scheduleText(u))}</p>
    ${closed(u) ? `<div class="alert">${fcIcon("alert")} Sem atendimento no horário simulado: ${esc(closed(u))}</div>` : `<p class="easy-open">${fcIcon("check")} Atendimento no horário simulado</p>`}
    <div class="easy-medications">${matches.map(m=>`<div class="easy-med"><b>${esc(m.n)} ${esc(m.c)}</b><div>${badge(stock(m,u).kind,stock(m,u).label)}</div></div>`).join("")}</div>
    <p class="small muted">${esc(u.addr || u.loc || u.ra)}</p>
    <div class="easy-actions"><button class="btn primary" data-action="route-link" data-id="${u.id}">${fcIcon("route")} Ver rota</button>
    <button class="btn" data-action="whatsapp" data-id="${u.id}">${fcIcon("chat")} WhatsApp</button>
    <button class="btn" data-action="guide" data-id="${u.id}">${fcIcon("info")} Antes de ir</button></div>
  </article>`).join("") || `<div class="panel">Nenhuma unidade da simulação fornece este medicamento.</div>`}
  ${!app.showAllEasy && items.length > 5 ? `<button class="btn" data-action="show-more-units">Mostrar outras ${items.length - 5} unidades</button>` : ""}
  <button class="btn" data-action="reset-search">${fcIcon("search")} Fazer nova pesquisa</button></div>`;
}
function results() {
  if (app.easy) return easyResults();
  const selected = app.selected.map(med).filter(Boolean);
  const units = U.filter(
    (u) =>
      app.filter === "todos" ||
      (app.filter === "comerciais" ? u.comercial : !u.comercial),
  )
    .map((u) => {
      const matched = selected.filter((m) => supply(m, u));
      const complete = matched.length === selected.length;
      const fresh = matched.filter((m) => stock(m, u).kind === "verde").length;
      const ready =
        complete &&
        fresh === selected.length &&
        isOpen(u) &&
        (!matched.some((m) =>
          ["controlado", "antibiótico", "especializado"].includes(m.cat),
        ) ||
          hasPh(u));
      return { u, matched, complete, fresh, ready };
    })
    .filter((v) => v.matched.length)
    .sort(
      (a, b) =>
        Number(b.ready) - Number(a.ready) ||
        Number(b.complete) - Number(a.complete) ||
        b.fresh - a.fresh,
    );
  const full = units.filter((x) => x.complete),
    ready = units.filter((x) => x.ready);
  return `<section class="panel"><div class="row space-between"><h2>Onde encontrar seus medicamentos</h2><label class="small">Hora demonstrativa <select id="hour" aria-label="Hora simulada">${[8, 10, 11, 12, 13, 15, 18, 21].map((h) => `<option value="${h}" ${app.hour === h ? "selected" : ""}>${h}h</option>`).join("")}</select></label></div><p class="sub">${selected.length} item(ns) · ${full.length} unidade(s) fornecem todos os itens · ${ready.length} unidade(s) reúnem condições favoráveis na simulação.</p><div class="alert info">Endereços de estabelecimentos reais (confirme no mapa); horários, farmacêuticos e estoques são simulados. Nenhuma retirada está garantida.</div></section>${
    units.length
      ? units
          .map((v) => {
            const u = v.u;
            const need = v.matched.some(
              (m) =>
                m.cat === "antibiótico" ||
                m.cat === "controlado" ||
                m.cat === "especializado",
            );
            return `<article class="panel"><div class="unit-top"><h3>${esc(u.n)}</h3>${badge(v.ready ? "verde" : v.complete ? "amarelo" : "cinza", v.ready ? "Melhor condição" : v.complete ? "Todos os itens" : "Parcial")}</div><p class="small muted">${esc(u.ra)} · ${esc(u.t)} · ${u.comercial ? "REDE COMERCIAL · FILIAL E ESTOQUE FICTÍCIOS" : "CNES fictício " + esc(u.cnes)}</p><p class="small"><b>Endereço:</b> ${esc(u.addr || u.loc || u.ra)}</p><p class="small"><b>Horário:</b> ${scheduleText(u)}</p><p class="small muted"><b>Almoço:</b> ${breakText(u)} · <b>Carga diária:</b> ${workHours(u)}h ${reduced(u) ? "· horário reduzido" : ""}</p><p>${badge(isOpen(u) ? "verde" : "vermelho", isOpen(u) ? "Aberta no horário simulado" : "Fechada no horário simulado")} ${badge(hasPh(u) ? "verde" : "amarelo", hasPh(u) ? "Farmacêutico confirmado" : "Farmacêutico não confirmado")}</p>${closed(u) ? `<div class="alert">Motivo no horário simulado: ${esc(closed(u))}.</div>` : ""}${reduced(u) ? '<div class="alert info">Esta unidade tem atendimento em horário reduzido na simulação.</div>' : ""}${need && !hasPh(u) ? '<div class="alert">Algum medicamento exige conferência farmacêutica. Confirme o atendimento antes do deslocamento.</div>' : ""}${v.matched.map((m) => resultItem(m, u)).join("")}${
              !v.complete
                ? `<p class="small muted"><b>Não fornece:</b> ${selected
                    .filter((m) => !supply(m, u))
                    .map((m) => esc(m.n))
                    .join(", ")}</p>`
                : ""
            }<div class="inline-actions"><button class="btn primary sm" data-action="guide" data-id="${u.id}">Ver orientações de retirada</button><button class="btn sm" data-action="whatsapp" data-id="${u.id}">Compartilhar no WhatsApp</button><button class="btn sm" data-action="route-link" data-id="${u.id}">Ver rota</button></div></article>`;
          })
          .join("")
      : '<div class="panel empty">Nenhuma unidade cadastrada fornece os itens escolhidos.</div>'
  }`;
}
function guide(id) {
  const u = unit(id),
    items = app.selected.map(med).filter((m) => supply(m, u)),
    notice = items.some((m) => m.cat === "especializado");
  return `<div class="panel summary"><h2>Antes de sair para ${esc(u.n)}</h2><div class="step"><b>1. Confirme a disponibilidade</b>Os estoques deste protótipo são fictícios. Consulte o canal oficial da unidade antes de se deslocar.</div><div class="step"><b>2. Confira o horário</b>${scheduleText(u)}. Intervalo de almoço: ${breakText(u)}. ${closed(u) ? "No horário simulado: " + esc(closed(u)) + "." : "Farmácia pode estar atendendo no horário simulado."} ${reduced(u) ? "Esta unidade possui horário reduzido na simulação." : ""}</div><div class="step"><b>3. Veja a localização</b>${esc(u.addr || u.loc || u.ra)}. <a href="${mapsLink(u)}" target="_blank" rel="noopener">Abrir rota no mapa</a>.</div><div class="step"><b>4. Separe documentos</b>Documento de identificação, receita aplicável e Cartão SUS quando solicitado pelo serviço. ${notice ? "Para medicamento especializado, verificar laudos, formulários e cadastro exigidos." : ""} Se outra pessoa for retirar, confirmar autorização e documentos necessários diretamente com a unidade.</div><div class="step"><b>5. Atenção à receita</b>O farmacêutico deve avaliar validade, tipo de receituário, prescrição e critérios de dispensação.</div><div class="inline-actions"><button class="btn" data-action="whatsapp" data-id="${u.id}">Enviar resumo no WhatsApp</button><button class="btn" data-action="route-link" data-id="${u.id}">Ver rota</button><button class="btn" data-action="back-results">Voltar aos resultados</button></div></div>`;
}
// Prazos abaixo representam CENÁRIOS DO DESAFIO, não validação normativa.
const recipeRules = {
  comum: 180,
  continuo: 180,
  antibiotico: 10,
  antibioticoContinuo: 90,
  controlado: 30,
  especializado: 90,
};
function recipeCheck(r) {
  const m = med(r.medId);
  if (!m) return { issues: ["Escolha um medicamento."] };
  const rules = {
    comum: "Receita simples",
    continuo: "Receita simples",
    antibiotico: "Receita com retenção",
    antibioticoContinuo: "Receita com retenção",
    controlado: "Controle especial",
    especializado: "Laudo + formulário",
  };
  const issues = [];
  if (r.kind === "continuo" && m.cat !== "comum")
    issues.push(
      "Uso contínuo comum selecionado para categoria diferente; confirmar com farmacêutico.",
    );
  if (r.kind === "antibioticoContinuo" && m.cat !== "antibiótico")
    issues.push(
      "Antibiótico contínuo selecionado para medicamento de outra categoria.",
    );
  if (
    (r.kind === "antibiotico" || r.kind === "antibioticoContinuo") &&
    m.cat !== "antibiótico"
  )
    issues.push("Categoria do medicamento não corresponde a antibiótico.");
  if (r.kind === "controlado" && m.cat !== "controlado")
    issues.push("Categoria do medicamento não corresponde a controlado.");
  if (r.kind === "especializado" && m.cat !== "especializado")
    issues.push("Categoria do medicamento não corresponde a especializado.");
  if (!r.date) issues.push("Data de emissão não preenchida.");
  else {
    const d = new Date(r.date + "T12:00:00").getTime();
    if (Number.isNaN(d)) issues.push("Data de emissão inválida.");
    else if (d > Date.now()) issues.push("Data de emissão no futuro.");
    else if (days(d) > recipeRules[r.kind])
      issues.push(
        `Prazo demonstrativo excedido (${recipeRules[r.kind]} dias).`,
      );
  }
  if (r.type !== rules[r.kind])
    issues.push(`Receituário esperado na simulação: ${rules[r.kind]}.`);
  if (!r.prescriber) issues.push("Identificação do prescritor não informada.");
  if (!r.qty || Number(r.qty) <= 0)
    issues.push("Quantidade precisa ser maior que zero.");
  if (
    r.concentration &&
    r.concentration.trim().toLowerCase() !== m.c.toLowerCase()
  )
    issues.push(`Concentração diferente da apresentação cadastrada (${m.c}).`);
  return { issues, m };
}
function acesso() {
  const p = app.patient;
  return `<section class="panel account-panel"><h1>${fcIcon("account")} Minha conta</h1>
  <div class="alert info">Ambiente demonstrativo, sem gov.br e sem dados de pacientes reais.</div>
  ${p ? `<h2>Olá, ${esc(p.n.split(" ")[0])}!</h2><p>Perfil fictício: ${esc(p.id)}.</p>
    <div class="inline-actions"><button class="btn primary" data-nav="receitas">${fcIcon("prescription")} Minhas receitas de exemplo</button>
    <button class="btn" data-action="logout">${fcIcon("logout")} Sair da conta</button></div>` :
    `<h2>Você está navegando como visitante.</h2><p>É possível consultar medicamentos, horários, rotas e orientações sem criar cadastro.</p>
    <div class="inline-actions"><a class="btn primary" href="login.html">${fcIcon("account")} Entrar ou criar perfil fictício</a>
    <button class="btn" data-nav="consulta">${fcIcon("search")} Continuar sem cadastro</button></div>`}
  </section>`;
}
function receitas() {
  const p = app.patient;
  return `<section class="panel"><h2>Minhas receitas</h2><div class="alert info">Demonstração. Não há acesso ao gov.br, CADSUS ou RNDS reais. Não digite CPF, CNS ou receitas verdadeiros.</div>${p ? `<div class="row space-between"><div><b>Olá, ${esc(p.n.split(" ")[0])}!</b><div class="small muted">Paciente fictício ${esc(p.id)} · CNS demonstrativo mascarado</div></div><button class="btn sm" data-action="logout">Sair</button></div>${(p.rx || []).map((r) => `<div class="item"><b>${esc(med(r.m)?.n || "Medicamento")} ${esc(med(r.m)?.c || "")}</b><span class="small muted">Receita simulada · ${datefmt(r.d)} · ${esc(r.pre)}</span><div><button class="btn sm" data-action="add-med" data-id="${r.m}">Ver onde encontrar</button></div></div>`).join("")}` : `<div class="auth-invite"><div><b>Suas receitas em um só lugar</b><p class="sub">Use um perfil fictício para visualizar prescrições de exemplo. Nenhum dado real é utilizado.</p></div><button class="btn primary" data-nav="acesso">Entrar — simulação de acesso</button></div>`}</section><section class="panel"><h2>Conferir requisitos de uma receita</h2><p class="sub">Prazos configurados apenas para demonstrar os cenários citados no desafio. A validade legal depende do medicamento, receituário e regras vigentes.</p><form id="recipe-form"><div class="two-col"><div class="field"><label for="rx-med">Medicamento</label><select id="rx-med" name="medId">${M.map((m) => `<option value="${m.id}">${esc(m.n)} ${esc(m.c)}</option>`).join("")}</select></div><div class="field"><label for="rx-kind">Categoria da prescrição</label><select id="rx-kind" name="kind"><option value="comum">Comum (cenário: 6 meses)</option><option value="continuo">Uso contínuo comum (6 meses)</option><option value="antibiotico">Antibiótico (10 dias)</option><option value="antibioticoContinuo">Antibiótico contínuo (3 meses)</option><option value="controlado">Controlado (30 dias)</option><option value="especializado">Especializado (exemplo: 90 dias)</option></select></div><div class="field"><label for="rx-type">Receituário apresentado</label><select id="rx-type" name="type"><option>Receita simples</option><option>Receita com retenção</option><option>Controle especial</option><option>Laudo + formulário</option></select></div><div class="field"><label for="rx-date">Data de emissão</label><input type="date" id="rx-date" name="date" value="${new Date().toLocaleDateString("en-CA")}"></div><div class="field"><label for="rx-conc">Concentração (opcional)</label><input id="rx-conc" name="concentration" placeholder="Ex.: 50 mg"></div><div class="field"><label for="rx-qty">Quantidade prescrita</label><input id="rx-qty" name="qty" type="number" min="1" value="30"></div></div><div class="field checkbox"><label><input type="checkbox" name="prescriber" checked> Prescritor identificado com nome e registro</label></div><div class="field"><label for="rx-photo">Foto da receita (opcional e não analisada)</label>
<input id="rx-photo" type="file" accept="image/*" capture="environment" aria-describedby="photo-info">
<p class="small muted" id="photo-info">A foto não é enviada nem armazenada. O protótipo não faz leitura automática.</p></div>
<button class="btn primary" type="submit">${fcIcon("prescription")} Ver orientação sobre a receita</button></form><div id="rx-output">${app.recipe || ""}</div></section>`;
}
function unidades() {
  return `<h1>Unidades participantes da simulação</h1><p class="sub">Localizações baseadas em estabelecimentos reais do DF. Horários de almoço, disponibilidade e estoques são simulados; confirme antes de ir.</p><div class="panel row"><label for="hour">Horário simulado</label><select id="hour">${[8, 10, 11, 12, 13, 15, 18, 21].map((h) => `<option ${app.hour === h ? "selected" : ""} value="${h}">${h}h</option>`).join("")}</select></div><div class="grid">${U.map((u) => `<article class="panel"><h3>${esc(u.n)}</h3><p class="small muted">${esc(u.ra)} · ${esc(u.t)} · ${u.comercial ? "REDE COMERCIAL · FILIAL FICTÍCIA" : "CNES fictício " + esc(u.cnes)}</p><p class="small"><b>Localização:</b> ${esc(u.addr || u.loc || u.ra)}</p><p class="small"><b>Horário:</b> ${scheduleText(u)}</p><p class="small muted"><b>Almoço:</b> ${breakText(u)} · <b>Carga diária:</b> ${workHours(u)}h ${reduced(u) ? "· horário reduzido" : ""}</p>${badge(isOpen(u) ? "verde" : "vermelho", isOpen(u) ? "Atendimento no horário simulado" : "Sem atendimento no horário simulado")}${closed(u) ? `<p class="small">Motivo: ${esc(closed(u))}</p>` : '<p class="small">Sem fechamento cadastrado para este horário.</p>'}${reduced(u) ? '<div class="alert info">Horário reduzido nesta unidade.</div>' : ""}<div class="inline-actions"><button class="btn sm" data-action="unit-consult" data-id="${u.id}">Consultar medicamentos</button><button class="btn sm" data-action="route-link" data-id="${u.id}">Ver rota</button></div></article>`).join("")}</div>`;
}
function ajuda() {
  return `<section class="panel"><h2>Precisa de ajuda?</h2><p>Este protótipo mostra dados simulados e não realiza venda, reserva ou dispensação.</p><div class="step"><b>Como consultar?</b>Pesquise um medicamento, adicione os itens desejados e clique em “Ver unidades e disponibilidade”.</div><div class="step"><b>O estoque está verde. Posso ir buscar?</b>Não necessariamente. Confira o horário da farmácia, a presença do farmacêutico, a documentação e a disponibilidade junto à unidade oficial.</div><div class="step"><b>Outra pessoa pode retirar por mim?</b>Depende das exigências do serviço e do medicamento. Consulte previamente a unidade quanto a documento do paciente, representante e autorização.</div><div class="step"><b>Como conferir a receita?</b>Abra “Minhas receitas” e use a verificação demonstrativa. Ela não tem valor de aprovação.</div><div class="inline-actions"><button class="btn primary" data-nav="consulta">Pesquisar medicamento</button><button class="btn" data-nav="receitas">Conferir receita</button></div></section><section class="panel"><h3>Acessibilidade</h3><p>Botões amplos, labels para formulários, navegação por teclado e ajuste de tamanho de texto. A busca por voz depende do navegador e da permissão de microfone.</p><button class="btn" id="font-inline">Aumentar texto (Aa+)</button></section>`;
}
function farmacia() {
  if (!app.admin)
    return `<section class="panel"><h2>Área da farmácia</h2><div class="alert">Acesso local de demonstração. Usuário: <b>admin</b> · senha: <b>demo123</b>. Não é autenticação segura e não deve ser usado com dados reais.</div><form id="login-form"><div class="field"><label for="username">Usuário</label><input id="username" name="username" autocomplete="off" required></div><div class="field"><label for="password">Senha</label><input id="password" name="password" type="password" required></div><button class="btn primary" type="submit">Entrar na simulação</button></form></section>`;
  const u = unit(app.unit);
  return `<div class="row space-between"><h1>Gestão da farmácia</h1><button class="btn sm" data-action="admin-logout">Sair</button></div><div class="alert info">Movimentações desta demonstração ficam somente neste navegador (localStorage). Não há transmissão a BNAFAR ou RNDS.</div><section class="panel"><div class="field"><label for="admin-unit">Unidade</label><select id="admin-unit">${U.map((x) => `<option value="${x.id}" ${x.id === u.id ? "selected" : ""}>${esc(x.n)}</option>`).join("")}</select></div><h3>Atendimento e fechamentos</h3><div class="two-col"><div class="field checkbox"><label><input type="checkbox" id="ph-on" ${u.phOn ? "checked" : ""}> Farmacêutico presente</label></div><div class="field checkbox"><label><input type="checkbox" id="closure-on" ${u.closure?.active ? "checked" : ""}> Farmácia temporariamente fechada</label></div><div class="field"><label for="closure-reason">Motivo</label><select id="closure-reason"><option value="Inventário mensal" ${u.closure?.reason === "Inventário mensal" ? "selected" : ""}>Inventário mensal</option><option value="Recebimento de medicamentos" ${u.closure?.reason === "Recebimento de medicamentos" ? "selected" : ""}>Recebimento de medicamentos</option><option value="Intercorrência no atendimento">Intercorrência no atendimento</option></select></div><div class="field"><label for="break-start">Intervalo de almoço (início)</label><select id="break-start"><option value="">Sem intervalo</option>${[11, 12, 13, 14].map((h) => `<option value="${h}" ${u.break?.[0] === h ? "selected" : ""}>${h}h</option>`).join("")}</select></div><div class="field"><label for="break-end">Intervalo de almoço (fim)</label><select id="break-end"><option value="">Sem intervalo</option>${[12, 13, 14, 15].map((h) => `<option value="${h}" ${u.break?.[1] === h ? "selected" : ""}>${h}h</option>`).join("")}</select></div></div><button class="btn primary" data-action="save-hours">Salvar horários e status</button></section><section class="panel"><h3>Atualizar estoque</h3><div class="table-scroll"><table class="admin-table"><thead><tr><th>Medicamento</th><th>Saldo</th><th>Última atualização</th><th>Novo saldo</th><th>Salvar</th><th>Movimentar</th></tr></thead><tbody>${M.filter(
    (m) => supply(m, u),
  )
    .map((m) => {
      const s = S[`${m.id}-${u.id}`];
      return `<tr><td>${esc(m.n)} ${esc(m.c)}</td><td>${s?.q ?? "—"}</td><td>${s ? ago(s.t) : "sem registro"}</td><td><input type="number" min="0" id="stock-${m.id}" aria-label="Novo saldo ${esc(m.n)}" value="${s?.q ?? 0}"></td><td><button class="btn sm" data-action="save-stock" data-id="${m.id}">Salvar</button></td><td><button class="btn sm" data-action="entry" data-id="${m.id}">+10</button> <button class="btn sm" data-action="exit" data-id="${m.id}">−5</button></td></tr>`;
    })
    .join(
      "",
    )}</tbody></table></div></section><section class="panel"><h3>Movimentações recentes</h3><div class="table-scroll"><table><thead><tr><th>Quando</th><th>Operação</th><th>Medicamento</th><th>Quantidade</th><th>Operador</th></tr></thead><tbody>${MOV.filter(
    (x) => x[3] === u.id,
  )
    .slice(0, 15)
    .map(
      (x) =>
        `<tr><td>${datefmt(x[0])}</td><td>${esc(x[1])}</td><td>${esc(med(x[2])?.n || "?")}</td><td>${x[4]}</td><td>${esc(x[5])}</td></tr>`,
    )
    .join("")}</tbody></table></div></section>`;
}
function integracoes() {
  return `<h1>Central de integrações simuladas</h1><div class="alert">CADSUS, BNAFAR, RNDS, CNES, REME e InfoSaúde são representados por dados locais fictícios. Nenhuma integração real com DATASUS, SES-DF ou gov.br.</div><div class="grid">${Object.entries(
    SRC,
  )
    .map(
      ([k, v]) =>
        `<article class="panel"><h3>${esc(k)}</h3><p>${esc(v.f)}</p>${badge("cinza", "Mock / demonstração")}<p class="small muted">Registros da base: ${k === "BNAFAR" ? MOV.length : k === "CADSUS" ? PAC.length : k === "RNDS" ? DISP.length : v.p}. Sem conexão externa.</p></article>`,
    )
    .join(
      "",
    )}</div><div class="panel"><h3>Arquitetura prevista para implantação futura</h3><p>Aplicação web responsiva → API autenticada → adaptadores de dados autorizados → banco de dados. Integrações reais exigem autorização, segurança, políticas de privacidade e homologação.</p><p class="small muted">Rastreabilidade fictícia: ${MOV.length} movimentações locais e ${DISP.length} registros de dispensação de demonstração. Não representam pacientes reais.</p></div>`;
}
function sobre() {
  return `<section class="panel"><h2>Sobre o Farmácia Certa DF</h2><p>Projeto demonstrativo criado para abordar o desafio de facilitar a descoberta da disponibilidade de medicamentos nas farmácias públicas do Distrito Federal.</p><p><b>Fontes representadas:</b> CADSUS (cadastro fictício), CNES (unidades fictícias), REME (catálogo fictício), BNAFAR (estoques e movimentações fictícios), RNDS (registros de dispensação fictícios), InfoSaúde (serviços e horários fictícios) e gov.br (fluxo apenas conceitual).</p><p><b>Privacidade:</b> esta versão não envia dados para servidor. Alterações na área de gestão são armazenadas no navegador. Evite inserir qualquer dado pessoal real.</p><p><b>Limites:</b> nenhuma disponibilidade é real, nenhuma receita é legalmente validada, nenhum serviço é oficialmente integrado e a retirada depende da confirmação junto ao serviço de saúde.</p><button class="btn" data-action="clear-data">Restaurar base fictícia original</button></section>`;
}
function bindView() {
  const box = $("content");
  const input = $("medicine-search");
  if (input) {
    input.addEventListener("input", (e) => {
      app.query = e.target.value;
      const opts=findMedMatches(app.query,8).map(x=>x.med).filter(m=>!app.selected.includes(m.id));
      $("suggestions").innerHTML=suggestions(opts);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        action("search");
      }
    });
  }
  if ($("mobile-search"))
    $("mobile-search").addEventListener(
      "input",
      (e) => (app.query = e.target.value),
    );
  if ($("source-filter"))
    $("source-filter").addEventListener("change", (e) => {
      app.filter = e.target.value;
      render();
    });
  if ($("hour"))
    $("hour").addEventListener("change", (e) => {
      app.hour = Number(e.target.value);
      render();
    });
  if ($("admin-unit"))
    $("admin-unit").addEventListener("change", (e) => {
      app.unit = Number(e.target.value);
      render();
    });
  if ($("citizen-form"))
    $("citizen-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      app.patient = PAC.find((x) => x.id === f.get("profile")) || app.patient;
      if (app.patient) {
        toast("Perfil fictício selecionado.");
        route("receitas");
      }
    });
  if ($("login-form"))
    $("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      if (f.get("username") === "admin" && f.get("password") === "demo123") {
        app.admin = true;
        render();
      } else toast("Credenciais demonstrativas inválidas.");
    });
  if ($("rx-photo"))
    $("rx-photo").addEventListener("change", () => {
      toast("Imagem selecionada somente no aparelho. Não há leitura automática.");
    });
  if ($("recipe-form"))
    $("recipe-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget),
        r = {
          medId: Number(f.get("medId")),
          kind: f.get("kind"),
          type: f.get("type"),
          date: f.get("date"),
          prescriber: !!f.get("prescriber"),
          qty: f.get("qty"),
          concentration: f.get("concentration"),
        };
      const x = recipeCheck(r);
      app.recipe = x.issues.length
        ? `<div class="alert"><b>Pendências para avaliação:</b><ul>${x.issues.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>Procure o profissional de saúde responsável.</div>`
        : `<div class="alert good"><b>Sem pendências aparentes nos critérios demonstrativos.</b><br>Isso não aprova nem valida a receita. A avaliação final é do farmacêutico.</div>`;
      app.recipe += `<p class="small muted">Prazo demonstrativo escolhido: ${recipeRules[r.kind]} dias. As regras reais podem ser diferentes.</p><button class="btn sm" data-action="add-med" data-id="${r.medId}">Ver unidades para este medicamento</button>`;
      $("rx-output").innerHTML = app.recipe;
    });
}
function action(type, id) {
  switch (type) {
    case "recipe":
      route(app.patient ? "receitas" : "acesso");
      break;
    case "access-recipes":
      route("receitas");
      break;
    case "category":
      route("consulta");
      if (Number(id) !== 0)
        toast("Este protótipo foca na disponibilidade de medicamentos.");
      break;
    case "search": {
      if (app.page !== "consulta") { route("consulta"); break; }
      const query = app.query.trim().toLocaleLowerCase("pt-BR");
      if (!query) {
        if (app.selected.length) $("results")?.scrollIntoView({ behavior:"smooth" });
        else toast("Digite ou escolha um medicamento para continuar.");
        break;
      }
      if (query.length < 2) { toast("Digite pelo menos duas letras do medicamento."); break; }
      const matches=findMedMatches(query,8).filter(x=>!app.selected.includes(x.med.id));
      if (!matches.length) { toast("Não encontrei esse nome. Veja as sugestões ou tente outra palavra."); break; }
      if (matches.length>1 && matches[1].score>=matches[0].score-16) {
        toast("Existem apresentações parecidas. Escolha uma sugestão para continuar.");
        $("suggestions")?.scrollIntoView({behavior:"smooth",block:"nearest"});
        break;
      }
      const found=matches[0].med;
      if (!app.selected.includes(found.id)) app.selected.push(found.id);
      app.showAllEasy = false;
      app.query = "";
      render();
      $("results")?.scrollIntoView({ behavior:"smooth" });
      break;
    }
    case "add-med": {
      const n = Number(id);
      if (!app.selected.includes(n)) app.selected.push(n);
      app.query = "";
      route("consulta");
      break;
    }
    case "remove-med":
      app.selected = app.selected.filter((n) => n !== Number(id));
      render();
      break;
    case "reset-search":
      app.showAllEasy = false;
      app.selected = [];
      app.query = "";
      render();
      break;
    case "results":
      $("results")?.scrollIntoView({ behavior: "smooth" });
      break;
    case "unit-consult":
      route("consulta");
      break;
    case "guide": {
      $("results").innerHTML = guide(Number(id));
      $("results").scrollIntoView({ behavior: "smooth" });
      break;
    }
    case "back-results":
      $("results").innerHTML = results();
      break;
    case "route-link": {
      const u = unit(id);
      if (u) window.open(mapsLink(u), "_blank", "noopener,noreferrer");
      else toast("Unidade não encontrada.");
      break;
    }
    case "whatsapp": {
      const u = unit(id);
      if (!u) {
        toast("Unidade não encontrada.");
        break;
      }
      const items = app.selected.map(med).filter((m) => m && supply(m, u));
      const msg = `*Farmácia Certa DF — SIMULAÇÃO*\nUnidade: ${u.n} (${u.ra})\nEndereço: ${u.addr || u.loc || u.ra}\nHorário: ${scheduleText(u)}\nAlmoço: ${breakText(u)}${reduced(u) ? "\nAtenção: horário reduzido (simulação)." : ""}\n${items
        .map((m) => {
          const s = stock(m, u);
          return `• ${m.n} ${m.c}: ${s.label}`;
        })
        .join(
          "\n",
        )}\n*Como chegar:* ${mapsLink(u)}\nOs horários e estoques são simulados. Confirme diretamente com a unidade antes de sair.`;
      window.open(
        "https://wa.me/?text=" + encodeURIComponent(msg),
        "_blank",
        "noopener,noreferrer",
      );
      break;
    }
    case "patient-login":
      toast(
        "Para mudar de cidadão, saia da conta e escolha outro perfil no login.",
      );
      render();
      break;
    case "logout":
      try {
        sessionStorage.removeItem("fcdf-demo-access");
        sessionStorage.removeItem("fcdf-demo-name");
        sessionStorage.removeItem("fcdf-demo-profile");
      } catch (e) {}
      location.href = "login.html";
      break;
    case "admin-logout":
      app.admin = false;
      render();
      break;
    case "save-hours": {
      const u = unit(app.unit);
      const a = $("break-start").value,
        b = $("break-end").value;
      if ((a && !b) || (!a && b) ||
          (a && b && (Number(a) >= Number(b) || Number(a) < u.ph[0] || Number(b) > u.ph[1]))) {
        toast("Informe o intervalo completo dentro do horário da farmácia.");
        return;
      }
      u.phOn = $("ph-on").checked;
      u.closure = {
        active: $("closure-on").checked,
        reason: $("closure-reason").value,
      };
      u.break = a && b ? [Number(a), Number(b)] : null;
      save();
      toast("Status e horários atualizados na simulação.");
      render();
      break;
    }
    case "save-stock": {
      const v = $("stock-" + id).value;
      if (v === "" || !Number.isInteger(Number(v)) || Number(v) < 0) {
        toast("Informe uma quantidade inteira não negativa.");
        return;
      }
      updateStock(id, Number(v), true);
      break;
    }
    case "entry":
      moveStock(id, 10);
      break;
    case "exit":
      moveStock(id, -5);
      break;
    case "voice":
      speech();
      break;
    case "read":
      readPage();
      break;
    case "show-more-units":
      app.showAllEasy = true;
      render();
      $("results")?.scrollIntoView({behavior:"smooth"});
      break;
    case "clear-data":
      if (
        confirm(
          "Restaurar todos os dados fictícios e apagar alterações locais?",
        )
      ) {
        localStorage.removeItem(KEY);
        location.reload();
      }
      break;
  }
}
function updateStock(id, newValue, adjust) {
  const key = `${id}-${app.unit}`,
    prev = S[key]?.q ?? 0;
  S[key] = {
    ...(S[key] || { lote: "L-DEMO", val: "2027-12" }),
    q: newValue,
    t: Date.now(),
  };
  MOV.unshift([
    Date.now(),
    adjust ? "Ajuste" : newValue > prev ? "Entrada" : "Saída",
    Number(id),
    app.unit,
    adjust ? Math.abs(newValue - prev) : Math.abs(newValue - prev),
    "admin-demo",
  ]);
  save();
  toast("Estoque fictício salvo.");
  render();
}
function moveStock(id, d) {
  const key = `${id}-${app.unit}`,
    prev = S[key]?.q ?? 0;
  if (d < 0 && prev < Math.abs(d)) {
    toast(`Saída recusada: saldo insuficiente (${prev}).`);
    return;
  }
  updateStock(id, prev + d, false);
}
let activeRecognition=null;
function voiceUI(listening, message="Ouvindo... pode falar o nome do remédio.") {
  const display=$("voice-status");
  display.hidden=!listening;
  $("voice-message").textContent=message;
  document.querySelectorAll('[data-action="voice"],#voice-desktop').forEach(btn=>{
    btn.setAttribute("aria-pressed",String(listening));
    btn.classList.toggle("is-listening",listening);
  });
}
function stopListening() {
  if (activeRecognition) {
    const r=activeRecognition;
    activeRecognition=null;
    try {r.abort();}catch(e){}
  }
  voiceUI(false);
}
function speech() {
  if (activeRecognition) {stopListening();return;}
  const Rec=window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) {
    toast("Busca por voz indisponível. Digite o nome do remédio.");
    return;
  }
  try {
    const r=new Rec();
    activeRecognition=r;
    r.lang="pt-BR";
    r.interimResults=true;
    r.maxAlternatives=1;
    r.continuous=false;
    r.onstart=()=>voiceUI(true);
    r.onresult=e=>{
      const entry=e.results[e.resultIndex] || e.results[0];
      const text=entry?.[0]?.transcript?.trim();
      if (!text) return;
      $("voice-message").textContent=entry.isFinal?"Identificando o remédio...":"Ouvindo: "+text.slice(0,90);
      if (!entry.isFinal) return;
      const canonical=extractMedName(text);
      app.query=canonical || text;
      activeRecognition=null;
      try {r.stop();} catch(e){}
      voiceUI(false);
      route("consulta");
      toast(canonical ? `Entendi: ${canonical}. Confira a apresentação antes de continuar.` :
        "Confira o nome e selecione a apresentação correspondente.");
      $("medicine-search")?.focus({preventScroll:true});
    };
    r.onerror=e=>{
      if (r!==activeRecognition) return;
      activeRecognition=null;
      voiceUI(false);
      const errors={"not-allowed":"Permita o microfone nas configurações do navegador.",
        "service-not-allowed":"O serviço de voz não está permitido.",
        "no-speech":"Não ouvi nenhuma palavra. Tente novamente.",
        "audio-capture":"Microfone indisponível.","network":"Sem conexão com o reconhecimento de voz."};
      toast(errors[e.error] || "Não consegui ouvir. Digite o nome do remédio.");
    };
    r.onend=()=>{
      if (r!==activeRecognition) return;
      activeRecognition=null;
      voiceUI(false);
    };
    voiceUI(true,"Ativando microfone...");
    r.start();
  } catch(e) {
    activeRecognition=null;
    voiceUI(false);
    toast("Não foi possível iniciar o microfone.");
  }
}
function font() { adjustText(2); }
// Eventos delegados: funcionam também nos botões criados dinamicamente nos resultados e nas orientações.
$("content").addEventListener("click", (event) => {
  const target = event.target.closest("button[data-action],button[data-nav]");
  if (!target || !$("content").contains(target) || target.disabled) return;
  if (target.dataset.action) action(target.dataset.action, target.dataset.id);
  else if (target.dataset.nav) route(target.dataset.nav);
});
document
  .querySelectorAll(
    "header [data-nav],.desktop-nav [data-nav],.mobile-nav [data-nav],footer [data-nav]",
  )
  .forEach((b) => b.addEventListener("click", () => route(b.dataset.nav)));
$("font-toggle").addEventListener("click", font);
$("font-decrease").addEventListener("click", () => adjustText(-2));
$("read-toggle").addEventListener("click", readPage);
$("voice-desktop").addEventListener("click", speech);
$("voice-stop").addEventListener("click",stopListening);
$("global-search").addEventListener(
  "input",
  (e) => (app.query = e.target.value),
);
$("global-search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    route("consulta");
    action("search");
  }
});
document.addEventListener("click", (e) => {
  if (e.target.id === "font-inline") font();
});
document.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = fcIcon(el.dataset.icon); });
initPreferences();
render();
