// Small local SVG set: no icon library or network dependency.
const iconPaths={
 feather:'M20 4c-5-2-10 0-12 5L4 20l11-4c5-2 7-7 5-12Z M4 20 16 8 M8 15h5 M11 10v5',
 book:'M4 4h12a4 4 0 0 1 4 4v13H8a4 4 0 0 1-4-4V4Z M4 17a4 4 0 0 1 4-4h12 M9 4v9',
 users:'M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M17 4a4 4 0 0 1 0 8 M21 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 sparkles:'m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z M20 2v4 M18 4h4',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z',
 plus:'M12 5v14 M5 12h14',minus:'M5 12h14',close:'m6 6 12 12 M18 6 6 18',
 moon:'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z',
 sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.4 1.4 M17.6 17.6 1.4 1.4 M5 19l1.4-1.4 M17.6 6.4 1.4-1.4',
 upload:'M12 16V3 M7 8l5-5 5 5 M4 16v5h16v-5',download:'M12 3v13 M7 11l5 5 5-5 M4 16v5h16v-5',
 pencil:'m16 3 5 5-12 12-6 1 1-6L16 3Z M13 6l5 5',undo:'M9 5 4 10l5 5 M4 10h10a6 6 0 0 1 0 12',
 check:'m5 12 4 4L19 6',bulb:'M9 18h6 M9 22h6 M8 14a7 7 0 1 1 8 0l-1 4H9l-1-4Z',
 list:'M9 5h12 M9 12h12 M9 19h12 M3 5h.01 M3 12h.01 M3 19h.01',arrow:'M5 12h14 m-6-6 6 6-6 6',
 type:'M4 5h16 M12 5v15 M8 20h8',cpu:'M6 6h12v12H6V6Z M9 9h6v6H9V9Z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4',
 refresh:'M20 7v5h-5 M4 17v-5h5 M6 6a8 8 0 0 1 13 3 M18 18a8 8 0 0 1-13-3',
 send:'m22 2-7 20-4-9-9-4L22 2Z M11 13 22 2',trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7'
};
function makeIcon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','20');svg.setAttribute('height','20');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',iconPaths[name]||iconPaths.sparkles);svg.append(p);return svg;}
function fillIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.replaceChildren(makeIcon(el.dataset.icon)));}fillIcons();
