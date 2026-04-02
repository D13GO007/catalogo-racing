export interface CartItem {
  id: string;
  modelo: string;
  familia: string;
  precio: number;
  cantidad: number;
  stockMaximo: number;
  descuentoTotal: number;
}

export interface VentaSnapshot {
  cliente: string;
  telefono: string;
  fecha: string;
  numeroComprobante: string;
  items: CartItem[];
  subtotal: number;
  descuentoGlobal: number;
  totalNeto: number;
  recibido: number;
  tipoVenta: string;
  metodoPago: string;
}
