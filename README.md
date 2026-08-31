# 🐱 GATA — Control de Turnos y Cobros (Android APK)

**GATA** es una aplicación móvil 100% offline y autónoma para Android diseñada para el control diario de turnos, cálculo de dinero generado, cuentas por cobrar por cliente, cobros individuales/por rango/parciales, cierres mensuales con archivo histórico y saldo a favor.

---

## 📥 Descarga Directa del APK
Puedes descargar e instalar el archivo APK directamente en tu dispositivo Android:
👉 **[Descargar GATA.apk](./GATA.apk)** *(Versión 1.1)*

---

## ✨ Características Principales

1. **🎨 Diseño en Fondo Claro (Obligatorio):**
   - Interfaz limpia, ágil, moderna y optimizada para celulares y tablets.
   - Tarjetas nítidas, tipografía con alto contraste y navegación intuitiva.

2. **➕ Botón Rápido "Agregar Turno de Hoy":**
   - Autodetección de la fecha actual y cálculo automático del día de la semana.
   - Carga automática de la tarifa configurada por cliente.
   - Campo de observaciones opcionales con sugerencias rápidas.
   - Detección de turnos duplicados en la misma fecha con diálogo de confirmación.

3. **📅 Calendario Visual Multicolor:**
   - Asignación de **colores diferenciados para cada cliente** (Azul, Morado, Ámbar, Rosa, Teal, Índigo, etc.).
   - Leyenda de clientes en la parte superior.
   - Vistas Mensual, Semanal y Diaria con desglose del total generado por día.

4. **🔴 Cuentas Por Cobrar & 4 Métodos de Cobro:**
   - **Cobro Individual:** Cobro de un turno específico con método de pago y notas.
   - **Cobro de Varios:** Selección con checkboxes y subtotal calculado.
   - **Cobro por Rango de Fechas:** Filtro *Desde* y *Hasta* con aislamiento total (solo afecta los turnos del cliente seleccionado).
   - **Cobro Parcial:** Abonos con distribución automática hacia los turnos más antiguos o selección manual.
   - Lista expandible de turnos pendientes en cada cliente y pestaña con todos los turnos.

5. **💵 Saldo a Favor & Historial de Pagos:**
   - Registro de ingresos por método (Nequi, Daviplata, Efectivo, Bancolombia, Transferencia, Tarjeta).
   - Opción de **Anular Cobro** preservando la trazabilidad.

6. **📁 Cierres Mensuales & Históricos:**
   - Consolidado por cliente (turnos, días trabajados, generado, cobrado, pendiente).
   - Detalle de fechas y observaciones de cada jornada.
   - Función para guardar cierres oficiales inmutables.

7. **📊 Reportes Financieros:**
   - Informes por Día, Mes, Cliente y Año.
   - Exportación estructurada a documento **PDF** y compartir por **WhatsApp**.

8. **🛡️ 100% Autónomo y Offline:**
   - No requiere conexión a internet ni servidores externos.
   - Exportación e importación de respaldos en formato **JSON**.

---

## 🛠️ Tecnologías Utilizadas
- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS + Lucide Icons
- **Móvil:** Capacitor Android 8
- **Exportación:** jsPDF + jspdf-autotable
- **Empaquetado:** Gradle 8 + OpenJDK 21 + Android SDK

---

## 📱 Instalación en Android
1. Descarga el archivo `GATA.apk` en tu celular.
2. Abre el archivo y presiona **Instalar**.
3. Si el sistema lo solicita, autoriza la instalación de fuentes desconocidas.
4. ¡Abre GATA y empieza a gestionar tus turnos!
