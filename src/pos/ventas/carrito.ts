import type { CartItem } from './types';
import { formatoPesos } from './utils';

// Estado del carrito (array mutable exportado como referencia)
export const carrito: CartItem[] = [];
export let descuentoGlobalPorcentaje = 0;

export const setDescuentoGlobal = (porcentaje: number) => {
  descuentoGlobalPorcentaje = Number.isFinite(porcentaje) ? Math.max(0, porcentaje) : 0;
  renderCarrito();
};

// Refs privadas del DOM — se asignan en initCarrito
let _contenedor: HTMLElement;
let _vacioEl: HTMLElement;
let _txtSubtotal: HTMLElement;
let _txtTotal: HTMLElement;
let _modalDescuento: HTMLElement;
let _modName: HTMLElement;
let _modOrigPrice: HTMLElement;
let _modQty: HTMLElement;
let _modOrigTotal: HTMLElement;
let _modDescPerc: HTMLInputElement;
let _modDescVal: HTMLInputElement;
let _modNewTotal: HTMLElement;

let currentEditCartIndex: number | null = null;
let currentItemOriginalSubtotal = 0;

// ── Inicialización ────────────────────────────────────────────────────────────

export function initCarrito(refs: {
  contenedor: HTMLElement;
  vacioEl: HTMLElement;
  txtSubtotal: HTMLElement;
  txtTotal: HTMLElement;
  modalDescuento: HTMLElement;
  modName: HTMLElement;
  modOrigPrice: HTMLElement;
  modQty: HTMLElement;
  modOrigTotal: HTMLElement;
  modDescPerc: HTMLInputElement;
  modDescVal: HTMLInputElement;
  modNewTotal: HTMLElement;
}) {
  _contenedor    = refs.contenedor;
  _vacioEl       = refs.vacioEl;
  _txtSubtotal   = refs.txtSubtotal;
  _txtTotal      = refs.txtTotal;
  _modalDescuento = refs.modalDescuento;
  _modName        = refs.modName;
  _modOrigPrice   = refs.modOrigPrice;
  _modQty         = refs.modQty;
  _modOrigTotal   = refs.modOrigTotal;
  _modDescPerc    = refs.modDescPerc;
  _modDescVal     = refs.modDescVal;
  _modNewTotal    = refs.modNewTotal;

  // Eventos del modal de descuento
  _modDescPerc.addEventListener('input', () => {
    let perc = parseFloat(_modDescPerc.value) || 0;
    if (perc > 100) perc = 100;
    if (perc < 0) perc = 0;
    _modDescVal.value = perc ? String(Math.round((perc / 100) * currentItemOriginalSubtotal)) : '';
    _actualizarTotalesModal();
  });

  _modDescVal.addEventListener('input', () => {
    let val = parseFloat(_modDescVal.value) || 0;
    if (val > currentItemOriginalSubtotal) val = currentItemOriginalSubtotal;
    if (val < 0) val = 0;
    _modDescPerc.value = val
      ? String(Number(((val / currentItemOriginalSubtotal) * 100).toFixed(2)))
      : '';
    _actualizarTotalesModal();
  });

  document.getElementById('btnSaveCartItem')?.addEventListener('click', () => {
    if (currentEditCartIndex !== null) {
      carrito[currentEditCartIndex].descuentoTotal = parseFloat(_modDescVal.value) || 0;
      renderCarrito();
    }
    _modalDescuento.classList.add('hidden');
  });

  document.getElementById('btnRemoveCartItem')?.addEventListener('click', () => {
    if (currentEditCartIndex !== null) {
      carrito.splice(currentEditCartIndex, 1);
      renderCarrito();
    }
    _modalDescuento.classList.add('hidden');
  });

  document.getElementById('btnCancelCartItem')?.addEventListener('click', () => {
    _modalDescuento.classList.add('hidden');
  });
}

// ── Utilidades privadas ───────────────────────────────────────────────────────

const _actualizarTotalesModal = () => {
  let val = parseFloat(_modDescVal.value) || 0;
  if (val > currentItemOriginalSubtotal) val = currentItemOriginalSubtotal;
  _modNewTotal.innerText = formatoPesos(currentItemOriginalSubtotal - val);
};

const actualizarStockVisualDesdeCarrito = () => {
  const stockEls = Array.from(document.querySelectorAll<HTMLElement>('[id^="stock-visual-"]'));

  stockEls.forEach((el) => {
    const idProducto = el.id.replace('stock-visual-', '');
    const base = parseInt(el.getAttribute('data-stock-base') || el.innerText || '0', 10);
    const cantidadEnCarrito = carrito
      .filter((item) => item.id === idProducto)
      .reduce((acc, item) => acc + item.cantidad, 0);

    const disponible = Math.max(base - cantidadEnCarrito, 0);
    el.innerText = String(disponible);

    const btnAgregar = document.querySelector<HTMLButtonElement>(`.btn-agregar[data-id="${idProducto}"]`);
    if (btnAgregar) {
      btnAgregar.disabled = disponible <= 0;
    }
  });
};

// ── API pública ───────────────────────────────────────────────────────────────

export const vaciarCarrito = () => {
  carrito.splice(0, carrito.length);
};

export const abrirModalDescuento = (index: number) => {
  currentEditCartIndex = index;
  const item = carrito[index];
  currentItemOriginalSubtotal = item.precio * item.cantidad;

  _modName.innerText     = item.familia.toUpperCase() + ' | REF: ' + item.modelo.toUpperCase();
  _modOrigPrice.innerText = formatoPesos(item.precio);
  _modQty.innerText       = String(item.cantidad);
  _modOrigTotal.innerText = formatoPesos(currentItemOriginalSubtotal);

  const descTotal = item.descuentoTotal || 0;
  _modDescVal.value  = descTotal ? String(descTotal) : '';
  _modDescPerc.value = descTotal
    ? String(Number(((descTotal / currentItemOriginalSubtotal) * 100).toFixed(2)))
    : '';

  _actualizarTotalesModal();
  _modalDescuento.classList.remove('hidden');
};

// Carga productos de una factura previa al formato visual del carrito.
export const inyectarProductosAlCarrito = (productosAntiguos: any[] = []) => {
  carrito.length = 0;

  productosAntiguos.forEach((item: any, idx: number) => {
    carrito.push({
      id: String(item.id || item.producto_id || item.referencia_id || `${idx}-${item.modelo || 'GEN'}`),
      modelo: String(item.modelo || item.nombre_producto || item.descripcion || 'GENÉRICO'),
      familia: String(item.familia || 'VARIOS'),
      precio: Number(item.precio || item.precio_unitario || item.precio_venta || 0),
      cantidad: Number(item.cantidad || 1),
      stockMaximo: Number(item.stockMaximo || item.stock_maximo || 9999),
      descuentoTotal: Number(item.descuentoTotal || 0),
    });
  });

  renderCarrito();
};

export const renderCarrito = () => {
  _contenedor.innerHTML = '';
  let total = 0;

  if (carrito.length === 0) {
    _contenedor.appendChild(_vacioEl);
    _vacioEl.style.display = 'flex';
  } else {
    _vacioEl.style.display = 'none';

    carrito.forEach((item, index) => {
      const descuentoTotal   = item.descuentoTotal || 0;
      const subtotalOriginal = item.precio * item.cantidad;
      const subtotalItem     = subtotalOriginal - descuentoTotal;
      total += subtotalItem;
      const hasDiscount = descuentoTotal > 0;

      const div = document.createElement('div');
      div.className =
        'flex justify-between items-center p-2 mb-2 bg-white rounded-lg border border-gray-200 shadow-sm transition-all hover:border-orange-300';
      div.innerHTML = `
        <div class="w-[50%] pr-2 cursor-pointer btn-editar-item group" data-index="${index}" title="Click para aplicar descuento">
          <p class="text-[11px] font-bold text-gray-800 leading-tight group-hover:text-orange-600 transition-colors uppercase line-clamp-1">${item.familia}</p>
          <p class="text-[9px] text-gray-500 uppercase mt-0.5 truncate">Ref: ${item.modelo}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <p class="text-[10px] text-gray-500">${formatoPesos(item.precio)} c/u</p>
            ${hasDiscount ? `<span class="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">-${formatoPesos(descuentoTotal)}</span>` : ''}
          </div>
        </div>

        <div class="flex items-center w-[25%] justify-center">
          <input type="number" min="1" max="${item.stockMaximo}" value="${item.cantidad}" data-index="${index}"
            class="input-cantidad w-12 text-center text-xs border border-gray-300 rounded p-1 font-bold outline-orange-400 bg-gray-50" />
        </div>

        <div class="w-[25%] flex flex-col items-end justify-center gap-0.5">
          ${hasDiscount ? `<p class="text-[9px] text-gray-400 line-through font-bold">${formatoPesos(subtotalOriginal)}</p>` : ''}
          <p class="text-xs font-black text-gray-900">${formatoPesos(subtotalItem)}</p>
          <button data-index="${index}" class="btn-eliminar-item text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors mt-0.5" title="Eliminar del pedido">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      `;
      _contenedor.appendChild(div);
    });
  }

  const descuentoGlobalValor = total * (descuentoGlobalPorcentaje / 100);
  const totalNeto = total - descuentoGlobalValor;

  _txtSubtotal.innerText = formatoPesos(total);
  _txtTotal.innerText    = formatoPesos(totalNeto);

  const txtDescuentoGlobal = document.getElementById('txtDescuentoGlobalValor');
  if (txtDescuentoGlobal) {
    txtDescuentoGlobal.innerText = descuentoGlobalValor > 0
      ? `- ${formatoPesos(descuentoGlobalValor)} (${descuentoGlobalPorcentaje}%)`
      : '$0';
  }

  actualizarStockVisualDesdeCarrito();

  // === MAGIA UX PARA CELULARES ===
  // 1. Contamos cuántos productos hay en total
  const cantidadTotalRepuestos = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // 2. Buscamos los elementos del botón flotante
  const btnMovil = document.getElementById('btnResumenMovil');
  const txtCantidadMovil = document.getElementById('txtCantidadMovil');
  const txtTotalMovil = document.getElementById('txtTotalMovil');

  if (btnMovil && txtCantidadMovil && txtTotalMovil) {
    // 3. Actualizamos los textos
    txtCantidadMovil.innerText = `${cantidadTotalRepuestos} ${cantidadTotalRepuestos === 1 ? 'repuesto' : 'repuestos'}`;
    txtTotalMovil.innerText = formatoPesos(totalNeto);

    // 4. Mostramos/ocultamos el botón según el estado del carrito
    if (cantidadTotalRepuestos > 0) {
      btnMovil.classList.remove('translate-y-32');
    } else {
      btnMovil.classList.add('translate-y-32');
    }
  }

  asignarEventosCarrito();
};

export const asignarEventosCarrito = () => {
  document.querySelectorAll('.input-cantidad').forEach(input => {
    input.addEventListener('change', e => {
      const index    = parseInt((e.target as HTMLInputElement).getAttribute('data-index') || '0');
      let nuevaCant  = parseInt((e.target as HTMLInputElement).value);
      const stockMax = carrito[index].stockMaximo;
      if (isNaN(nuevaCant) || nuevaCant < 1) nuevaCant = 1;
      if (nuevaCant > stockMax) {
        alert(`Stock insuficiente. Máximo: ${stockMax}`);
        nuevaCant = stockMax;
      }
      carrito[index].cantidad      = nuevaCant;
      carrito[index].descuentoTotal = 0;
      renderCarrito();
    });
  });

  document.querySelectorAll('.btn-eliminar-item').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
      const itemRemovido = carrito[index];

      if (itemRemovido) {
        const elementoStock = document.getElementById(`stock-visual-${itemRemovido.id}`);
        if (elementoStock) {
          const stockVisualActual = parseInt(elementoStock.innerText || '0', 10) || 0;
          elementoStock.innerText = String(stockVisualActual + itemRemovido.cantidad);
        }
      }

      carrito.splice(index, 1);
      renderCarrito();
    });
  });

  document.querySelectorAll('.btn-editar-item').forEach(el => {
    el.addEventListener('click', e => {
      const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
      abrirModalDescuento(index);
    });
  });
};

export const agregarProductoAlCarrito = (btnElement: HTMLElement) => {
  if ((btnElement as HTMLButtonElement).disabled) return;

  const id     = btnElement.getAttribute('data-id') || '';
  const modelo = btnElement.getAttribute('data-modelo') || '';
  const familia = btnElement.getAttribute('data-familia') || '';
  const precio = parseFloat(btnElement.getAttribute('data-precio') || '0');
  const stock  = parseInt(btnElement.getAttribute('data-stock') || '0');

  const elementoStock = document.getElementById(`stock-visual-${id}`);
  if (elementoStock) {
    const stockVisualActual = parseInt(elementoStock.innerText || '0', 10);
    if (stockVisualActual <= 0) {
      alert(`¡No hay más stock disponible para ${modelo}!`);
      return;
    }
    elementoStock.innerText = String(stockVisualActual - 1);
  }

  const existe = carrito.find(item => item.id === id);
  if (existe) {
    if (existe.cantidad < existe.stockMaximo) {
      existe.cantidad++;
      existe.descuentoTotal = 0;
    } else {
      alert(`¡Stock máximo alcanzado! Solo hay ${stock} en bodega.`);
    }
  } else {
    carrito.push({ id, modelo, familia, precio, cantidad: 1, stockMaximo: stock, descuentoTotal: 0 });
  }
  renderCarrito();
};
