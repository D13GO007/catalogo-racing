import { c as createComponent } from './astro-component_Dd888ObM.mjs';
import 'piccolore';
import { l as renderHead, o as renderComponent, r as renderTemplate, h as addAttribute } from './entrypoint_0fwQYrqv.mjs';
import { r as renderScript } from './script_CVeKIrKr.mjs';
import { s as supabase } from './supabase_ABsA77A7.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: familiasBD, error } = await supabase.from("familias").select("id, nombre, referencias(id, modelo, precio_venta, imagen_especifica)").eq("referencias.activo", true).eq("referencias.visible_en_catalogo", true).order("nombre");
  let errorCarga = "";
  if (error) {
    console.error("❌ Error al consultar familias en Supabase:", error);
    errorCarga = "No pudimos cargar la lista.";
  }
  const productosAgrupados = (familiasBD ?? []).map((familia) => {
    const referencias = (familia.referencias ?? []).map((ref) => ({
      Modelo: ref.modelo,
      Precio: ref.precio_venta,
      Imagen: ref.imagen_especifica,
      // Mantener compatibilidad con la estructura previa
      modelo: ref.modelo,
      precio: ref.precio_venta,
      imagenEspecifica: ref.imagen_especifica
    }));
    return {
      Familia: familia.nombre,
      Referencias: referencias,
      // Propiedades usadas por el template existente
      id: familia.id,
      nombre: familia.nombre,
      imagenDefault: referencias[0]?.Imagen ?? "",
      referencias
    };
  });
  const formatoPeso = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);
  const fechaHoy = (/* @__PURE__ */ new Date()).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
  return renderTemplate`<html lang="es" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><meta name="robots" content="noindex, nofollow"><title>Catálogo Premium Racing</title>${renderHead()}</head> <body class="text-gray-800 antialiased" data-astro-cid-j7pv25f6> <header class="bg-black pt-16 pb-32 md:py-12 px-4 w-full relative mb-24 md:mb-32 shadow-xl" data-astro-cid-j7pv25f6> <div class="max-w-7xl mx-auto flex flex-col items-center md:items-end md:pr-12" data-astro-cid-j7pv25f6> <h1 class="flex flex-col md:flex-row gap-1 md:gap-4 text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-widest text-center md:text-right italic" data-astro-cid-j7pv25f6> <span class="text-white drop-shadow-[2px_2px_0px_#333]" data-astro-cid-j7pv25f6>
Importadora
</span> <span class="bg-gradient-to-r from-[#FF6600] via-[#FF9900] to-[#FFD700] text-transparent bg-clip-text drop-shadow-sm" data-astro-cid-j7pv25f6>
Premium
</span> </h1> </div> <div class="absolute -bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-24 md:left-12 w-44 h-44 md:w-56 md:h-56 bg-black rounded-full border-[6px] border-white shadow-2xl flex items-center justify-center z-50 overflow-hidden" data-astro-cid-j7pv25f6> <img src="/logo.png" alt="Logo" class="w-3/4 h-3/4 object-contain" onerror="this.src='https://placehold.co/250x250/000/fff?text=LOGO'" data-astro-cid-j7pv25f6> </div> </header> <main class="max-w-7xl mx-auto px-4 min-h-screen pb-32" data-astro-cid-j7pv25f6> ${errorCarga && renderTemplate`<div class="bg-red-600 text-white p-4 font-bold text-center mb-6 shadow-lg border-2 border-black rounded" data-astro-cid-j7pv25f6>${errorCarga}</div>`} <div class="flex flex-col md:flex-row justify-end items-center gap-4 mb-10 w-full" data-astro-cid-j7pv25f6> <div class="w-full md:max-w-xl relative group" data-astro-cid-j7pv25f6> <input type="search" id="search-input" placeholder="BUSCAR REPUESTO O MOTO..." class="w-full py-4 px-5 pl-14 bg-white text-black font-black uppercase tracking-wide outline-none text-sm md:text-base border-4 border-black shadow-[6px_6px_0px_#FF6600] focus:shadow-[2px_2px_0px_#FF6600] transition-all rounded-none" data-astro-cid-j7pv25f6> <span class="absolute left-5 top-4 text-[#FF6600] text-2xl font-black" data-astro-cid-j7pv25f6>🔍</span> </div> <div class="w-full md:w-auto flex justify-center md:justify-end" data-astro-cid-j7pv25f6> ${renderComponent($$result, "BotonDescargaPDF", null, { "client:only": "react", "productos": productosAgrupados, "fechaHoy": fechaHoy, "client:component-hydration": "only", "data-astro-cid-j7pv25f6": true, "client:component-path": "C:/Users/diego/catalogo-motos - admin/src/components/CatalogoPDF.jsx", "client:component-export": "default" })} </div> </div> <div id="product-grid" class="columns-1 lg:columns-2 gap-8" data-astro-cid-j7pv25f6> ${productosAgrupados.map((item) => renderTemplate`<article class="producto-card mb-8 inline-block w-full break-inside-avoid bg-white rounded-md border-2 border-black shadow-[6px_6px_0px_#000000] overflow-hidden transition-transform hover:-translate-y-1"${addAttribute(item.nombre.toLowerCase(), "data-nombre")}${addAttribute(JSON.stringify(item.referencias).toLowerCase(), "data-referencias")}${addAttribute(JSON.stringify(item.referencias.map((r) => r.imagenEspecifica)), "data-all-images")} data-astro-cid-j7pv25f6> <div class="bg-[#FF6600] p-3 border-b-2 border-black flex justify-between items-center" data-astro-cid-j7pv25f6> <h3 class="texto-buscable m-0 text-white text-lg md:text-xl font-black uppercase tracking-wider" data-astro-cid-j7pv25f6> ${item.nombre} </h3> </div> <div class="flex flex-col md:flex-row w-full" data-astro-cid-j7pv25f6> <div class="w-full md:w-5/12 bg-[#F8F9FA] p-4 flex flex-col items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-black relative group min-h-[220px]" data-astro-cid-j7pv25f6> <img${addAttribute(`img-${item.id}`, "id")}${addAttribute(item.imagenDefault, "src")}${addAttribute(item.nombre, "alt")} loading="lazy" class="main-image max-w-full max-h-40 object-contain transition-transform duration-300 group-hover:scale-105" onerror="this.src='https://placehold.co/500x500/f0f0f0/FF6600?text=SIN+FOTO'" data-astro-cid-j7pv25f6> <p class="text-[10px] text-gray-400 font-bold uppercase mt-4" data-astro-cid-j7pv25f6> ${item.referencias.length} Referencias
</p> </div> <div class="w-full md:w-7/12 flex flex-col bg-white" data-astro-cid-j7pv25f6> <div class="bg-[#111111] text-white text-[10px] md:text-xs uppercase font-bold px-4 py-2 flex justify-between items-center shadow-sm z-10" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>Ref / Aplicación</span> <span data-astro-cid-j7pv25f6>Precio Unitario</span> </div> <div class="flex-1 w-full" data-astro-cid-j7pv25f6> <table class="w-full text-xs md:text-sm text-left" data-astro-cid-j7pv25f6> <tbody class="divide-y divide-gray-200" data-astro-cid-j7pv25f6> ${item.referencias.map((ref, i) => renderTemplate`<tr${addAttribute(`hover:bg-[#FFF0E5] transition-colors cursor-pointer ref-row group/row ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`, "class")}${addAttribute(ref.imagenEspecifica, "data-img")}${addAttribute(`img-${item.id}`, "data-target")} data-astro-cid-j7pv25f6> <td class="texto-buscable px-4 py-3 font-bold text-black uppercase transition-colors" data-astro-cid-j7pv25f6> ${ref.modelo} </td> <td class="px-4 py-3 text-right whitespace-nowrap" data-astro-cid-j7pv25f6> <span class="font-black text-sm md:text-base text-black group-hover/row:text-[#FF6600] transition-colors" data-astro-cid-j7pv25f6> ${formatoPeso(ref.precio)} </span> </td> </tr>`)} </tbody> </table> </div> <div class="p-4 bg-gray-50 mt-auto border-t border-gray-200" data-astro-cid-j7pv25f6> <a${addAttribute(`https://wa.me/573132240559?text=Hola,%20me%20interesa%20el%20producto:%20${item.nombre}`, "href")} target="_blank" class="w-full flex items-center justify-center gap-2 bg-[#FF6600] hover:bg-black text-white py-3 rounded uppercase font-black tracking-widest active:scale-95 transition-all text-sm group border-2 border-black shadow-[3px_3px_0px_#000000]" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>SOLICITAR</span> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-j7pv25f6><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" data-astro-cid-j7pv25f6></path></svg> </a> </div> </div> </div> </article>`)} </div> <div id="no-results" class="hidden py-24 text-center" data-astro-cid-j7pv25f6> <h3 class="text-2xl font-black uppercase text-[#FF6600]" data-astro-cid-j7pv25f6>No se encontraron resultados</h3> <p class="text-gray-500 font-bold mt-2" data-astro-cid-j7pv25f6>Intenta buscar con otra referencia o modelo.</p> </div> </main> <footer class="bg-[#111] text-white py-8 md:py-12 mt-8 border-t-8 border-[#FF6600] relative overflow-hidden" data-astro-cid-j7pv25f6> <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl md:text-9xl font-black opacity-[0.03] italic whitespace-nowrap pointer-events-none select-none" data-astro-cid-j7pv25f6>PREMIUM RACING</div> <div class="max-w-7xl mx-auto px-4 text-center relative z-10" data-astro-cid-j7pv25f6> <h2 class="font-black text-2xl md:text-3xl uppercase text-[#FF6600] mb-2" data-astro-cid-j7pv25f6>Premium Racing</h2> <p class="text-gray-400 text-xs md:text-sm uppercase tracking-widest" data-astro-cid-j7pv25f6>Catálogo Oficial • Colombia</p> </div> </footer> ${renderScript($$result, "C:/Users/diego/catalogo-motos - admin/src/pages/index.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/Users/diego/catalogo-motos - admin/src/pages/index.astro", void 0);

const $$file = "C:/Users/diego/catalogo-motos - admin/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
