"use strict";
/* Perfis exclusivamente fictícios e locais. Sem cadastro real, senha ou integração Gov.br. */
const DATA_KEY = "farmacia-certa-df-v4";
const form = document.getElementById("demo-login");
const registerForm = document.getElementById("demo-register");
const profileSelect = document.getElementById("profile");
const pass = document.getElementById("password");
const feedback = document.getElementById("feedback");
const toggle = document.getElementById("toggle");
const firstTab = document.getElementById("tab-existing");
const secondTab = document.getElementById("tab-new");
let profiles = PAC.slice();
let store = {};
try {
  const saved = JSON.parse(localStorage.getItem(DATA_KEY) || "{}");
  if (saved && typeof saved === "object" && !Array.isArray(saved)) store = saved;
  if (Array.isArray(store.patients)) {
    profiles = store.patients.filter(p=>p && typeof p.id === "string" && typeof p.n === "string" && p.n.length < 90);
  }
} catch (err) {
  feedback.textContent = "Não foi possível carregar dados salvos. Os perfis padrão continuam disponíveis.";
}
function age(birth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth || "")) return null;
  const d = new Date(birth + "T12:00:00");
  const now = new Date();
  if (Number.isNaN(d.getTime()) || d.getFullYear() !== Number(birth.slice(0,4)) || d > now) return null;
  let n = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) n--;
  return n >= 0 && n <= 120 ? n : null;
}
function populate() {
  profileSelect.querySelectorAll('option:not([value=""])').forEach(o=>o.remove());
  profiles.forEach(p=>{
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = `${p.n} (${p.id})`;
    profileSelect.appendChild(option);
  });
}
function selectTab(showNew) {
  form.hidden = showNew;
  registerForm.hidden = !showNew;
  firstTab.classList.toggle("tab-selected", !showNew);
  secondTab.classList.toggle("tab-selected", showNew);
  firstTab.setAttribute("aria-pressed", String(!showNew));
  secondTab.setAttribute("aria-pressed", String(showNew));
  (showNew ? document.getElementById("register-name") : profileSelect).focus();
}
function enter(profile) {
  try {
    sessionStorage.setItem("fcdf-demo-access", "yes");
    sessionStorage.setItem("fcdf-demo-name", profile.n);
    sessionStorage.setItem("fcdf-demo-profile", profile.id);
  } catch (err) {
    const box = registerForm.hidden ? feedback : document.getElementById("register-feedback");
    box.textContent = "Este navegador bloqueou o armazenamento de sessão. Habilite-o para acessar um perfil de teste.";
    return;
  }
  location.assign("index.html");
}
populate();
firstTab.addEventListener("click",()=>selectTab(false));
secondTab.addEventListener("click",()=>selectTab(true));
toggle.addEventListener("click",()=>{
  const show = pass.type === "password";
  pass.type = show ? "text" : "password";
  toggle.textContent = show ? "Ocultar" : "Mostrar";
  toggle.setAttribute("aria-pressed", String(show));
});
form.addEventListener("submit",event=>{
  event.preventDefault();
  const email = document.getElementById("email-login").value.trim().toLowerCase();
  if (email) {
    const registered = profiles.find(p=>p.email?.toLowerCase()===email);
    if (!registered) {
      feedback.textContent = "E-mail de demonstração não encontrado neste navegador.";
      return;
    }
    enter(registered);
    return;
  }
  const selected = profiles.find(p=>p.id === profileSelect.value);
  if (!selected || !pass.value.trim()) {
    feedback.textContent = "Selecione um perfil e informe uma senha inventada para teste, ou use seu e-mail fictício.";
    return;
  }
  enter(selected);
});
registerForm.addEventListener("submit",event=>{
  event.preventDefault();
  const name = document.getElementById("register-name").value.trim().replace(/\s+/g," ");
  const birth = document.getElementById("register-birth").value;
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const result = document.getElementById("register-feedback");
  const years = age(birth);
  if (name.length < 2 || name.length > 70 || years === null || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    result.textContent = "Confira nome, e-mail fictício e data de nascimento válida.";
    return;
  }
  if (profiles.some(p=>p.email && p.email.toLowerCase()===email)) {
    result.textContent = "Este e-mail de teste já está cadastrado neste navegador.";
    return;
  }
  const max = profiles.map(p=>/D(\d+)/.exec(p.id)?.[1]).filter(Boolean).map(Number);
  const id = "D" + String(Math.max(0,...max)+1).padStart(3,"0");
  const newProfile = {id,n:name,nasc:birth,email,rx:[],sit:"Ativo - demonstração",cns:"",resp:""};
  try {
    profiles.push(newProfile);
    // Nunca sobrescrever estoques e outros dados se eles já foram alterados na simulação.
    const latest = JSON.parse(localStorage.getItem(DATA_KEY) || "{}");
    localStorage.setItem(DATA_KEY, JSON.stringify({...(latest && typeof latest==="object" ? latest : store),patients:profiles}));
  } catch (err) {
    profiles.pop();
    result.textContent = "Não foi possível salvar o perfil fictício neste navegador.";
    return;
  }
  enter(newProfile);
});
