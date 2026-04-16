import type { VentaSnapshot } from './types';
import { formatoPesos } from './utils';

// ── Render de datos en la factura HTML ────────────────────────────────────────

export function renderFactura(venta: VentaSnapshot): void {
  const abono = Math.max(0, Math.min(Number(venta.recibido || 0), Number(venta.totalNeto || 0)));
  const saldoPendiente = Math.max(0, Number(venta.totalNeto || 0) - abono);
  const mostrarDetalleSaldo = venta.tipoVenta === 'credito' || saldoPendiente > 0;

  (document.getElementById('invNumber') as HTMLElement).innerText =
    venta.numeroComprobante;
  (document.getElementById('invDate') as HTMLElement).innerText =
    venta.fecha;
  (document.getElementById('invStatus') as HTMLElement).innerText =
    venta.tipoVenta === 'credito'
      ? 'PENDIENTE DE PAGO'
      : venta.tipoVenta === 'abono'
      ? 'PAGO PARCIAL'
      : 'PAGADO';
  (document.getElementById('invClientName') as HTMLElement).innerText =
    venta.cliente;
  (document.getElementById('invClientPhone') as HTMLElement).innerText =
    'TEL: ' + venta.telefono;

  const tbody = document.getElementById('invItemsTable') as HTMLElement;
  tbody.innerHTML = '';
  venta.items.forEach(item => {
    const descuentoItemTotal = item.descuentoTotal || 0;
    const precioFinalItem    = item.precio - descuentoItemTotal / item.cantidad;
    const totalLinea         = precioFinalItem * item.cantidad;

    // Generación del Código Inteligente
    const familiaStr = (item.familia || '').toString().toUpperCase();
    const modeloStr  = (item.modelo || '').toString().toUpperCase();

    const prefijoFam = familiaStr.substring(0, 3).replace(/[^A-Z]/g, '').padEnd(3, 'X');
    const prefijoMod = modeloStr.substring(0, 4).replace(/[^A-Z0-9]/g, '').padEnd(4, '0');
    const idInteligente = `${prefijoFam}-${prefijoMod}`;

    tbody.innerHTML += `
      <tr class="hover:bg-gray-50 border-b border-gray-100 last:border-0">
        <td class="py-2 px-1 text-center font-black text-orange-600 align-top text-[10px] tracking-wide">${idInteligente}</td>
        
        <td class="py-2 px-1 text-center font-bold align-top">${item.cantidad}</td>
        
        <td class="py-2 px-1 align-top">
          <p class="font-bold text-gray-800 leading-tight uppercase text-[11px]">${familiaStr}</p>
          <p class="text-[9px] text-gray-500 mt-0.5 uppercase">Ref: ${modeloStr}</p>
          ${descuentoItemTotal > 0 ? `<p class="text-[10px] text-red-600 font-bold mt-0.5">Ahorro: -${formatoPesos(descuentoItemTotal)}</p>` : ''}
        </td>
        
        <td class="py-2 px-1 text-right hidden-tirilla text-gray-600 align-top">${formatoPesos(item.precio)}</td>
        <td class="py-2 px-1 text-right text-red-500 hidden-tirilla align-top">${descuentoItemTotal > 0 ? '-' + formatoPesos(descuentoItemTotal) : '$0'}</td>
        <td class="py-2 px-1 text-right font-black text-gray-900 align-top">${formatoPesos(totalLinea)}</td>
      </tr>
    `;
  });

  (document.getElementById('invSubtotal') as HTMLElement).innerText  = formatoPesos(venta.subtotal);
  (document.getElementById('invDescuento') as HTMLElement).innerText = '-' + formatoPesos(venta.descuentoGlobal);
  (document.getElementById('invTotalNeto') as HTMLElement).innerText = formatoPesos(venta.totalNeto);

  const detalleSaldo = document.getElementById('invDetalleSaldo') as HTMLElement | null;
  const invAbono = document.getElementById('invAbono') as HTMLElement | null;
  const invSaldoPendiente = document.getElementById('invSaldoPendiente') as HTMLElement | null;

  if (detalleSaldo && invAbono && invSaldoPendiente) {
    detalleSaldo.classList.toggle('hidden', !mostrarDetalleSaldo);
    invAbono.innerText = formatoPesos(abono);
    invSaldoPendiente.innerText = formatoPesos(saldoPendiente);
  }
}

// ── Modal de factura: toggles formato Carta / Tirilla y botones ───────────────

export function initFacturaModal(
  invoiceModal: HTMLElement,
  printSection: HTMLElement,
  onPrint?: () => void | Promise<void>
): void {
  const btnCarta   = document.getElementById('btnFormatCarta')!;
  const btnTirilla = document.getElementById('btnFormatTirilla')!;

  btnCarta.addEventListener('click', () => {
    printSection.classList.remove('formato-tirilla');
    printSection.classList.add('max-w-3xl');
    btnCarta.classList.replace('bg-gray-700',   'bg-orange-500');
    btnCarta.classList.replace('border-gray-600', 'border-orange-500');
    btnCarta.classList.replace('text-gray-300',  'text-white');
    btnTirilla.classList.replace('bg-orange-500', 'bg-gray-700');
    btnTirilla.classList.replace('border-orange-500', 'border-gray-600');
    btnTirilla.classList.replace('text-white',   'text-gray-300');
    document.querySelectorAll<HTMLElement>('.hidden-tirilla').forEach(el => (el.style.display = ''));
  });

  btnTirilla.addEventListener('click', () => {
    printSection.classList.add('formato-tirilla');
    printSection.classList.remove('max-w-3xl');
    btnTirilla.classList.replace('bg-gray-700',   'bg-orange-500');
    btnTirilla.classList.replace('border-gray-600', 'border-orange-500');
    btnTirilla.classList.replace('text-gray-300',  'text-white');
    btnCarta.classList.replace('bg-orange-500',  'bg-gray-700');
    btnCarta.classList.replace('border-orange-500', 'border-gray-600');
    btnCarta.classList.replace('text-white',     'text-gray-300');
    document.querySelectorAll<HTMLElement>('.hidden-tirilla').forEach(el => (el.style.display = 'none'));
  });

  document.getElementById('btnPrintInvoice')?.addEventListener('click', async () => {
    try {
      if (onPrint) {
        await onPrint();
      }
    } catch (error) {
      console.error('Error al abrir vista previa de impresión:', error);
      alert('No se pudo abrir la vista previa de impresión. Revisa si el navegador bloqueó la ventana.');
    }
  });
  document.getElementById('btnCloseInvoice')?.addEventListener('click', () =>
    invoiceModal.classList.add('hidden')
  );
}
