# ShareTicket

ShareTicket es una SPA para dividir gastos grupales entre participantes usando múltiples tickets, con reparto equitativo o por ítems, y exportación de reportes.

## Funcionalidades principales

- Gestión de grupo y moneda para una sesión de gastos.
- Múltiples tickets (`subInvoices`) dentro de una misma sesión.
- Modos de división por ticket:
  - **Equitativo** (`equal`): divide subtotal/impuestos/propina/descuento entre todos.
  - **Por ítems** (`itemized`): divide cada ítem por asignación de participantes.
- Exportación de resultados a:
  - **PDF** consolidado (`jsPDF` + `jspdf-autotable`).
  - **Google Sheets / Excel** (`xlsx`).
  - **JSON** (backup/restauración de la sesión).
- Persistencia automática de la sesión actual en `localStorage`.

## Stack

- React 19 + TypeScript
- Vite 8
- CSS puro
- `pnpm` como gestor de paquetes

## Requisitos

- Node.js **>= 22**
- `pnpm`

## Scripts

```bash
pnpm install
pnpm dev      # inicia Vite en desarrollo
pnpm lint     # ejecuta oxlint
pnpm build    # typecheck (tsc -b) + build de Vite en dist/
pnpm preview  # sirve la build local
```

## Desarrollo

El estado de negocio se centraliza en `useInvoiceCalculator` (`src/hooks/useInvoiceCalculator.ts`), que:

- administra participantes, tickets e ítems,
- calcula el consolidado usando `SplitStrategyFactory`,
- guarda/carga la sesión con `jsonPersistence`.

## Deploy

El workflow de GitHub Pages (`.github/workflows/deploy.yml`) publica al hacer push a `main`/`master` usando:

1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. despliegue de `dist/`

El `base` de Vite está fijado en `/share-ticket/` en `vite.config.ts` para compatibilidad con GitHub Pages.
