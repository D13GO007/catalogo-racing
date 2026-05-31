import type { VentaSnapshot } from './types';
import { formatoPesos } from './utils';

interface GenerarFacturaPDFOpciones {
  abonoReciente?: number;
  historialAbonos?: Array<{
    monto: number;
    fecha: string;
    metodoPago?: string | null;
  }>;
}

type HistorialAbonoPDF = {
  monto: number;
  fecha: string;
  metodoPago?: string | null;
};

// ── Logo ──────────────────────────────────────────────────────────────────────

export function loadLogoDataUrl(): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `${window.location.origin}/logo.png`;
  });
}

// ── Descarga de PDF desde vista HTML (idéntica a impresión) ─────────────────

export async function descargarFacturaDesdeVistaHTML(
  venta: VentaSnapshot,
  sourceElement: HTMLElement
): Promise<void> {
  const jsPDFCtor = (window as any).jspdf?.jsPDF;
  if (!jsPDFCtor) throw new Error('No se pudo cargar jsPDF');

  const pdf = new jsPDFCtor({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  if (typeof (pdf as any).html !== 'function') {
    throw new Error('El entorno actual no soporta la conversión HTML a PDF.');
  }

  const safeCliente = (venta.cliente || 'Cliente_Mostrador').replace(/[^a-zA-Z0-9]/g, '_');
  const cloned = sourceElement.cloneNode(true) as HTMLElement;
  cloned.style.background = '#ffffff';
  cloned.style.maxWidth = 'none';
  if (sourceElement.offsetWidth > 0) {
    cloned.style.width = `${sourceElement.offsetWidth}px`;
  }

  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-10000px';
  sandbox.style.top = '0';
  sandbox.style.width = '1200px';
  sandbox.style.zIndex = '-1';
  sandbox.appendChild(cloned);
  document.body.appendChild(sandbox);

  try {
    await new Promise<void>((resolve, reject) => {
      (pdf as any).html(cloned, {
        margin: [0, 0, 0, 0],
        autoPaging: 'text',
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
        callback: (doc: any) => {
          try {
            doc.save(`Caja_Ventas_Premium_Racing_${safeCliente}.pdf`);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
      });
    });
  } finally {
    sandbox.remove();
  }
}

// ── Recibo de Abono ───────────────────────────────────────────────────────────

export async function generarReciboAbonoPDF(
  params: {
    cliente: string;
    telefono?: string;
    direccion?: string;
    fechaAbono: string;
    numeroComprobante: string;
    montoAbono: number;
    metodoPago?: string;
    totalVenta: number;
    totalAbonado: number;
    saldoPendiente: number;
    historialAbonos?: Array<{ monto: number; fecha: string; metodoPago?: string | null }>;
  },
  accion: 'descargar' | 'imprimir' = 'descargar'
): Promise<void> {
  const jsPDFCtor = (window as any).jspdf?.jsPDF;
  if (!jsPDFCtor) throw new Error('No se pudo cargar jsPDF');

  const pdf       = new jsPDFCtor({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin    = 14;
  const contentW  = pageWidth - margin * 2;

  const safeCliente = (params.cliente || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const fechaFormateada = (() => {
    try {
      const d = new Date(params.fechaAbono);
      return d.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return params.fechaAbono; }
  })();

  const logoDataUrl = await loadLogoDataUrl();
  let y = 10;

  // ── Header ─────────────────────────────────────────────────────────────────
  const logoSize = 16;
  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, 'PNG', margin, y, logoSize, logoSize);
  } else {
    pdf.setFillColor(15, 15, 15);
    pdf.rect(margin, y, logoSize, logoSize, 'F');
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(20, 30, 50);
  pdf.text('PREMIUM RACING', margin + logoSize + 4, y + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.8);
  pdf.setTextColor(85, 90, 105);
  pdf.text('Venta de Repuestos y Accesorios', margin + logoSize + 4, y + 10.5);
  pdf.text('Cali, Colombia  |  +57 3132240559  |  +57 3104740802', margin + logoSize + 4, y + 14.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(220, 80, 20);
  pdf.text('RECIBO DE ABONO', pageWidth - margin, y + 6, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(110, 115, 130);
  pdf.text(`N° ${params.numeroComprobante}`, pageWidth - margin, y + 11.5, { align: 'right' });
  pdf.text(fechaFormateada, pageWidth - margin, y + 15.5, { align: 'right' });

  y += logoSize + 6;

  pdf.setDrawColor(220, 80, 20);
  pdf.setLineWidth(0.6);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Caja cliente ───────────────────────────────────────────────────────────
  const tieneDirAbono = !!(params.direccion && params.direccion.trim());

  pdf.setDrawColor(220, 225, 232);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentW, 16, 2, 2, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(110, 120, 140);
  pdf.text('CLIENTE', margin + 4, y + 5.5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(20, 30, 50);
  const nombreAbonoTexto = (params.cliente || 'Cliente Mostrador').toUpperCase();
  pdf.text(nombreAbonoTexto, margin + 4, y + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  const nombreAbonoAncho = pdf.getTextWidth(nombreAbonoTexto);

  if (tieneDirAbono) {
    pdf.setFontSize(8.5);
    pdf.setTextColor(20, 30, 50);
    pdf.text(`DIR: ${params.direccion!.toUpperCase()}`, margin + 4 + nombreAbonoAncho + 7, y + 12);
  }

  if (params.telefono && params.telefono !== 'N/A' && params.telefono.trim()) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(20, 30, 50);
    pdf.text(`TEL: ${params.telefono}`, pageWidth - margin - 4, y + 12, { align: 'right' });
  }

  y += 22;

  // ── Caja principal del abono (naranja resaltado) ───────────────────────────
  const abonoBoxH = 32;
  pdf.setFillColor(255, 107, 53);
  pdf.roundedRect(margin, y, contentW, abonoBoxH, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 230, 210);
  pdf.text('ABONO RECIBIDO', margin + contentW / 2, y + 8, { align: 'center' });

  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text(formatoPesos(params.montoAbono), margin + contentW / 2, y + 22, { align: 'center' });

  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 225, 200);
  const metodo = (params.metodoPago || 'EFECTIVO').toUpperCase();
  pdf.text(`Método de pago: ${metodo}`, margin + contentW / 2, y + 29, { align: 'center' });

  y += abonoBoxH + 8;

  // ── Resumen de saldo ───────────────────────────────────────────────────────
  pdf.setDrawColor(225, 228, 234);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentW, 30, 2, 2, 'S');

  const labelX = margin + 6;
  const valX   = pageWidth - margin - 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 110, 125);
  pdf.text('Total de la venta:', labelX, y + 8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 50, 65);
  pdf.text(formatoPesos(params.totalVenta), valX, y + 8, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30, 130, 60);
  pdf.text('Total abonado hasta hoy:', labelX, y + 17);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 130, 60);
  pdf.text(formatoPesos(params.totalAbonado), valX, y + 17, { align: 'right' });

  pdf.setDrawColor(220, 224, 232);
  pdf.setLineWidth(0.25);
  pdf.line(labelX, y + 21, valX, y + 21);

  const saldado = params.saldoPendiente <= 0;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(saldado ? 30 : 210, saldado ? 130 : 30, saldado ? 30 : 30);
  pdf.text(saldado ? '¡DEUDA COMPLETAMENTE SALDADA!' : 'Saldo pendiente:', labelX, y + 27);
  if (!saldado) {
    pdf.text(formatoPesos(params.saldoPendiente), valX, y + 27, { align: 'right' });
  }

  y += 38;

  // ── Historial de abonos (si hay más de uno) ────────────────────────────────
  const historial = (params.historialAbonos || []).filter(h => h.monto > 0);
  if (historial.length > 1) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(90, 100, 115);
    pdf.text('HISTORIAL DE ABONOS', margin, y + 3);
    y += 6;

    (pdf as any).autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Fecha', 'Monto', 'Método']],
      body: historial.map((h, i) => {
        const fh = (() => {
          try { return new Date(h.fecha).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }); } catch { return h.fecha || ''; }
        })();
        return [String(i + 1), fh, formatoPesos(h.monto), (h.metodoPago || 'N/A').toUpperCase()];
      }),
      theme: 'plain',
      styles: {
        fontSize: 7.5, textColor: [34, 45, 61],
        cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 },
        lineWidth: 0,
      },
      headStyles: { fontStyle: 'bold', textColor: [100, 115, 130], fillColor: [245, 246, 248] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 45, halign: 'left' },
        2: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 35, halign: 'center' },
      },
    });

    y = (pdf as any).lastAutoTable?.finalY + 10;
  } else {
    y += 4;
  }

  // ── Líneas de firma ────────────────────────────────────────────────────────
  const sigW = (contentW - 16) / 2;

  pdf.setDrawColor(160, 170, 185);
  pdf.setLineWidth(0.4);
  pdf.line(margin, y, margin + sigW, y);
  pdf.line(margin + sigW + 16, y, margin + contentW, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(130, 140, 155);
  pdf.text('Firma del Cliente', margin + sigW / 2, y + 4.5, { align: 'center' });
  pdf.text('Firma del Vendedor', margin + sigW + 16 + sigW / 2, y + 4.5, { align: 'center' });

  y += 14;

  // ── Footer ─────────────────────────────────────────────────────────────────
  pdf.setDrawColor(220, 80, 20);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(60, 70, 85);
  pdf.text('¡Gracias por su abono en Premium Racing!', pageWidth / 2, y + 5.5, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(155, 160, 170);
  pdf.text('Este documento sirve como comprobante de pago parcial.', pageWidth / 2, y + 9.5, { align: 'center' });

  // ── Guardar / imprimir ─────────────────────────────────────────────────────
  if (accion === 'descargar') {
    pdf.save(`Recibo_Abono_${safeCliente}.pdf`);
    return Promise.resolve();
  } else {
    return new Promise(resolve => {
      pdf.autoPrint();
      const blob  = pdf.output('blob');
      const url   = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => { iframe.contentWindow?.print(); resolve(); }, 150);
      };
    });
  }
}

// ── Generación de PDF ─────────────────────────────────────────────────────────

export async function generarFacturaPDF(
  venta: VentaSnapshot,
  accion: 'descargar' | 'imprimir' = 'descargar',
  opcionesOHistorial: GenerarFacturaPDFOpciones | HistorialAbonoPDF[] = {}
): Promise<void> {
  const jsPDFCtor = (window as any).jspdf?.jsPDF;
  if (!jsPDFCtor) throw new Error('No se pudo cargar jsPDF');

  const pdf        = new jsPDFCtor({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin     = 10;

  const safeCliente       = (venta.cliente || 'Cliente_Mostrador').replace(/[^a-zA-Z0-9]/g, '_');
  const numeroComprobante = venta.numeroComprobante || String(Date.now()).slice(-5);
  const subtotal          = Number(venta.subtotal       || 0);
  const descuentoGlobal   = Number(venta.descuentoGlobal || 0);
  const totalNeto         = Number(venta.totalNeto      || 0);
  const recibido          = Number(venta.recibido       || 0);

  const opciones: GenerarFacturaPDFOpciones = Array.isArray(opcionesOHistorial)
    ? { historialAbonos: opcionesOHistorial }
    : opcionesOHistorial;

  const abonoReciente     = Math.max(0, Number(opciones.abonoReciente || 0));
  const historialAbonos   = (opciones.historialAbonos || [])
    .map(abonoItem => {
      const montoNumerico = Number(abonoItem.monto);
      return {
      monto: Number.isFinite(montoNumerico) && montoNumerico > 0 ? montoNumerico : 0,
      fecha: abonoItem.fecha || '',
      metodoPago: abonoItem.metodoPago || null,
      };
    })
    .filter(abonoItem => abonoItem.monto > 0);
  const logoDataUrl = await loadLogoDataUrl();

  // ── Header ────────────────────────────────────────────────────────────────
  const headTop = 7;
  const logoX   = margin;
  const logoY   = headTop + 1.5;
  const logoW   = 18;
  const logoH   = 18;

  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH);
  } else {
    pdf.setFillColor(15, 15, 15);
    pdf.rect(logoX, logoY, logoW, logoH, 'F');
  }

  pdf.setTextColor(20, 30, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('PREMIUM RACING', margin + 22, headTop + 7);

  pdf.setFontSize(9.2);
  pdf.setTextColor(60, 70, 85);
  pdf.text('Venta de Repuestos y Accesorios', margin + 22, headTop + 11.5);

  pdf.setFontSize(8.1);
  pdf.setTextColor(65, 65, 65);
  pdf.text('Cali, Valle del Cauca - Colombia',               margin + 22, headTop + 17.5);
  pdf.text('Tel: +57 3132240559  |  +57 3104740802',         margin + 22, headTop + 21.5);

  const esCotizacion = venta.tipoVenta === 'cotizacion';
  const tituloDocumento = esCotizacion
    ? 'COTIZACION'
    : abonoReciente > 0
    ? 'RECIBO DE ABONO'
    : 'FACTURA';
  const numeroBase = String(numeroComprobante).replace(/^COT-?/i, '');
  const numeroTitulo = esCotizacion ? `COT-${numeroBase}` : `N° ${numeroBase}`;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12.5);
  pdf.setTextColor(130, 130, 130);
  pdf.text(tituloDocumento, pageWidth - margin, headTop + 7, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(220, 20, 20);
  pdf.text(numeroTitulo, pageWidth - margin, headTop + 12.5, { align: 'right' });

  pdf.setFontSize(8.4);
  pdf.setTextColor(55, 55, 55);
  pdf.text(`Fecha: ${venta.fecha || 'N/A'}`,                               pageWidth - margin, headTop + 18, { align: 'right' });
  let textoEstado = 'PAGADO';
  if (venta.tipoVenta === 'cotizacion') textoEstado = 'COTIZACION';
  if (venta.tipoVenta === 'pendiente') textoEstado = 'PENDIENTE';
  if (venta.tipoVenta === 'credito') textoEstado = 'CREDITO';
  if (venta.tipoVenta === 'abono') textoEstado = 'ABONO PARCIAL';

  pdf.text(`Estado: ${textoEstado}`, pageWidth - margin, headTop + 22, { align: 'right' });

  pdf.setDrawColor(45, 55, 72);
  pdf.setLineWidth(0.5);
  pdf.line(margin, headTop + 26, pageWidth - margin, headTop + 26);

  // ── Caja cliente ──────────────────────────────────────────────────────────
  const infoY = headTop + 30;
  const tieneDireccion = !!(venta.direccion && venta.direccion.trim());

  pdf.setDrawColor(225, 228, 234);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, infoY, pageWidth - margin * 2, 18, 2, 2, 'S');

  pdf.setTextColor(70, 70, 80);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.2);
  pdf.text('FACTURAR A :', margin + 4, infoY + 5.5);

  pdf.setTextColor(34, 44, 60);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  const nombreTexto = (venta.cliente || 'Cliente Mostrador').toUpperCase();
  pdf.text(nombreTexto, margin + 4, infoY + 11);
  pdf.setFontSize(9.2);
  pdf.text(`TEL: ${(venta.telefono || 'N/A').toUpperCase()}`, margin + 4, infoY + 15.5);

  if (tieneDireccion) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    const nombreAncho = pdf.getTextWidth(nombreTexto);
    pdf.setFontSize(9.2);
    pdf.setTextColor(34, 44, 60);
    pdf.text(`DIR: ${venta.direccion!.toUpperCase()}`, margin + 4 + nombreAncho + 7, infoY + 11);
  }

  // ── Tabla de items ────────────────────────────────────────────────────────
  const breakLongTokens = (text: string, chunkSize = 10): string => {
    return text
      .split(' ')
      .map(token => {
        if (token.length <= chunkSize + 2) return token;
        return token.match(new RegExp(`.{1,${chunkSize}}`, 'g'))?.join(' ') || token;
      })
      .join(' ');
  };

  const bodyRows = (venta.items || []).map((item: any) => {
    const cantidad          = Number(item.cantidad  || 0);
    const precio            = Number(item.precio    || 0);
    const descuentoItemTotal = Number(item.descuentoTotal || 0);
    const precioFinalItem   = cantidad > 0 ? precio - descuentoItemTotal / cantidad : precio;
    const totalLinea        = precioFinalItem * cantidad;
    
    // Generación del Código Inteligente
    const familiaStr = (item.familia || '').toString().toUpperCase();
    const modeloStr  = (item.modelo || '').toString().toUpperCase();
    
    const prefijoFam = familiaStr.substring(0, 3).replace(/[^A-Z]/g, '').padEnd(3, 'X');
    const prefijoMod = modeloStr.substring(0, 4).replace(/[^A-Z0-9]/g, '').padEnd(4, '0');
    const idInteligente = `${prefijoFam}-${prefijoMod}`;

    const referenciaRaw     = modeloStr.replace(/([\/-])/g, '$1 ').replace(/\s+/g, ' ').trim();
    const familia           = breakLongTokens(familiaStr, 12);
    const referencia        = breakLongTokens(referenciaRaw, 10);
    const descripcion       = `${familia}\nREF: ${referencia}`; // Ya no lleva el ID aquí

    return [
      idInteligente,
      String(cantidad),
      descripcion,
      formatoPesos(precio),
      descuentoItemTotal > 0 ? `-${formatoPesos(descuentoItemTotal)}` : '$0',
      formatoPesos(totalLinea),
    ];
  });

  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const firstArg = args[0];
    if (
      typeof firstArg === 'string' &&
      firstArg.includes('Of the table content') &&
      firstArg.includes('could not fit page')
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };

  try {
    (pdf as any).autoTable({
      startY: infoY + 22,
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
      // AQUÍ AGREGAMOS "ID" COMO PRIMERA COLUMNA
      head: [['ID', 'CANT.', 'DESCRIPCIÓN / REFERENCIA', 'V. UNITARIO', 'DESC.', 'TOTAL']],
      body: bodyRows,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        minCellWidth: 0,
        overflow: 'linebreak',
        cellPadding: { top: 1.4, right: 0.7, bottom: 1.4, left: 0.7 },
        textColor: [34, 45, 61],
        valign: 'middle',
        lineColor: [221, 225, 230],
        lineWidth: 0,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        fontSize: 8,
        textColor: [105, 115, 128],
        fontStyle: 'bold',
        lineWidth: 0,
      },
      bodyStyles: { lineColor: [220, 224, 230], lineWidth: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      // REAJUSTAMOS LOS ANCHOS PARA QUE QUEPAN 6 COLUMNAS
      columnStyles: {
        0: { cellWidth: 18, minCellWidth: 0, halign: 'center', fontStyle: 'bold', textColor: [220, 90, 30] }, // ID
        1: { cellWidth: 12, minCellWidth: 0, halign: 'center' }, // Cant
        2: { cellWidth: 72, minCellWidth: 0, halign: 'left', overflow: 'linebreak' }, // Desc
        3: { cellWidth: 24, minCellWidth: 0, halign: 'right' }, // VU
        4: { cellWidth: 20, minCellWidth: 0, halign: 'right', textColor: [245, 70, 70] }, // Desc.
        5: { cellWidth: 22, minCellWidth: 0, halign: 'right', fontStyle: 'bold' }, // Total
      },
      didParseCell: (data: any) => {
        if (data.section === 'head') {
          if (data.column.index === 0) data.cell.styles.halign = 'center'; // ID
          if (data.column.index === 1) data.cell.styles.halign = 'center'; // Cant
          if (data.column.index === 2) data.cell.styles.halign = 'left';   // Desc
          if (data.column.index >= 3) data.cell.styles.halign = 'right';   // Totales
        }
      },
    });
  } finally {
    console.warn = originalConsoleWarn;
  }

  // Separadores entre filas
  const renderedTable    = (pdf as any).lastAutoTable;
  const bodyRowsRendered = renderedTable?.table?.body || [];
  pdf.setDrawColor(220, 224, 230);
  pdf.setLineWidth(0.28);
  bodyRowsRendered.forEach((row: any) => {
    pdf.line(margin, row.y + row.height, pageWidth - margin, row.y + row.height);
  });

  // ── Bloque de totales ─────────────────────────────────────────────────────
  const tableFinalY = (pdf as any).lastAutoTable?.finalY || infoY + 42;
  let summaryY = tableFinalY + 8;
  if (summaryY + 55 > pageHeight - margin) {
    pdf.addPage();
    summaryY = margin;
  }

  const boxW = 98;
  const boxH = 44;
  const boxX = pageWidth - margin - boxW;
  pdf.setDrawColor(225, 228, 234);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(boxX, summaryY, boxW, boxH, 2, 2, 'S');

  const valX = boxX + boxW - 4;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(70, 70, 80);
  pdf.text('Subtotal:',               boxX + 4, summaryY + 8);
  pdf.text(formatoPesos(subtotal),    valX,      summaryY + 8, { align: 'right' });

  pdf.setTextColor(245, 70, 70);
  pdf.text('Desc. Global:',           boxX + 4, summaryY + 15);
  pdf.text(`-${formatoPesos(descuentoGlobal)}`,  valX,      summaryY + 15, { align: 'right' });

  pdf.setDrawColor(45, 55, 72);
  pdf.setLineWidth(0.45);
  pdf.line(boxX + 4, summaryY + 18, valX, summaryY + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(25, 35, 52);
  pdf.text('TOTAL A PAGAR:',        boxX + 4, summaryY + 25);
  pdf.text(formatoPesos(totalNeto), valX,      summaryY + 25, { align: 'right' });

  pdf.setDrawColor(230, 233, 238);
  pdf.setLineWidth(0.3);
  pdf.line(boxX + 4, summaryY + 29, valX, summaryY + 29);

  pdf.setFontSize(11);
  pdf.setTextColor(75, 75, 85);
  pdf.text('Método de Pago:', boxX + 4, summaryY + 35);
  pdf.text(String(venta.metodoPago || 'N/A').toUpperCase(), valX, summaryY + 35, { align: 'right' });

  pdf.setFontSize(11);
  pdf.setTextColor(75, 75, 85);
  pdf.text('Total Recibido:', boxX + 4, summaryY + 41);
  pdf.text(formatoPesos(recibido), valX, summaryY + 41, { align: 'right' });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = pageHeight - 26;

  pdf.setDrawColor(225, 228, 234);
  pdf.setLineWidth(0.4);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setTextColor(60, 70, 85);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.1);
  pdf.text('¡GRACIAS POR SU COMPRA EN PREMIUM RACING!', pageWidth / 2, footerY + 5.5, { align: 'center' });

  pdf.setFontSize(8.7);
  pdf.text('Esta es una factura de venta que sirve como comprobante de pago.', pageWidth / 2, footerY + 9.5, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(6.5);
  pdf.text('Generado por POS System', pageWidth / 2, footerY + 13.5, { align: 'center' });

  if (accion === 'descargar') {
    const prefijoArchivo = abonoReciente > 0 ? 'Recibo_Abono' : 'Caja_Ventas_Premium_Racing';
    pdf.save(`${prefijoArchivo}_${safeCliente}.pdf`);
    return Promise.resolve();
  } else if (accion === 'imprimir') {
    return new Promise(resolve => {
      pdf.autoPrint();

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          resolve();
        }, 150);
      };
    });
  }
}
