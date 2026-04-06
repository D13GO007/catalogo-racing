import fs from 'fs';

console.log("Iniciando limpieza de la base de datos de Premium Racing...");

// 1. Leer el archivo CSV original
const data = fs.readFileSync('Productos(Principal).csv', 'utf8');
const lineas = data.split('\n');

let productosUnicos = new Map();
let procesando = false;
let duplicadosEncontrados = 0;

lineas.forEach((linea) => {
  const limpia = linea.trim();
  if (!limpia) return;

  // 2. Saltar toda la basura del inicio hasta encontrar los verdaderos títulos
  if (limpia.includes(';;Id;Nombre;Precio')) {
    procesando = true;
    return;
  }

  if (!procesando) return;

  const columnas = limpia.split(';');
  
  // Validar que la fila tenga datos reales (El ID está en la columna 2)
  if (columnas.length < 13 || !columnas[2]) return;

  // 3. Extraer y limpiar los datos (quitar espacios extra y estandarizar a mayúsculas)
  const nombre = columnas[3].trim().toUpperCase();
  const categoria = columnas[10].trim().toUpperCase();
  
  // Limpiar Precio: "$95.000,00" -> 95000
  const precioBruto = columnas[4];
  const precio = parseInt(precioBruto.replace(/\$|\./g, '').split(',')[0]) || 0;

  // Limpiar Costo: "$61.972,00" -> 61972
  const costoBruto = columnas[12];
  const costo = parseInt(costoBruto.replace(/\$|\./g, '').split(',')[0]) || 0;

  // Limpiar Stock: "172,00" -> 172
  const cantidadBruta = columnas[5];
  const cantidad = parseInt(cantidadBruta.split(',')[0]) || 0;

  // 4. Lógica de unificación (Resolver duplicados)
  if (productosUnicos.has(nombre)) {
    // Si ya existe, SUMAMOS EL STOCK para no perder inventario
    const existente = productosUnicos.get(nombre);
    existente.stock_actual += cantidad;
    // Si el nuevo registro tiene un precio mayor, lo actualizamos por seguridad
    if (precio > existente.precio_venta) existente.precio_venta = precio;
    
    productosUnicos.set(nombre, existente);
    duplicadosEncontrados++;
  } else {
    // Si es nuevo, lo agregamos limpio
    productosUnicos.set(nombre, {
      nombre: nombre,
      familia: categoria,
      costo: costo,
      precio_venta: precio,
      stock_actual: cantidad,
      imagen_especifica: `/productos/${nombre.toLowerCase().replace(/ /g, '-').replace(/[áéíóú]/g, 'a')}.jpg` // Ruta estandarizada
    });
  }
});

// 5. Generar el archivo final perfecto
const resultadoFinal = Array.from(productosUnicos.values());
fs.writeFileSync('inventario_perfecto.json', JSON.stringify(resultadoFinal, null, 2));

console.log("==========================================");
console.log(`✅ Limpieza completada con éxito.`);
console.log(`📦 Productos únicos finales: ${resultadoFinal.length}`);
console.log(`⚠️ Duplicados fusionados (Stock sumado): ${duplicadosEncontrados}`);
console.log("Archivo 'inventario_perfecto.json' creado. Listo para subir a Supabase.");
console.log("==========================================");