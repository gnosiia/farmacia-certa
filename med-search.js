"use strict";
// Catálogo local. Os IDs referem-se aos registros do data.js: nenhuma pesquisa de voz
// inventa apresentações ou consulta uma base externa de disponibilidade.
const MED_ALIASES = Object.freeze({
  1: ["losartana", "losartana potassica"],
  2: ["metformina", "cloridrato de metformina", "glifage"],
  3: ["insulina nph", "insulina humana nph"],
  4: ["insulina regular", "insulina humana regular"],
  5: ["sinvastatina"],
  6: ["omeprazol"],
  7: ["amoxicilina"],
  8: ["dipirona", "dipirona sodica", "novalgina"],
  9: ["controlex"],
  10: ["biolex"]
});

function normalizeMedText(s) {
  return String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function medDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  let previous = Array.from({length:b.length+1},(_,i)=>i);
  for (let i=1;i<=a.length;i++) {
    const current=[i];
    for (let j=1;j<=b.length;j++) {
      current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    }
    previous=current;
  }
  return previous[b.length];
}
const MED_FILLERS = new Set([
  "me", "da", "de", "o", "a", "um", "uma", "aquele", "aquela", "esse", "essa", "quero",
  "preciso", "procurar", "procuro", "buscar", "tem", "tens", "voce", "favor", "por", "pra",
  "para", "remedio", "medicamento", "comprimido", "comprimidos", "capsula", "capsulas",
  "gotas", "frasco", "miligrama", "miligramas", "mg", "ml", "ui", "do", "da", "dos", "das", "quantos"
]);
function medQueryWords(raw) {
  return normalizeMedText(raw).split(" ").filter(w=>w && !MED_FILLERS.has(w) && !/^\d+$/.test(w));
}
function medAliasScore(words, alias) {
  const tokens = normalizeMedText(alias).split(" ");
  let hits=0, score=0;
  for (const t of tokens) {
    let best=0;
    for (const q of words) {
      if (q===t) best=Math.max(best,110);
      else if (q.length>=4 && t.startsWith(q)) best=Math.max(best,83);
      else if (q.length>=4 && t.length>=4) {
        const d=medDistance(q,t);
        if (d===1) best=Math.max(best,71);
        if (d===2 && q.length>=7 && t.length>=7) best=Math.max(best,58);
      }
    }
    if (best) { hits++; score+=best; }
  }
  if (hits===0) return 0;
  if (tokens.length>1 && hits<tokens.length) return Math.round(score/hits)-15;
  return Math.round(score/hits)+(tokens.length>1?15:0);
}
function findMedMatches(raw, limit=8) {
  const words=medQueryWords(raw);
  if (!words.length) return [];
  return M.map(m=>{
    const aliases=[m.n,m.a,...(MED_ALIASES[m.id]||[])];
    const score=Math.max(...aliases.map(a=>medAliasScore(words,a)));
    return {med:m,score};
  }).filter(x=>x.score>=55).sort((a,b)=>b.score-a.score || a.med.n.localeCompare(b.med.n,"pt-BR"))
    .slice(0,limit);
}
// Nome extraído somente quando há UMA opção suficientemente distinta das demais.
function extractMedName(raw) {
  const matches=findMedMatches(raw);
  if (!matches.length) return null;
  if (matches[0].score<68) return null;
  if (matches[1] && matches[1].score>=matches[0].score-16) return null;
  return matches[0].med.n;
}
