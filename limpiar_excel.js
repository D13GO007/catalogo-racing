import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const XLSX = require('xlsx');
const fastcsv = require('fast-csv');

const FILE_EXCEL = 'Productos (5).xlsx';
const FILE_SALIDA = 'tiendana_limpio.csv';

const limpiarExcelTiendana = async () => {
  console.log(`🚀 Abriendo ${FILE_EXCEL}...`);

  try {
    if (!fs.existsSync(FILE_EXCEL)) {
      throw new Error(`No se encontró el archivo: ${FILE_EXCEL}`);
    }

    // 1. Leer el libro de Excel
    const workbook = XLSX.readFile(FILE_EXCEL);
    const sheetName = workbook.SheetNames[0]; // Tomamos la primera hoja (Principal)
    const worksheet = workbook.Sheets[sheetName];

    // 2. Convertir a JSON (comenzando desde una matriz para buscar los encabezados)
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // 3. Buscar la fila donde está el encabezado real
    const headerIndex = rawRows.findIndex(row => row.includes('Nombre') && row.includes('Precio'));
    if (headerIndex === -1) {
      throw new Error("No se encontró la fila de encabezados (Nombre, Precio, etc.)");
    }

    const headers = rawRows[headerIndex];
    const dataRows = rawRows.slice(headerIndex + 1);

    console.log("🧹 Limpiando y normalizando datos...");

    const productosLimpios = dataRows.map(row => {
      // Creamos un objeto mapeando el índice de la columna con su nombre
      const getVal = (colName) => row[headers.indexOf(colName)];

      const nombreOriginal = getVal('Nombre');
      if (!nombreOriginal) return null;

      // NORMALIZACIÓN: Minúsculas, sin espacios extra
      const nombreNormalizado = nombreOriginal
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

      return {
        nombre_normalizado: nombreNormalizado,
        precio_venta: parseFloat(nombreOriginal ? getVal('Precio') : 0),
        precio_costo: parseFloat(getVal('Costo del producto') || 0),
        stock_actual: parseInt(getVal('Cantidad') || 0),
        categoria: getVal('Categoría')?.toString().trim() || 'Sin Categoría',
        activo: getVal('Activo')?.toString().toLowerCase() === 'si',
        visible: getVal('Habilitar venta en línea')?.toString().toLowerCase() === 'si'
      };
    }).filter(p => p !== null);

    // 4. Exportar a un CSV limpio
    const ws = fs.createWriteStream(FILE_SALIDA);
    fastcsv
      .write(productosLimpios, { headers: true })
      .pipe(ws)
      .on('finish', () => {
        console.log(`✅ ¡Proceso terminado!`);
        console.log(`📝 Archivo generado: ${FILE_SALIDA}`);
        console.log(`📊 Total de productos: ${productosLimpios.length}`);
      });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
};

limpiarExcelTiendana();