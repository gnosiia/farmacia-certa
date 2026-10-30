"use strict";
// Ícones SVG próprios, de traço simples, inspirados no padrão de leitura visual
// dos portais de saúde. Sem biblioteca ou rede externa.
const FCDF_ICONS = Object.freeze({
  pill: '<path d="M10.5 5.5a5 5 0 0 1 7.1 7.1l-5 5a5 5 0 1 1-7.1-7.1z"/><path d="m8 8 8 8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  prescription: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.4 9a2.8 2.8 0 0 1 5.3 1.2c0 2-2.7 2.3-2.7 4.1"/><circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none"/>',
  hospital: '<rect x="4" y="7" width="16" height="14" rx="1"/><path d="M9 7V3h6v4M10 12h4m-2-2v4M9 21v-4h6v4"/>',
  route: '<path d="M9 20H6a3 3 0 0 1 0-6h7a3 3 0 0 0 0-6h-1"/><path d="M12 2v6M9 5h6"/><circle cx="18" cy="19" r="2"/>',
  account: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  chat: '<path d="M20 11.5A8.5 8.5 0 0 1 7 18.8L3 20l1.2-4A8.5 8.5 0 1 1 20 11.5Z"/><path d="m9 10 2 2 4-4"/>',
  home: '<path d="m3 11 9-8 9 8v9H3z"/><path d="M9 20v-7h6v7"/>',
  mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11a6 6 0 0 0 12 0m-6 6v4m-4 0h8"/>',
  volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
  glasses: '<path d="M2 10h3m14 0h3M9 10h6"/><circle cx="6.5" cy="13" r="3.5"/><circle cx="17.5" cy="13" r="3.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M8 15h3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M9 12h9"/>',
  moon: '<path d="M20 15.8A8.8 8.8 0 0 1 8.2 4 8.9 8.9 0 1 0 20 15.8Z"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  alert: '<path d="M12 3 2 21h20zM12 9v5m0 4v.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
  store: '<path d="M4 9h16v12H4zM2 9l3-6h14l3 6M2 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 21v-8h6v8"/>'
});
function fcIcon(name, label = '') {
  const shape = FCDF_ICONS[name] || FCDF_ICONS.help;
  const accessibility = label ? `role="img" aria-label="${String(label).replace(/[&<>"']/g, '')}"` : 'aria-hidden="true"';
  return `<svg class="fc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${accessibility}>${shape}</svg>`;
}
