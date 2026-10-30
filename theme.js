/* Tema independente do login, salvo somente neste navegador. */
(function(){
  const KEY='fcdf-theme';
  function stored(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function set(mode){document.documentElement.dataset.theme=mode; document.documentElement.style.colorScheme=mode==='dark'?'dark':'light';
    document.querySelectorAll('.theme-toggle').forEach(b=>{b.textContent=mode==='dark'?'☀️ Modo claro':'🌙 Modo noturno';b.setAttribute('aria-pressed',String(mode==='dark'));b.setAttribute('aria-label',mode==='dark'?'Ativar modo claro':'Ativar modo noturno')});
    try{localStorage.setItem(KEY,mode)}catch(e){}
  }
  const initial=stored()||'light';document.documentElement.dataset.theme=initial;
  document.addEventListener('DOMContentLoaded',()=>{set(initial);document.querySelectorAll('.theme-toggle').forEach(b=>b.addEventListener('click',()=>set(document.documentElement.dataset.theme==='dark'?'light':'dark')))});
})();
