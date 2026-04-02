import { formatoPesos, limpiarMoneda } from './utils';
import { descuentoGlobalPorcentaje } from './carrito';

// ── Estado exportado (live bindings) ─────────────────────────────────────────
export let tipoVenta: string        = 'todo';
export let metodoPago: string       = 'efectivo';
export let totalBrutoVenta: number  = 0;
export let totalNetoVenta: number   = 0;

// ── Refs privadas del DOM ─────────────────────────────────────────────────────
let _checkoutSubtotal: HTMLElement;
let _globalDescPerc: HTMLInputElement;
let _globalDescVal: HTMLInputElement;
let _checkoutTotalNeto: HTMLElement;
let _checkoutTotalRecibido: HTMLElement;
let _cajaCambio: HTMLElement;
let _lblCambio: HTMLElement;
let _checkoutCambio: HTMLElement;
let _btnConfirmarPago: HTMLButtonElement;
let _seccionMetodoPago: HTMLElement;
let _seccionPagoMultiple: HTMLElement;
let _contMontoUnico: HTMLElement;
let _inputMontoRecibido: HTMLInputElement;
let _contMontoMultiple: HTMLElement;
let _lblRestanteMulti: HTMLElement;
let _multiEfectivo: HTMLInputElement;
let _multiNequi: HTMLInputElement;
let _multiTarjeta: HTMLInputElement;
let _seccionFechaPago: HTMLElement;
let _inputFechaPago: HTMLInputElement;

// ── Inicialización ────────────────────────────────────────────────────────────

export function initCheckout(refs: {
  checkoutSubtotal: HTMLElement;
  globalDescPerc: HTMLInputElement;
  globalDescVal: HTMLInputElement;
  checkoutTotalNeto: HTMLElement;
  checkoutTotalRecibido: HTMLElement;
  cajaCambio: HTMLElement;
  lblCambio: HTMLElement;
  checkoutCambio: HTMLElement;
  btnConfirmarPago: HTMLButtonElement;
  seccionMetodoPago: HTMLElement;
  seccionPagoMultiple: HTMLElement;
  contMontoUnico: HTMLElement;
  inputMontoRecibido: HTMLInputElement;
  contMontoMultiple: HTMLElement;
  lblRestanteMulti: HTMLElement;
  multiEfectivo: HTMLInputElement;
  multiNequi: HTMLInputElement;
  multiTarjeta: HTMLInputElement;
  seccionFechaPago: HTMLElement;
  inputFechaPago: HTMLInputElement;
}) {
  _checkoutSubtotal      = refs.checkoutSubtotal;
  _globalDescPerc        = refs.globalDescPerc;
  _globalDescVal         = refs.globalDescVal;
  _checkoutTotalNeto     = refs.checkoutTotalNeto;
  _checkoutTotalRecibido = refs.checkoutTotalRecibido;
  _cajaCambio            = refs.cajaCambio;
  _lblCambio             = refs.lblCambio;
  _checkoutCambio        = refs.checkoutCambio;
  _btnConfirmarPago      = refs.btnConfirmarPago;
  _seccionMetodoPago     = refs.seccionMetodoPago;
  _seccionPagoMultiple   = refs.seccionPagoMultiple;
  _contMontoUnico        = refs.contMontoUnico;
  _inputMontoRecibido    = refs.inputMontoRecibido;
  _contMontoMultiple     = refs.contMontoMultiple;
  _lblRestanteMulti      = refs.lblRestanteMulti;
  _multiEfectivo         = refs.multiEfectivo;
  _multiNequi            = refs.multiNequi;
  _multiTarjeta          = refs.multiTarjeta;
  _seccionFechaPago      = refs.seccionFechaPago;
  _inputFechaPago        = refs.inputFechaPago;

  // Descuento global
  _globalDescPerc.addEventListener('input', () => {
    let perc = parseFloat(_globalDescPerc.value) || 0;
    if (perc > 100) perc = 100;
    if (perc < 0) perc = 0;
    const val = Math.round((perc / 100) * totalBrutoVenta);
    _globalDescVal.value = val > 0 ? val.toLocaleString('es-CO') : '';
    actualizarCheckout();
  });

  _globalDescVal.addEventListener('input', () => {
    let val = limpiarMoneda(_globalDescVal.value);
    _globalDescVal.value = val === 0 ? '' : val.toLocaleString('es-CO');
    _globalDescPerc.value = val > 0
      ? String(Number(((val / totalBrutoVenta) * 100).toFixed(2)))
      : '';
    actualizarCheckout();
  });

  // Monto recibido
  _inputMontoRecibido.addEventListener('input', () => {
    let val = limpiarMoneda(_inputMontoRecibido.value);
    _inputMontoRecibido.value = val === 0 ? '' : val.toLocaleString('es-CO');
    actualizarCheckout();
  });

  // Inputs múltiples
  document.querySelectorAll('.multi-input').forEach(input => {
    input.addEventListener('input', e => {
      let val = limpiarMoneda((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).value = val === 0 ? '' : val.toLocaleString('es-CO');
      actualizarCheckout();
    });
  });

  // Botones tipo venta
  document.querySelectorAll('.tipo-venta-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.tipo-venta-btn').forEach(b => {
        b.classList.remove('bg-white', 'shadow-sm', 'text-gray-800', 'border-gray-200');
        b.classList.add('text-gray-500', 'border-transparent');
      });
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('text-gray-500', 'border-transparent');
      target.classList.add('bg-white', 'shadow-sm', 'text-gray-800', 'border-gray-200');

      tipoVenta = target.getAttribute('data-tipo') || 'todo';

      // Mostrar u ocultar selector de fecha según el tipo de venta
      if (tipoVenta === 'credito' || tipoVenta === 'abono') {
        _seccionFechaPago.classList.remove('hidden');
      } else {
        _seccionFechaPago.classList.add('hidden');
        _inputFechaPago.value = '';
      }

      if (tipoVenta === 'credito') {
        _seccionMetodoPago.classList.add('hidden');
        _contMontoUnico.classList.add('hidden');
        _contMontoMultiple.classList.add('hidden');
        _seccionPagoMultiple.classList.add('hidden');
      } else {
        _seccionMetodoPago.classList.remove('hidden');
        if (metodoPago === 'multiple') {
          _seccionPagoMultiple.classList.remove('hidden');
          _contMontoMultiple.classList.remove('hidden');
          _contMontoUnico.classList.add('hidden');
        } else {
          _seccionPagoMultiple.classList.add('hidden');
          _contMontoMultiple.classList.add('hidden');
          _contMontoUnico.classList.remove('hidden');
          if (tipoVenta === 'todo' && metodoPago !== 'efectivo') {
            _inputMontoRecibido.value = totalNetoVenta.toLocaleString('es-CO');
          }
        }
      }
      actualizarCheckout();
    });
  });

  // Botones método de pago
  document.querySelectorAll('.pay-method-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.pay-method-btn').forEach(b => {
        b.classList.remove(
          'bg-orange-50', 'text-orange-700', 'border-orange-400',
          'bg-pink-50', 'text-[#DA0081]', 'border-[#DA0081]',
          'bg-purple-50', 'text-purple-700', 'border-purple-400'
        );
        b.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
      });

      const target = e.currentTarget as HTMLElement;
      metodoPago = target.getAttribute('data-method') || 'efectivo';
      target.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');

      if (metodoPago === 'nequi')    target.classList.add('bg-pink-50', 'text-[#DA0081]', 'border-[#DA0081]');
      else if (metodoPago === 'multiple') target.classList.add('bg-purple-50', 'text-purple-700', 'border-purple-400');
      else                                target.classList.add('bg-orange-50', 'text-orange-700', 'border-orange-400');

      if (metodoPago === 'multiple') {
        _seccionPagoMultiple.classList.remove('hidden');
        _contMontoUnico.classList.add('hidden');
        _contMontoMultiple.classList.remove('hidden');
      } else {
        _seccionPagoMultiple.classList.add('hidden');
        _contMontoMultiple.classList.add('hidden');
        _contMontoUnico.classList.remove('hidden');
        if (metodoPago !== 'efectivo') {
          _inputMontoRecibido.value    = totalNetoVenta.toLocaleString('es-CO');
          _inputMontoRecibido.disabled = tipoVenta === 'todo';
        } else {
          _inputMontoRecibido.disabled = false;
        }
      }
      actualizarCheckout();
    });
  });

  // Dinero rápido
  document.querySelectorAll('.quick-cash-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (_inputMontoRecibido.disabled) return;
      const amount = (e.target as HTMLElement).getAttribute('data-amount');
      if (amount === 'exacto') {
        _inputMontoRecibido.value = totalNetoVenta.toLocaleString('es-CO');
      } else {
        const valorActual = limpiarMoneda(_inputMontoRecibido.value);
        _inputMontoRecibido.value = (valorActual + parseInt(amount || '0')).toLocaleString('es-CO');
      }
      actualizarCheckout();
    });
  });

  // Acciones auxiliares
  document.getElementById('pagoMultipleBtn')?.addEventListener('click', () => {
    document.querySelector<HTMLElement>('.pay-method-btn[data-method="multiple"]')?.click();
  });

  document.getElementById('btnEliminarPago')?.addEventListener('click', () => {
    _multiEfectivo.value = '';
    _multiNequi.value    = '';
    _multiTarjeta.value  = '';
    if (metodoPago === 'multiple') actualizarCheckout();
  });
}

// ── API pública ───────────────────────────────────────────────────────────────

export function setTotalBruto(total: number) {
  totalBrutoVenta = total;
}

export function getRecibidoFinal(): number {
  if (tipoVenta === 'credito') return 0;
  if (metodoPago === 'multiple') {
    return (
      limpiarMoneda(_multiEfectivo.value) +
      limpiarMoneda(_multiNequi.value) +
      limpiarMoneda(_multiTarjeta.value)
    );
  }
  return limpiarMoneda(_inputMontoRecibido.value);
}

export function getDescuentoGlobal(): number {
  return limpiarMoneda(_globalDescVal.value);
}

export const resetCheckoutUI = () => {
  // Sincronizamos el descuento del modal con el descuento global actual del carrito.
  _globalDescPerc.value  = descuentoGlobalPorcentaje > 0 ? String(descuentoGlobalPorcentaje) : '';
  _globalDescVal.value   = '';
  _multiEfectivo.value   = '';
  _multiNequi.value      = '';
  _multiTarjeta.value    = '';
  _inputMontoRecibido.value = '0';
  _lblRestanteMulti.innerText   = 'Faltan: $0';
  _lblRestanteMulti.className   = 'text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-colors';
  document.querySelector<HTMLElement>('.tipo-venta-btn[data-tipo="todo"]')?.click();
  document.querySelector<HTMLElement>('.pay-method-btn[data-method="efectivo"]')?.click();

  // Si hay porcentaje, forzamos el cálculo del valor en pesos y total neto.
  if (_globalDescPerc.value) {
    _globalDescPerc.dispatchEvent(new Event('input'));
  } else {
    actualizarCheckout();
  }
};

export const actualizarCheckout = () => {
  let descVal = limpiarMoneda(_globalDescVal.value);
  if (descVal > totalBrutoVenta) {
    descVal = totalBrutoVenta;
    _globalDescVal.value = formatoPesos(descVal).replace('$', '');
  }

  // Guardamos el valor previo antes de recalcular para decidir si autoajustar.
  const montoPrevio = limpiarMoneda(_inputMontoRecibido.value);

  totalNetoVenta = totalBrutoVenta - descVal;

  _checkoutSubtotal.innerText  = formatoPesos(totalBrutoVenta);
  _checkoutTotalNeto.innerText = formatoPesos(totalNetoVenta);

  // Autoajuste UX del monto recibido cuando aplica descuento.
  if (tipoVenta === 'todo') {
    if (montoPrevio === totalBrutoVenta || montoPrevio === 0 || metodoPago !== 'efectivo') {
      _inputMontoRecibido.value = totalNetoVenta > 0 ? totalNetoVenta.toLocaleString('es-CO') : '';
    }
  }

  let recibido = 0;
  if (tipoVenta === 'credito') {
    recibido = 0;
    _inputMontoRecibido.value = '0';
  } else if (metodoPago === 'multiple') {
    recibido =
      limpiarMoneda(_multiEfectivo.value) +
      limpiarMoneda(_multiNequi.value)    +
      limpiarMoneda(_multiTarjeta.value);

    const diff = totalNetoVenta - recibido;
    if (diff > 0) {
      _lblRestanteMulti.innerText = `Faltan: ${formatoPesos(diff)}`;
      _lblRestanteMulti.className = 'text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md transition-colors';
    } else if (diff < 0) {
      _lblRestanteMulti.innerText = `Sobra (Cambio): ${formatoPesos(Math.abs(diff))}`;
      _lblRestanteMulti.className = 'text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md transition-colors';
    } else {
      _lblRestanteMulti.innerText = '¡Distribución Perfecta!';
      _lblRestanteMulti.className = 'text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md transition-colors';
    }
  } else {
    recibido = limpiarMoneda(_inputMontoRecibido.value);
  }

  _checkoutTotalRecibido.innerText = formatoPesos(recibido);
  _btnConfirmarPago.disabled = false;

  if (tipoVenta === 'todo') {
    const cambio = recibido - totalNetoVenta;
    if (cambio < 0) {
      _cajaCambio.className    = 'flex flex-col justify-center items-center bg-red-50 p-4 rounded-2xl border border-red-200 mt-auto transition-colors gap-1';
      _lblCambio.className     = 'text-red-800 font-bold uppercase tracking-wide text-[11px]';
      _checkoutCambio.className = 'text-2xl font-black text-red-600';
      _checkoutCambio.innerText = 'Falta ' + formatoPesos(Math.abs(cambio));
      _btnConfirmarPago.disabled = true;
    } else {
      _cajaCambio.className    = 'flex flex-col justify-center items-center bg-green-50 p-4 rounded-2xl border border-green-200 mt-auto transition-colors gap-1';
      _lblCambio.className     = 'text-green-800 font-bold uppercase tracking-wide text-[11px]';
      _checkoutCambio.className = 'text-3xl font-black text-green-600';
      _checkoutCambio.innerText = formatoPesos(cambio);
      _lblCambio.innerText     = 'Dar Cambio';
    }
  } else if (tipoVenta === 'abono') {
    const saldo = totalNetoVenta - recibido;
    if (saldo <= 0) {
      _cajaCambio.className    = 'flex flex-col justify-center items-center bg-red-50 p-4 rounded-2xl border border-red-200 mt-auto transition-colors gap-1';
      _lblCambio.className     = 'text-red-800 font-bold uppercase tracking-wide text-[11px]';
      _checkoutCambio.className = 'text-lg font-black text-red-600 text-center';
      _checkoutCambio.innerText = 'El abono debe ser menor al total';
      _btnConfirmarPago.disabled = true;
    } else if (recibido === 0) {
      _cajaCambio.className    = 'flex flex-col justify-center items-center bg-orange-50 p-4 rounded-2xl border border-orange-200 mt-auto transition-colors gap-1';
      _lblCambio.className     = 'text-orange-800 font-bold uppercase tracking-wide text-[11px]';
      _checkoutCambio.className = 'text-xl font-black text-orange-600 text-center';
      _checkoutCambio.innerText = 'Ingresa el abono';
      _btnConfirmarPago.disabled = true;
    } else {
      _cajaCambio.className    = 'flex flex-col justify-center items-center bg-orange-50 p-4 rounded-2xl border border-orange-200 mt-auto transition-colors gap-1';
      _lblCambio.className     = 'text-orange-800 font-bold uppercase tracking-wide text-[11px]';
      _checkoutCambio.className = 'text-3xl font-black text-orange-600';
      _checkoutCambio.innerText = formatoPesos(saldo);
      _lblCambio.innerText     = 'Saldo Pendiente';
    }
  } else if (tipoVenta === 'credito') {
    _cajaCambio.className    = 'flex flex-col justify-center items-center bg-blue-50 p-4 rounded-2xl border border-blue-200 mt-auto transition-colors gap-1';
    _lblCambio.className     = 'text-blue-800 font-bold uppercase tracking-wide text-[11px]';
    _checkoutCambio.className = 'text-3xl font-black text-blue-600';
    _checkoutCambio.innerText = formatoPesos(totalNetoVenta);
    _lblCambio.innerText     = 'Deuda Total (Crédito)';
  }
};
