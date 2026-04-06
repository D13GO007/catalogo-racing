import fs from 'fs';
import csv from 'csv-parser';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastcsv = require('fast-csv');

const ENTRADA = 'tiendana_limpio.csv';
const SALIDA = 'familias_importar.csv';

const extraerFamilias = async () => {
  console.log("📂 Extrayendo nombres de familias únicas...");

  const familiasUnicas = new Set();

  if (!fs.existsSync(ENTRADA)) {
    console.error(`❌ No se encuentra ${ENTRADA}`);
    return;
  }

  fs.createReadStream(ENTRADA)
    .pipe(csv())
    .on('data', (row) => {
      if (row.categoria) {
        // Guardamos en Mayúsculas para mantener consistencia
        familiasUnicas.add(row.categoria.trim().toUpperCase());
      }
    })
    .on('end', () => {
      // Convertimos el Set a un array de objetos para el CSV
      const datosFinales = Array.from(familiasUnicas)
        .sort() // Los ordenamos alfabéticamente
        .map(nombre => ({ nombre: nombre }));

      const ws = fs.createWriteStream(SALIDA);
      fastcsv
        .write(datosFinales, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          console.log(`✅ ¡Archivo de familias listo!`);
          console.log(`📝 Se generó: ${SALIDA}`);
          console.log(`📊 Total de familias únicas: ${datosFinales.length}`);
        });
    });
};

extraerFamilias();