import fs from 'fs';
import csv from 'csv-parser';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastcsv = require('fast-csv');

const ENTRADA = 'tiendana_limpio.csv';
const SALIDA = 'importar_referencias.csv';

const prepararParaSupabase = async () => {
  console.log("⚙️  Generando CSV compatible con la tabla 'referencias'...");

  const registros = [];

  if (!fs.existsSync(ENTRADA)) {
    console.error(`❌ No se encuentra el archivo ${ENTRADA}. Ejecuta primero el paso de limpieza.`);
    return;
  }

  fs.createReadStream(ENTRADA)
    .pipe(csv())
    .on('data', (row) => {
      const nombre = row.nombre_normalizado.trim();
      const familia = row.categoria.trim();

      // 1. EXTRAER MODELO
      // Quitamos la familia del nombre para que quede solo la referencia específica
      let modelo = nombre.toLowerCase().replace(familia.toLowerCase(), '').trim();
      if (!modelo) modelo = 'estándar';

      // 2. RUTA DE IMAGEN NORMALIZADA
      // Convertimos espacios en guiones para que coincida con tus archivos físicos
      const slugImagen = nombre.toLowerCase().replace(/\s+/g, '-');
      const rutaImagen = `/productos/${slugImagen}.jpg`;

      // 3. MAPEO A COLUMNAS DE SUPABASE
      registros.push({
        // Dejamos familia_nombre para que puedas identificarla, 
        // Supabase pedirá familia_id (número) si lo haces por Import Wizard
        familia_nombre: familia.toUpperCase(), 
        modelo: modelo,
        precio_venta: parseInt(row.precio_venta) || 0,
        precio_costo: parseInt(row.precio_costo) || 0,
        stock_actual: parseInt(row.stock_actual) || 0,
        stock_minimo: 2, // Valor preventivo estándar
        imagen_especifica: rutaImagen,
        visible_en_catalogo: row.visible === 'true',
        activo: row.activo === 'true'
      });
    })
    .on('end', () => {
      const ws = fs.createWriteStream(SALIDA);
      fastcsv
        .write(registros, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          console.log(`✅ ¡Archivo generado con éxito!`);
          console.log(`📝 Nombre del archivo: ${SALIDA}`);
          console.log(`📌 Estructura lista para las columnas de la captura.`);
        });
    });
};

prepararParaSupabase();