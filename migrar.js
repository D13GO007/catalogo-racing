import fs from 'fs';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://ohpkirlmsxfdvirrjmby.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocGtpcmxtc3hmZHZpcnJqbWJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMzU1OCwiZXhwIjoyMDg5MTg5NTU4fQ.n73imfWAzWg15Puh-XJ5V3ed850JrBX7IBn8mN6PjZo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const migrarTodo = async () => {
  try {
    console.log("🚀 Iniciando migración con nombres normalizados...");

    // 1. CARGAR DATOS DE TIENDANA (CSV) EN MEMORIA
    const dataTiendana = new Map();
    const fileTiendana = 'tiendana.csv'; // Asegúrate de que el CSV de Tiendana se llame así

    if (fs.existsSync(fileTiendana)) {
      console.log("📂 Leyendo stock y costos desde Tiendana...");
      const content = fs.readFileSync(fileTiendana, 'utf-8');
      const lines = content.split(/\r?\n/);
      const headerIndex = lines.findIndex(l => l.includes('Id;Nombre;Precio;Cantidad'));
      const cleanStream = Readable.from([lines.slice(headerIndex).join('\n')]);

      await new Promise((resolve) => {
        cleanStream.pipe(csv({ separator: ';' })).on('data', (row) => {
          if (!row.Nombre) return;
          // Normalizamos el nombre de Tiendana: minúsculas y sin espacios extra
          const nombreNormalizado = row.Nombre.trim().toLowerCase().replace(/\s+/g, ' ');
          dataTiendana.set(nombreNormalizado, {
            costo: parseFloat(row['Costo del producto']?.replace('$', '').replace(/\./g, '').replace(',', '.') || 0),
            stock: parseInt(row.Cantidad?.split(',')[0] || 0),
            activo: row.Activo?.trim().toLowerCase() === 'si',
            visible: row['Habilitar venta en línea']?.trim().toLowerCase() === 'si'
          });
        }).on('end', resolve);
      });
    }

    // 2. PROCESAR EXCEL (CATÁLOGO NORMALIZADO)
    const fileExcel = 'Catalogo (5).xlsx';
    if (!fs.existsSync(fileExcel)) throw new Error("No se encontró el archivo Catalogo (5).xlsx");

    console.log("📂 Procesando Excel y vinculando datos...");
    const workbook = XLSX.readFile(fileExcel);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const familiasSet = new Set();
    const listaFinal = [];
    let vinculados = 0;

    rows.forEach((row, index) => {
      // Saltamos la primera fila si son encabezados
      if (index === 0 || !row[0] || !row[1]) return;

      const familia = row[0].toString().trim();
      const modelo = row[1].toString().trim();
      const precioVenta = parseFloat(row[2] || 0);
      const rutaImagen = row[3] ? row[3].toString().trim() : null;

      // LLAVE DE UNIÓN: "familia modelo" (igual a como lo tienes en el Excel)
      const llaveExcel = `${familia} ${modelo}`.toLowerCase().replace(/\s+/g, ' ');

      // BUSQUEDA DE STOCK/COSTO:
      // Primero intentamos match exacto, si no, buscamos si el nombre de Tiendana contiene la llave
      let fin = dataTiendana.get(llaveExcel);
      
      if (!fin) {
        for (let [nombreT, datos] of dataTiendana) {
          if (nombreT.includes(llaveExcel) || llaveExcel.includes(nombreT)) {
            fin = datos;
            break;
          }
        }
      }

      if (fin) vinculados++;

      // LIMPIEZA DE IMAGEN: Quitamos /public del inicio
      const imagenLimpia = rutaImagen ? rutaImagen.replace(/^\/?public/, '') : null;

      familiasSet.add(familia);
      listaFinal.push({
        familia_nombre: familia,
        modelo: modelo,
        precio_venta: precioVenta,
        precio_costo: fin ? fin.costo : 0,
        stock_actual: fin ? fin.stock : 0,
        imagen_especifica: imagenLimpia,
        activo: fin ? fin.activo : true,
        visible: fin ? fin.visible : true
      });
    });

    console.log(`📊 Reporte: ${vinculados} productos vinculados con éxito de ${listaFinal.length} totales.`);

    // 3. SUBIR A SUPABASE
    console.log("📦 Sincronizando con Supabase...");

    // A. Familias
    const { data: famsDB, error: errF } = await supabase
      .from('familias')
      .upsert(Array.from(familiasSet).map(n => ({ nombre: n })), { onConflict: 'nombre' })
      .select();

    if (errF) throw errF;
    const famMap = Object.fromEntries(famsDB.map(f => [f.nombre, f.id]));

    // B. Referencias
    const { error: errR } = await supabase.from('referencias').insert(
      listaFinal.map(p => ({
        familia_id: famMap[p.familia_nombre],
        modelo: p.modelo,
        precio_venta: p.precio_venta,
        precio_costo: p.precio_costo,
        stock_actual: p.stock_actual,
        imagen_especifica: p.imagen_especifica,
        stock_minimo: 2,
        activo: p.activo,
        visible_en_catalogo: p.visible
      }))
    );

    if (errR) throw errR;
    console.log("🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!");

  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
};

migrarTodo();