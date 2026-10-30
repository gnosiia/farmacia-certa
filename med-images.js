"use strict";
// Consulta opcional à API pública DailyMed (EUA). Somente imagens de rótulos
// explicitamente relacionados ao princípio ativo e à concentração catalogada.
// Nunca exibir uma embalagem brasileira presumida ou de fármaco diferente.
const MED_PHOTO_TERMS = Object.freeze({
  1: {drug:"LOSARTAN", ingredient:"LOSARTAN", strength:"50 MG"},
  2: {drug:"METFORMIN", ingredient:"METFORMIN", strength:"850 MG"},
  5: {drug:"SIMVASTATIN", ingredient:"SIMVASTATIN", strength:"20 MG"},
  6: {drug:"OMEPRAZOLE", ingredient:"OMEPRAZOLE", strength:"20 MG"},
  7: {drug:"AMOXICILLIN", ingredient:"AMOXICILLIN", strength:"500 MG"}
});
const photoCache=new Map();
function photoPlaceholder() {
  return '<span class="medicine-box-icon" aria-hidden="true">' +
    '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M14 19 36 10l22 9v36L36 65 14 55V19Z"/><path d="m14 19 22 10 22-10M36 29v36"/><path d="M20 37h12m-6-6v12"/></svg></span>';
}
function medPhotoMarkup(m) {
  return `<div class="medicine-photo" data-med-photo="${m.id}" role="group" aria-label="Imagem da embalagem de ${String(m.n).replace(/[&<>"']/g,"")}">
    <div class="medicine-photo-visual">${photoPlaceholder()}</div>
    <small>Foto da caixa indisponível</small>
  </div>`;
}
async function lookupVerifiedMedPhoto(m) {
  if (!MED_PHOTO_TERMS[m.id] || typeof fetch!=="function") return null;
  if (photoCache.has(m.id)) return photoCache.get(m.id);
  const task=(async()=>{
    const item=MED_PHOTO_TERMS[m.id];
    const base="https://dailymed.nlm.nih.gov/dailymed/services/v2/";
    // Máximo de 2 rótulos para evitar lentidão e solicitações desnecessárias.
    try {
      const ctrl=new AbortController();
      const timeout=setTimeout(()=>ctrl.abort(),3500);
      try {
        const url=base+"spls.json?drug_name="+encodeURIComponent(item.drug)+"&name_type=generic&pagesize=10&page=1";
        const response=await fetch(url,{signal:ctrl.signal,mode:"cors"});
        if (!response.ok) return null;
        const body=await response.json();
        const list=Array.isArray(body?.data)?body.data:[];
        const candidates=list.filter(row=>{
          const title=String(row.title||"").toUpperCase();
          return title.includes(item.ingredient) && title.includes(item.strength) && /^[a-f0-9-]{36}$/i.test(row.setid||"");
        }).slice(0,2);
        for (const candidate of candidates) {
          const mediaResp=await fetch(base+"spls/"+encodeURIComponent(candidate.setid)+"/media.json",{signal:ctrl.signal,mode:"cors"});
          if (!mediaResp.ok) continue;
          const media=(await mediaResp.json())?.data?.media;
          if (!Array.isArray(media)) continue;
          // Somente foto da caixa/embalagem: não usar fotos de comprimidos, gráficos ou logotipos.
          const box=media.find(f=>/image\/(jpeg|png)/i.test(f.mime_type||"") &&
            /(?:carton|box|package|packaging|front.panel)/i.test(f.name||"") &&
            /^https:\/\/dailymed\.nlm\.nih\.gov\/dailymed\/image\.cfm\?/i.test(f.url||""));
          if (box) return {url:box.url,source:"DailyMed (EUA)"};
        }
      } finally {clearTimeout(timeout);}
    } catch (err) { /* Sem rede, CORS ou timeout: mostrar indicação neutra. */ }
    return null;
  })();
  photoCache.set(m.id,task);
  return task;
}
async function loadMedicinePhotos() {
  const targets=Array.from(document.querySelectorAll("[data-med-photo]"));
  const ids=[...new Set(targets.map(x=>Number(x.dataset.medPhoto)))];
  for (const id of ids) {
    const medicine=M.find(m=>m.id===id);
    if (!medicine) continue;
    const photo=await lookupVerifiedMedPhoto(medicine);
    if (!photo) continue;
    document.querySelectorAll(`[data-med-photo="${id}"]`).forEach(el=>{
      const visual=el.querySelector(".medicine-photo-visual");
      const caption=el.querySelector("small");
      if (!visual||!caption) return;
      const img=document.createElement("img");
      img.alt="Referência visual de embalagem internacional; confirme o produto com a farmácia";
      img.loading="lazy";
      img.referrerPolicy="no-referrer";
      img.addEventListener("error",()=>{img.remove();visual.innerHTML=photoPlaceholder();caption.textContent="Foto da caixa indisponível";},{once:true});
      visual.replaceChildren(img);
      img.src=photo.url;
      caption.textContent="Referência dos EUA; a caixa no DF pode ser diferente";
    });
  }
}
