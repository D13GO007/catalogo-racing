import fs from 'fs';
import csv from 'csv-parser';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastcsv = require('fast-csv');

const ARCHIVO_ENTRADA = 'tiendana_limpio.csv';
const ARCHIVO_SALIDA = 'maestro_final.csv';

const transformarDatos = async () => {
  console.log("🛠️ Iniciando transformación de datos local...");

  const resultados = [];

  if (!fs.existsSync(ARCHIVO_ENTRADA)) {
    console.error(`❌ No se encuentra el archivo ${ARCHIVO_ENTRADA}`);
    return;
  }

  fs.createReadStream(ARCHIVO_ENTRADA)
    .pipe(csv())
    .on('data', (row) => {
      const nombreCompleto = row.nombre_normalizado.trim().toLowerCase();
      const categoria = row.categoria.trim().toUpperCase();

      // 1. DIVISIÓN DE FAMILIA Y REFERENCIA
      // Quitamos la categoría del nombre para que la referencia sea limpia
      let referencia = nombreCompleto.replace(categoria.toLowerCase(), '').trim();
      
      // Si el nombre era igual a la categoría, le asignamos "estándar"
      if (!referencia) referencia = 'estándar';

      // 2. CONSTRUCCIÓN DE RUTA DE IMAGEN
      // Usamos el nombre normalizado (reemplazando espacios por guiones) 
      // para que coincida con tus archivos en la carpeta productos.
      const nombreParaImagen = nombreCompleto.replace(/\s+/g, '-');
      const rutaImagen = `/productos/${nombreParaImagen}.jpg`; 

      resultados.push({
        familia: categoria,
        referencia: referencia,
        precio_venta: row.precio_venta,
        precio_costo: row.precio_costo,
        stock_actual: row.stock_actual,
        imagen_ruta: rutaImagen,
        activo: row.activo,
        visible: row.visible
      });
    })
    .on('end', () => {
      // 3. GUARDAR EL NUEVO CSV
      const ws = fs.createWriteStream(ARCHIVO_SALIDA);
      fastcsv
        .write(resultados, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          console.log(`✅ ¡Proceso terminado!`);
          console.log(`📝 Se ha generado el archivo: ${ARCHIVO_SALIDA}`);
          console.log(`📊 Total de registros procesados: ${resultados.length}`);
          console.log(`💡 Ejemplo de ruta generada: ${resultados[0]?.imagen_ruta || 'N/A'}`);
        });
    });
};

transformarDatos();