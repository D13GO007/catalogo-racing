import { c as createComponent } from './astro-component_Dd888ObM.mjs';
import 'piccolore';
import { r as renderTemplate, h as addAttribute, l as renderHead } from './entrypoint_0fwQYrqv.mjs';
import 'clsx';
import { r as renderScript } from './script_CVeKIrKr.mjs';
import { s as supabase } from './supabase_ABsA77A7.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Catalogo = createComponent(async ($$result, $$props, $$slots) => {
  const { data: referencias, error } = await supabase.from("referencias").select("*").eq("activo", true).eq("visible_en_catalogo", true).order("modelo", { ascending: true });
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-teqhy7c3> <head><meta charset="utf-8"><title>Catálogo - Tiendana</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#ea580c"><link rel="apple-touch-icon" href="/icono-192.png">', `</head> <body data-astro-cid-teqhy7c3> <header class="w-full h-16 bg-gray-900 shadow-lg border-b-4 border-orange-500 relative z-10 flex items-center shrink-0" data-astro-cid-teqhy7c3> <div class="w-full max-w-[98%] mx-auto px-4 flex justify-between items-center" data-astro-cid-teqhy7c3> <div class="flex items-center space-x-4" data-astro-cid-teqhy7c3> <div class="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0 border border-gray-700" data-astro-cid-teqhy7c3> <img src="/logo.png" alt="Premium Racing" class="w-full h-full object-contain p-1" onerror="this.src='https://placehold.co/100x100?text=PR'" data-astro-cid-teqhy7c3> </div> <div class="hidden lg:block" data-astro-cid-teqhy7c3> <h1 class="text-xl font-bold text-white tracking-wide leading-tight" data-astro-cid-teqhy7c3>Premium Racing</h1> <p class="text-orange-400 text-[10px] font-black uppercase tracking-widest" data-astro-cid-teqhy7c3>Sistema de Gestión</p> </div> </div> <nav class="flex gap-1 md:gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0" data-astro-cid-teqhy7c3> <a href="/pos/inicio" data-astro-prefetch class="nav-link px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all text-gray-300 border border-transparent hover:bg-gray-800 hover:text-white whitespace-nowrap" data-astro-cid-teqhy7c3> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-teqhy7c3> <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" data-astro-cid-teqhy7c3></path> </svg> <span class="hidden md:inline" data-astro-cid-teqhy7c3>Inicio</span> </a> <a href="/pos/ventas" data-astro-prefetch class="nav-link px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all text-gray-300 border border-transparent hover:bg-gray-800 hover:text-white whitespace-nowrap" data-astro-cid-teqhy7c3> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-teqhy7c3> <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" data-astro-cid-teqhy7c3></path> </svg> <span class="hidden md:inline" data-astro-cid-teqhy7c3>Ventas</span> </a> <a href="/pos/historial" data-astro-prefetch class="nav-link px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all text-gray-300 border border-transparent hover:bg-gray-800 hover:text-white whitespace-nowrap" data-astro-cid-teqhy7c3> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-teqhy7c3> <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-teqhy7c3></path> </svg> <span class="hidden md:inline" data-astro-cid-teqhy7c3>Historial</span> </a> <a href="/pos" data-astro-prefetch class="nav-link px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all text-gray-300 border border-transparent hover:bg-gray-800 hover:text-white whitespace-nowrap" data-astro-cid-teqhy7c3> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-teqhy7c3> <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" data-astro-cid-teqhy7c3></path> </svg> <span class="hidden md:inline" data-astro-cid-teqhy7c3>Inventario</span> </a> <a href="/pos/estadisticas" data-astro-prefetch class="nav-link px-3 md:px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all text-gray-300 border border-transparent hover:bg-gray-800 hover:text-white whitespace-nowrap" data-astro-cid-teqhy7c3> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-teqhy7c3><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-astro-cid-teqhy7c3></path></svg> <span class="hidden md:inline" data-astro-cid-teqhy7c3>Estadísticas</span> </a> </nav> <div class="hidden sm:block ml-2 pl-2 md:ml-4 md:pl-4 border-l border-gray-700 shrink-0" data-astro-cid-teqhy7c3> <button class="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800" title="Cerrar Sesión" data-astro-cid-teqhy7c3> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-teqhy7c3> <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" data-astro-cid-teqhy7c3></path> </svg> </button> </div> </div> </header> <main class="max-w-7xl mx-auto px-6 py-8" data-astro-cid-teqhy7c3> <div class="neumorphism px-6 py-5 mb-6" data-astro-cid-teqhy7c3> <input id="search" class="search-input" type="search" placeholder="Buscar modelo..." data-astro-cid-teqhy7c3> </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="cardGrid" data-astro-cid-teqhy7c3> `, ` </div> </main> <script type="module">
      import { supabase } from '../../lib/supabase.js';

      const search = document.getElementById('search');
      const cards = Array.from(document.querySelectorAll('[data-model]'));

      const applySearch = () => {
        const q = search.value.trim().toLowerCase();
        cards.forEach(card => {
          const model = card.getAttribute('data-model');
          card.style.display = model.includes(q) ? 'block' : 'none';
        });
      };

      search.addEventListener('input', applySearch);

      const setToggle = async (button, visible) => {
        const id = button.getAttribute('data-id');
        button.classList.toggle('active', visible);

        const { error } = await supabase
          .from('referencias')
          .update({ visible_en_catalogo: visible })
          .eq('id', id);

        if (error) {
          console.error('Error actualizando visibilidad', error);
          button.classList.toggle('active', !visible);
        }
      };

      document.querySelectorAll('.toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const isActive = btn.classList.contains('active');
          setToggle(btn, !isActive);
        });
      });
    <\/script> `, " </body> </html>"])), renderHead(), referencias?.length ? referencias.map((ref) => renderTemplate`<div class="neumorphism-card p-5"${addAttribute(ref.modelo.toLowerCase(), "data-model")}${addAttribute(ref.id, "data-id")} data-astro-cid-teqhy7c3> <img${addAttribute(ref.imagen_especifica || "https://placehold.co/400x400?text=Sin+imagen", "src")}${addAttribute(ref.modelo, "alt")} class="card-img mb-4" data-astro-cid-teqhy7c3> <div class="flex items-start justify-between gap-4" data-astro-cid-teqhy7c3> <div data-astro-cid-teqhy7c3> <p class="text-sm text-gray-500" data-astro-cid-teqhy7c3>Modelo</p> <p class="font-semibold text-lg text-gray-900" data-astro-cid-teqhy7c3>${ref.modelo}</p> </div> <button${addAttribute(`toggle ${ref.visible_en_catalogo ? "active" : ""}`, "class")}${addAttribute(ref.id, "data-id")} aria-label="Toggle visibilidad" data-astro-cid-teqhy7c3></button> </div> </div>`) : renderTemplate`<div class="col-span-full rounded-lg border border-dashed border-gray-300 bg-white/60 p-8 text-center text-gray-600" data-astro-cid-teqhy7c3>
No se encontraron productos.
</div>`, renderScript($$result, "C:/Users/diego/catalogo-motos - admin/src/pages/pos/catalogo.astro?astro&type=script&index=0&lang.ts"));
}, "C:/Users/diego/catalogo-motos - admin/src/pages/pos/catalogo.astro", void 0);

const $$file = "C:/Users/diego/catalogo-motos - admin/src/pages/pos/catalogo.astro";
const $$url = "/pos/catalogo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Catalogo,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
