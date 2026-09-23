# Casa de Cambio

Aplicación móvil (Expo / React Native + TypeScript) para operar una casa de cambio:
configuración inicial, tipos de cambio, registro de operaciones y recibo en pantalla.

## Ejecutar

```bash
npm install
npm start        # luego i (iOS), a (Android), w (web)
npm run ios
npm run android
```

## Módulos

| Pestaña | Archivo | Qué hace |
| --- | --- | --- |
| Configuración inicial | [SetupScreen.tsx](src/screens/SetupScreen.tsx) | Se muestra una sola vez: negocio, sucursal, operador, moneda de caja, comisión y prefijo de folio. Al terminar siembra USD y EUR como ejemplo. |
| Operar | [OperationScreen.tsx](src/screens/OperationScreen.tsx) | Compra/venta con el tipo de cambio elegido, monto capturable en divisa o en moneda local, cálculo en vivo y emisión del recibo. |
| Tipos | [RatesScreen.tsx](src/screens/RatesScreen.tsx) | Alta, edición, activación y baja de divisas con precio de compra y de venta. |
| Historial | [HistoryScreen.tsx](src/screens/HistoryScreen.tsx) | Operaciones registradas, resumen del día y reimpresión del recibo (toque = ver, pulsación larga = eliminar). |
| Ajustes | [SettingsScreen.tsx](src/screens/SettingsScreen.tsx) | Los mismos parámetros de inicio más datos fiscales, decimales, leyenda del recibo y restablecimiento total. |

## Cómo se calcula una operación

[`quote()`](src/utils/exchange.ts) es el único lugar donde vive la aritmética:

- **Compra**: la casa recibe divisa del cliente al precio de *compra* y le paga en moneda
  de caja. La comisión se **resta** del subtotal.
- **Venta**: la casa entrega divisa al cliente al precio de *venta* y le cobra en moneda
  de caja. La comisión se **suma** al subtotal.

El monto puede capturarse en divisa (`FOREIGN`) o en moneda local (`LOCAL`); en el segundo
caso la divisa se deriva dividiendo entre el tipo de cambio aplicado.

## Recibo

[`Receipt.tsx`](src/components/Receipt.tsx) genera dos representaciones del mismo ticket a
partir de la misma fuente de datos: la vista en pantalla (papel blanco, tipografía
monoespaciada) y el HTML que usan **Imprimir** (`expo-print`) y **PDF**
(`expo-print` + `expo-sharing`). Cada operación recibe un folio consecutivo `REC-00001`.

## Datos

Todo se guarda en el dispositivo con `AsyncStorage` ([storage.ts](src/storage.ts)) y se
expone mediante un contexto único ([AppContext.tsx](src/state/AppContext.tsx)). No hay
backend ni red.

## Diseño

Negro como color principal con tonalidades blancas y grises, definido en
[theme.ts](src/theme.ts). Sin librería de UI ni de navegación: pestañas propias
([TabBar.tsx](src/components/TabBar.tsx)) y componentes base en
[ui.tsx](src/components/ui.tsx).
