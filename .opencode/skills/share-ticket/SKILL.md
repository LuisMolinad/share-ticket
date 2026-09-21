---
name: ShareTicket
description: Guía de desarrollo para ShareTicket, la app de división de gastos de este repo (React 19 + TypeScript + Vite + CSS puro). Usar cuando se añada o modifique funcionalidad, cálculos de división (strategies), componentes, estilos, exportación PDF o el deploy a GitHub Pages.
---

# ShareTicket

SPA que divide una factura (subtotal, descuento, impuestos, propina) entre
participantes, en modo equitativo o por ítems, y exporta el reporte a PDF.
Toda la interfaz y textos están en español.

## Comandos

```sh
pnpm install      # Node >= 22, pnpm (hay .npmrc con shared-workspace-lockfile=false)
pnpm dev          # vite (HMR)
pnpm lint         # oxlint
pnpm build        # tsc -b && vite build  → dist/
pnpm preview      # vite preview
```

`pnpm build` ejecuta el typecheck de TypeScript: sin locales/parámetros sin
usar y sin errores de tipos. Ejecutar `pnpm lint` y `pnpm build` antes de dar
por terminado un cambio.

## Estructura

```text
src/
├── main.tsx                  # createRoot + StrictMode, importa index.css y App.tsx
├── App.tsx                   # orquestador: usa el hook y pasa props a los componentes
├── index.css                 # tokens globales (:root) + layout, cards, botones, forms
├── App.css                   # SOLO restos de la plantilla Vite (.counter, .hero, #center…); sin uso en el JSX
├── components/               # Header, InvoiceDetailsCard, ParticipantsManager,
│                             # ItemsManager, SummaryView  (+ su .css junto a cada .tsx)
├── domain/
│   ├── types.ts              # modelo de datos: único source of truth
│   ├── totals.ts             # calculateTotals(): subtotal/descuento/impuesto/propina global (respeta los flags *Enabled)
│   ├── strategies/           # ISplitStrategy, EqualSplitStrategy, ItemizedSplitStrategy
│   └── factories/SplitStrategyFactory.ts
├── hooks/useInvoiceCalculator.ts   # estado + mutaciones + cálculo con useMemo
├── utils/pdfGenerator.ts     # jsPDF + jspdf-autotable
└── assets/
```

Flujo de datos: `useInvoiceCalculator` (único estado, `useState<Invoice>`) →
`App` → componentes vía props → callbacks del hook. No hay estado de negocio
dentro de los componentes; solo estado local de UI (inputs en edición,
selecciones transitorias).

## Modelo de datos (`src/domain/types.ts`)

`Invoice` (title, date, currency, taxPercentage, tipPercentage,
discountAmount, taxEnabled, tipEnabled, discountEnabled, splitMode,
participants, items), `Participant` (id, name, color), `InvoiceItem` (id, name,
price, quantity, assignedParticipantIds), `SplitMode = 'equal' | 'itemized'`.

Salida del cálculo: `CalculationResult` con los totales globales y
`shares: ParticipantShare[]` (subtotal, taxShare, tipShare, discountShare,
total, assignedItems por persona).

Al cambiar el modelo, actualiza en el mismo cambio: las estrategias, el hook,
`SummaryView`, `pdfGenerator.ts` y `InvoiceDetailsCard` si aplica.

## Patrón de estrategias (divisiones)

`SplitStrategyFactory.createStrategy(invoice.splitMode)` devuelve una
`ISplitStrategy` con `calculate(invoice): CalculationResult`; el hook la
ejecuta dentro de `useMemo(..., [invoice])`.

Para añadir un modo nuevo:

1. Agrega el valor a `SplitMode` en `domain/types.ts`.
2. Crea `domain/strategies/<Name>SplitStrategy.ts` implementando
   `ISplitStrategy` (clase con `export class`).
3. Regístrala en el `switch` de `SplitStrategyFactory`.
4. Agrega el botón/toggle en `Header.tsx` (`onUpdateDetails({ splitMode })`).

Reglas aritméticas (viven en `domain/totals.ts` → `calculateTotals()`;
las estrategias solo reparten los totales):

- `subtotal = Σ price * quantity`.
- Descuento solo aplica si `discountEnabled`; recortado:
  `min(max(0, discountAmount), subtotal)`.
- Impuestos solo aplican si `taxEnabled` y propina si `tipEnabled`; se
  calculan sobre el subtotal **ya descontado**.
- Sin participantes se devuelven los totales con `shares: []`.
- En `itemized`, un ítem sin `assignedParticipantIds` se reparte entre todos.
- Impuestos/propina/descuento se prorratean por el subtotal de cada persona;
  `total` por persona con piso en 0 (`Math.max(0, …)`).
- Un concepto desactivado no se borra: conserva su valor y simplemente no se
  aplica (UI lo muestra como "desactivado", el PDF pone `—`/`0.00`).

## Convenciones de código

- Componentes: `export const Nombre: React.FC<NombreProps> = ({ … }) => …`,
  con la interfaz de props declarada arriba en el mismo archivo e
  `import './Nombre.css';`. Iconos de `lucide-react`.
- Tipo-only con `import type { … }` (`verbatimModuleSyntax` está activo).
- Sin enums ni *parameter properties* (`erasableSyntaxOnly`): usar uniones de
  tipos, como `SplitMode`.
- `noUnusedLocals` / `noUnusedParameters` activos; `noFallthroughCasesInSwitch`.
- IDs generados con `Date.now().toString()` en el hook (patrón existente).
- Moneda: prefijo `invoice.currency` + `.toFixed(2)` en todos los montos;
  cantidades fraccionales muestran enteros sin decimales si son exactas
  (`item.quantity % 1 === 0 ? … : …`).
- Textos de UI en español.

## Estilos (CSS puro, sin Tailwind ni CSS-in-JS)

- Tokens y utilidades compartidas (`.card`, `.card-title`, `.btn`,
  `.btn-primary`, `.form-input`, `.form-label`, `.empty-state`, `.grid-2`,
  `.form-grid`) viven en `src/index.css`: reutilizarlos antes de duplicar.
- Cada componente tiene su `Componente.css` al lado, importado desde su
  `.tsx`; clases en kebab-case con prefijo del bloque (`.header-inner`,
  `.item-card`, `.summary-banner`).
- Colores solo vía variables (`--primary: #4f46e5`, `--danger`, …); el
  acento indigo es `#4f46e5`.
- Switches on/off (impuestos, propina, descuento) en `InvoiceDetailsCard`:
  patrón `.switch` + `.switch-slider` (checkbox oculto) definido en
  `InvoiceDetailsCard.css`; reutilizarlo si se agregan más toggles.
- Responsive mobile-first con media queries (`min-width: 640px/768px/1024px`).

## PDF (`src/utils/pdfGenerator.ts`)

`generateInvoicePDF(invoice, result)` con `jspdf` + `jspdf-autotable`
(función, no clase). Indigo `rgb(79,70,229)` en encabezados y totales;
paginación manual revisando `lastAutoTable.finalY` (umbral ~240–260) y pie
de página en todas las páginas. Guarda
`ticket_<título-sanitizado>_<fecha>.pdf`. Cualquier campo nuevo de totales o
de desglose debe reflejarse aquí.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) publica en GitHub Pages al
hacer push a `main`/`master`: pnpm + Node 22 → `pnpm install
--frozen-lockfile` → `pnpm build` → sube `./dist`.

Por eso `vite.config.ts` fija `base: '/share-ticket/'`; no cambiarlo sin
ajustar también el deploy. El build debe pasar con lockfile congelado
(actualizar `pnpm-lock.yaml` si se cambian dependencias).

## Pendiente conocido

- `src/App.css` y `src/assets/` (hero.png, react.svg, vite.svg) son restos de
  la plantilla Vite: nada los referencia en el JSX actual.
- `README.md` sigue siendo el de la plantilla React+Vite.
