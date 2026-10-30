'use strict';
// Apenas personagens fictícios: nenhum login ou senha é verificado externamente.
const form=document.getElementById('demo-login');
const pass=document.getElementById('password');
const toggle=document.getElementById('toggle');
const profile=document.getElementById('profile');
const feedback=document.getElementById('feedback');
const KEY='farmacia-certa-df-v3';
let profiles=PAC;
try {
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(Array.isArray(saved?.patients)&&saved.patients.length)profiles=saved.patients.filter(p=>p && typeof p.id==='string' && typeof p.n==='string');
} catch(e) {/* Segue com os perfis fictícios originais. */}
for(const p of profiles){const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.n+' ('+p.id+')';profile.appendChild(opt)}
toggle.addEventListener('click',()=>{const visible=pass.type==='text';pass.type=visible?'password':'text';toggle.textContent=visible?'Mostrar':'Ocultar';toggle.setAttribute('aria-pressed',String(!visible))});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const chosen=profiles.find(p=>p.id===profile.value);
 if(!chosen||!pass.value.trim()){feedback.textContent='Selecione um perfil e informe uma senha fictícia.';return;}
 try {
  sessionStorage.setItem('fcdf-demo-access','yes');
  sessionStorage.setItem('fcdf-demo-name',chosen.n);
  sessionStorage.setItem('fcdf-demo-profile',chosen.id);
 }catch(e){feedback.textContent='Permita o armazenamento de sessão para continuar.';return;}
 document.getElementById('enter').disabled=true;
 location.replace('index.html');
});
