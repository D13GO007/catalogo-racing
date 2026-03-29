const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../src/pages/pos/ventas.astro');
let content = fs.readFileSync(file, 'utf8');

const startMarker = "      // ==========================================\r\n      // LÓGICA DE LA VISTA DE PAGO (CHECKOUT AVANZADO)\r\n      // ==========================================\r\n";
const altStartMarker = "      // ==========================================\n      // LÓGICA DE LA VISTA DE PAGO (CHECKOUT AVANZADO)\n      // ==========================================\n";
const endMarker = "</script>";

let start = content.indexOf(startMarker);
let markerUsed = 'CRLF';
if (start === -1) {
  start = content.indexOf(altStartMarker);
  markerUsed = 'LF';
}

if (start === -1) {
  console.error('Start marker not found.');
  process.exit(1);
}

const end = content.lastIndexOf(endMarker);
if (end === -1) {
  console.error('End marker not found.');
  process.exit(1);
}

const prefix = content.slice(0, start);
const suffix = content.slice(end + endMarker.length);

const newBlock = `      // ==========================================
      // LÓGICA DE LA VISTA DE PAGO (CHECKOUT AVANZADO)
      // ==========================================
      // Variables y referencias
      const checkoutModal = document.getElementById('checkoutModal');
      const checkoutContainer = document.getElementById('checkoutContainer');

      const checkoutSubtotal = document.getElementById('checkoutSubtotal');
      const globalDescPerc = document.getElementById('globalDescPerc');
      const globalDescVal = document.getElementById('globalDescVal');
      const totalNetoVenta = document.getElementById('checkoutTotalNeto');
      const checkoutTotalRecibido = document.getElementById('checkoutTotalRecibido');

      const cajaCambio = document.getElementById('cajaCambio');
      const lblCambio = document.getElementById('lblCambio');
      const checkoutCambio = document.getElementById('checkoutCambio');
      const btnConfirmarPago = document.getElementById('btnConfirmarPago');

      const seccionMetodoPago = document.getElementById('seccionMetodoPago');
      const seccionPagoMultiple = document.getElementById('seccionPagoMultiple');

      // Contenedores e Inputs
      const contMontoUnico = document.getElementById('contenedorMontoUnico');
      const inputMontoRecibido = document.getElementById('inputMontoRecibido');
      const contMontoMultiple = document.getElementById('contenedorMontoMultiple');
      const multiEfectivo = document.getElementById('multiEfectivo');
      const multiNequi = document.getElementById('multiNequi');
      const multiTarjeta = document.getElementById('multiTarjeta');

      const tipoVentaBtns = document.querySelectorAll('.tipo-venta-btn');
      const pagoMultipleBtn = document.getElementById('pagoMultipleBtn');
      const btnEliminarPago = document.getElementById('btnEliminarPago');

      let totalBrutoVenta = 0; // Suma de items (ya con sus descuentos individuales)
      let totalNetoVenta = 0; // Total después del descuento global
      let totalVentaActual = 0; // Total después de descuentos individuales + globales
      let tipoVenta = 'todo'; // 'todo', 'abono', 'credito'
      let metodoPago = 'efectivo'; // 'efectivo', 'nequi', 'tarjeta', 'multiple'
      let pagosMultiples = [];

      // Función auxiliar para limpiar la moneda "$ 1.500" -> 1500
      const limpiarMoneda = (str) => parseInt(str.toString().replace(/\D/g, ''), 10) || 0;

      const calcularTotales = () => {
        totalBrutoVenta = carrito.reduce((sum, item) => sum + ((item.precio * item.cantidad) - (item.descuentoTotal || 0)), 0);
        totalNetoVenta = Math.max(totalBrutoVenta - (parseInt(globalDescVal.value) || 0), 0);
        totalVentaActual = totalNetoVenta;

        // Si es abono o crédito, solo se paga una parte (por ejemplo el 30%)
        if (tipoVenta === 'abono') {
          totalVentaActual = Math.max(Math.round(totalNetoVenta * 0.3), 0);
        } else if (tipoVenta === 'credito') {
          totalVentaActual = Math.max(Math.round(totalNetoVenta * 0.2), 0);
        }
      };

      const actualizarVistaTotales = () => {
        checkoutSubtotal.innerText = formatoPesos(totalBrutoVenta);
        globalDescPerc.innerText = `${globalDescVal.value ? (100 - (totalNetoVenta / totalBrutoVenta * 100)).toFixed(0) : 0}%`;
        checkoutTotalNeto.innerText = formatoPesos(totalNetoVenta);
        totalNetoVenta.innerText = formatoPesos(totalNetoVenta);
      };

      const calcularCambio = () => {
        const recibido = limpiarMoneda(inputMontoRecibido.value);
        checkoutTotalRecibido.innerText = formatoPesos(recibido);

        // Cuando se usa pago múltiple, el monto recibido es la suma de los pagos
        const totalRecibido = pagosMultiples.length ? pagosMultiples.reduce((sum, p) => sum + limpiarMoneda(p.value), 0) : recibido;
        const cambio = totalRecibido - totalVentaActual;

        // Si falta dinero, se pone rojo. Si sobra/es exacto, se pone verde.
        if (cambio < 0 && metodoPago === 'efectivo') {
          cajaCambio.className = "flex justify-between items-center bg-red-50 p-5 rounded-2xl border border-red-200 transition-colors";
          lblCambio.className = "text-red-800 font-black uppercase tracking-wide";
          checkoutCambio.className = "text-4xl font-black text-red-600";
          checkoutCambio.innerText = "Faltan " + formatoPesos(Math.abs(cambio));
          btnConfirmarPago.disabled = true;
        } else {
          cajaCambio.className = "flex justify-between items-center bg-green-50 p-5 rounded-2xl border border-green-200 transition-colors";
          lblCambio.className = "text-green-800 font-black uppercase tracking-wide";
          checkoutCambio.className = "text-4xl font-black text-green-600";
          checkoutCambio.innerText = formatoPesos(cambio >= 0 ? cambio : 0);
          btnConfirmarPago.disabled = false;
        }
      };

      const resetPagosMultiples = () => {
        pagosMultiples = [];
        contMontoMultiple.querySelectorAll('input').forEach(i => (i.value = ''));
      };

      const toggleMetodoPago = (metodo) => {
        metodoPago = metodo;
        seccionMetodoPago.classList.toggle('hidden', metodo === 'multiple');
        seccionPagoMultiple.classList.toggle('hidden', metodo !== 'multiple');

        if (metodo === 'efectivo') {
          inputMontoRecibido.disabled = false;
          inputMontoRecibido.value = totalVentaActual.toLocaleString('es-CO');
        } else {
          inputMontoRecibido.disabled = true;
          inputMontoRecibido.value = totalVentaActual.toLocaleString('es-CO');
        }

        calcularCambio();
      };

      const setTipoVenta = (tipo) => {
        tipoVenta = tipo;
        tipoVentaBtns.forEach(btn => {
          btn.classList.toggle('bg-orange-50', btn.getAttribute('data-tipo') === tipo);
          btn.classList.toggle('text-orange-700', btn.getAttribute('data-tipo') === tipo);
          btn.classList.toggle('border-orange-400', btn.getAttribute('data-tipo') === tipo);
          btn.classList.toggle('bg-white', btn.getAttribute('data-tipo') !== tipo);
          btn.classList.toggle('text-gray-600', btn.getAttribute('data-tipo') !== tipo);
          btn.classList.toggle('border-gray-200', btn.getAttribute('data-tipo') !== tipo);
        });

        calcularTotales();
        actualizarVistaTotales();
        calcularCambio();
      };

      const abrirModalCheckout = () => {
        if (carrito.length === 0) {
          alert('El carrito está vacío. Agrega repuestos primero.');
          return;
        }

        calcularTotales();
        actualizarVistaTotales();

        // Preseleccionar efectivo si no hay método seleccionado
        if (!metodoPago) metodoPago = 'efectivo';
        toggleMetodoPago(metodoPago);

        // Mostrar Modal con animación
        checkoutModal.classList.remove('hidden');
        setTimeout(() => {
          checkoutContainer.classList.remove('scale-95', 'opacity-0');
          checkoutContainer.classList.add('scale-100', 'opacity-100');
        }, 10);
      };

      const cerrarModalCheckout = () => {
        checkoutContainer.classList.remove('scale-100', 'opacity-100');
        checkoutContainer.classList.add('scale-95', 'opacity-0');
        setTimeout(() => checkoutModal.classList.add('hidden'), 300);
      };

      const confirmarPago = () => {
        const cliente = document.getElementById('nombreCliente').value.trim() || 'Cliente Mostrador';

        let mensaje = `Tipo de Venta: ${tipoVenta.toUpperCase()}\n`;
        mensaje += `Método de Pago: ${metodoPago.toUpperCase()}\n`;
        mensaje += `Total NETO: ${formatoPesos(totalNetoVenta)}\n`;
        mensaje += `Total a Pagar: ${formatoPesos(totalVentaActual)}\n`;

        if (metodoPago === 'multiple') {
          mensaje += `Pagos:\n`;
          pagosMultiples.forEach((p, index) => {
            mensaje += `  - ${p.getAttribute('data-method').toUpperCase()}: ${formatoPesos(limpiarMoneda(p.value))}\n`;
          });
        }

        mensaje += `\nCliente: ${cliente}`;

        alert(`¡VENTA EXITOSA!\n\n${mensaje}`);

        // Reiniciar todo
        carrito = [];
        document.getElementById('nombreCliente').value = '';
        resetPagosMultiples();
        renderCarrito();
        cerrarModalCheckout();
      };

      // Eventos
      document.getElementById('btnGenerarPedido').addEventListener('click', abrirModalCheckout);
      document.getElementById('closeCheckout').addEventListener('click', cerrarModalCheckout);

      tipoVentaBtns.forEach(btn => {
        btn.addEventListener('click', () => setTipoVenta(btn.getAttribute('data-tipo')));
      });

      // Botones de Dinero Rápido
      document.querySelectorAll('.quick-cash-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const amount = e.target.getAttribute('data-amount');
          if (amount === 'exacto') {
            inputMontoRecibido.value = totalVentaActual.toLocaleString('es-CO');
          } else {
            const valorActual = limpiarMoneda(inputMontoRecibido.value);
            const suma = valorActual + parseInt(amount);
            inputMontoRecibido.value = suma.toLocaleString('es-CO');
          }
          calcularCambio();
        });
      });

      // Botones de Métodos de Pago
      document.querySelectorAll('.pay-method-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          metodoPago = e.currentTarget.getAttribute('data-method');
          document.querySelectorAll('.pay-method-btn').forEach(b => {
            b.classList.remove('bg-orange-50', 'text-orange-700', 'border-orange-400');
            b.classList.add('bg-white', 'text-gray-600', 'border-gray-200');
          });

          e.currentTarget.classList.remove('bg-white', 'text-gray-600', 'border-gray-200');
          e.currentTarget.classList.add('bg-orange-50', 'text-orange-700', 'border-orange-400');

          toggleMetodoPago(metodoPago);
        });
      });

      // Pago múltiple
      pagoMultipleBtn.addEventListener('click', () => {
        metodoPago = 'multiple';
        toggleMetodoPago('multiple');
      });

      btnEliminarPago.addEventListener('click', () => {
        resetPagosMultiples();
        metodoPago = 'efectivo';
        toggleMetodoPago('efectivo');
      });

      // Cuando el usuario escribe manualmente en el input de monto
      inputMontoRecibido.addEventListener('input', () => calcularCambio());

      // Inputs para los pagos múltiples
      [multiEfectivo, multiNequi, multiTarjeta].forEach(input => {
        input.addEventListener('input', () => {
          pagosMultiples = [multiEfectivo, multiNequi, multiTarjeta].filter(i => i.value.trim() !== '');
          calcularCambio();
        });
      });

      // Ajuste del descuento global
      globalDescVal.addEventListener('input', () => {
        calcularTotales();
        actualizarVistaTotales();
        calcularCambio();
      });

      // Inicializar vista
      calcularTotales();
      actualizarVistaTotales();
      toggleMetodoPago('efectivo');

    </script>`;

fs.writeFileSync(file, prefix + newBlock + suffix, 'utf8');
console.log('Replacement complete. Used marker:', markerUsed);
