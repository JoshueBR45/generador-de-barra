# BarcodePrint 📱🏷️ - Generador e Impresor Móvil de Etiquetas Térmicas

Aplicación web progresiva (**PWA**) diseñada especialmente para celulares y computadoras, pensada para negocios, tiendas de ropa y retail que necesitan generar códigos de barra e imprimirlos en **impresoras térmicas de etiquetas adhesivas** o de rollo continuo.

---

## ✨ Características Principales

1. **Generación Automática de Códigos y Números (SKU)**:
   - Al escribir el nombre de la prenda o producto (ej: *Camisa*, *Pantalón*), genera automáticamente un **código numérico único**.
   - Formatos estándar: **CODE 128**, **EAN-13** (13 dígitos de retail), **UPC-A** y **CODE 39**.
   - Puedes escribir tu propio número si ya lo tienes, o pulsar **"Nuevo código"** para generar uno nuevo automáticamente.
   - El número generado lo puedes copiar con 1 toque o exportar para subirlo a tu sistema de facturación / inventario (POS).

2. **Etiquetas Adhesivas Pequeñas y Medidas Estándar**:
   - `40 × 30 mm` (medida ideal y estándar para ropa, precios y retail).
   - `50 × 30 mm` y `50 × 25 mm` (etiquetas adhesivas compactas).
   - `30 × 20 mm` (mini etiquetas para accesorios o joyería).
   - `58 mm` y `80 mm` (rollo continuo tipo ticket o recibo).

3. **Cantidad de Copias**:
   - Selector rápido con botones `+` y `-` para elegir cuántas etiquetas imprimir del mismo producto (ej: 5, 10, 50).

4. **Conexión con Impresoras Térmicas**:
   - **Diálogo del celular (Recomendado / Universal)**: Funciona con el servicio de impresión de Android/iOS (vía Wi-Fi, Bluetooth o apps puente como *RawBT*). Las medidas de la hoja están calibradas con `@page { margin: 0; }` para que la etiqueta salga exacta y sin bordes blancos.
   - **Bluetooth Directo (Web Bluetooth)**: Conexión directa a impresoras térmicas portátiles ESC/POS mediante el botón Bluetooth en la barra superior.
   - **Descarga como Imagen (PNG)**: Por si deseas compartirla por WhatsApp o imprimirla desde la app oficial de tu impresora (ej: Xprinter, PeriPage, Niimbot, Phomemo).

5. **Catálogo e Historial de Códigos**:
   - Guarda los productos generados en la memoria del teléfono.
   - Botón **"Exportar Excel/CSV"** para descargar la lista completa y cargarla directamente en tu software de cobro.

---

## 🚀 Cómo abrir la app en tu Teléfono

1. Asegúrate de que tu celular esté conectado a la **misma red Wi-Fi** que tu computadora.
2. Abre el navegador de tu celular (Google Chrome en Android o Safari en iPhone) e ingresa la siguiente dirección:
   ```text
   http://192.168.100.64:8085
   ```
3. **Instalar en la pantalla de inicio**:
   - En Android (Chrome): Toca los tres puntos `⋮` y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla de inicio"**.
   - En iPhone (Safari): Toca el botón Compartir y elige **"Agregar al inicio"**.
   - Se abrirá en pantalla completa como cualquier aplicación móvil nativa.
