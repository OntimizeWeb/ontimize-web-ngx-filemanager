# Plan: Migración Angular 15 → 18 — ontimize-web-ngx-filemanager

## TL;DR
Migración incremental del addon `ontimize-web-ngx-filemanager` (Angular 15 → 18) siguiendo la misma estrategia de ramas que el framework principal. La dependencia `ontimize-web-ngx` se actualiza en paralelo con cada fase. El peer `@angular/flex-layout` se sustituye por CSS nativo en la fase 18.

## Datos clave del codebase (reales)
- **5 NgModules**: OFileManagerModule, OFileManagerTableModule, OFileInputExtendedModule, OTableExtendedModule, OFileManagerTranslateModule
- **0 standalone components** en la versión base (15.x.x)
- **12 componentes/pipes** (11 componentes + 1 pipe: OFileManagerTranslatePipe)
- **10 templates HTML** con directivas flex-layout (fxLayout, fxFlex, fxLayoutAlign)
- **1 spec file**
- **1 archivo SCSS de theming**: `o-filemanager-table-theme.scss` (copiado a dist/ en el build)
- **2 usages de `Injector.get()`**: en `OFileManagerTranslatePipe` y `OFileInputExtendedComponent`
- **Sin guards propios**
- Dependencias externas clave: `ngx-skeleton-loader ^7.0.0`
- Build script copia `o-filemanager-table-theme.scss` a dist/ → verificar tras cada fase

## Estrategia de Ramas

```
15.x.x (intocable)
  └── 18.x.x (punto de partida, copia de 15.x.x)
       ├── migration/16.x.x (Angular 16)
       │    └── migration/17.x.x (Angular 17)
       │         └── migration/18.x.x (Angular 18 final)
       └── (merge final a 18.x.x cuando esté listo)
```

---

## FASE 1: Angular 15 → 16 — Rama `migration/16.x.x`

### Acciones a realizar
- Actualizar todas las dependencias Angular a `^16.2.0`
- `ng-packagr` → `^16.2.0`, `typescript` → `~5.0.4`, `zone.js` → `~0.13.0`
- Actualizar `tsconfig.json`: `module` → `es2022`
- `ngx-skeleton-loader` → `^8.0.0` (requiere actualización para Angular 16)
- Añadir `moment` → `^2.29.4` (requerido por `@angular/material-moment-adapter`)
- Añadir `@ngbracket/ngx-layout@^16.0.0` (sustitución transitional de `@angular/flex-layout`)
- Mantener `@angular/flex-layout@^15.0.0-beta.42` como peer transitorio
- `ontimize-web-ngx` → `^15.9.0` (última versión 15 publicada)
- Actualizar `projects/ontimize-web-ngx-filemanager/package.json`: peer deps a `^16.2.0`

### Notas de compatibilidad
- `ontimize-web-ngx` no tiene versión 16 publicada en npm → usar `^15.9.0`
- `ngx-skeleton-loader@^8.0.0` es compatible con Angular 16

### No aplica en esta fase
- **Control flow migration**: pospuesto a Fase 2
- **Standalone**: pospuesto a Fase 3
- **inject() migration**: pospuesto a Fase 3

### Verificación
- `npm run build` — compila sin errores (incluye copia de `o-filemanager-table-theme.scss`)
- Verificar que el SCSS theme se copia a `dist/`

---

## FASE 2: Angular 16 → 17 — Rama `migration/17.x.x`

### Acciones a realizar
- Actualizar todas las dependencias Angular a `^17.3.0`
- `ng-packagr` → `^17.3.0`, `typescript` → `~5.2.2`, `zone.js` → `~0.14.0`
- `@angular-eslint/*` → `^17.0.0`
- `@ngbracket/ngx-layout` → `^17.0.1`
- `ontimize-web-ngx` → mantenido en `^15.9.0`
- Actualizar `projects/ontimize-web-ngx-filemanager/package.json`: peer deps a `^17.3.0`

### Control flow migration
- **Herramienta**: `ng generate @angular/core:control-flow`
- **Alcance**: 10 templates HTML con `*ngIf`/`*ngFor`
- Revisar diff tras el schematic — los templates mezclan flex-layout con control flow

### No aplica en este addon
- **Migración `inject()`**: 2 usages simples — pospuesto a Fase 3 junto con standalone
- **Guards funcionales**: sin guards propios
- **Standalone gradual**: sin componentes hoja claros — se hace todo en Fase 3

### Verificación
- `npm run build` — compila sin errores
- `npm test` — spec pasa

---

## FASE 3: Angular 17 → 18 — Rama `migration/18.x.x`

### 3.1 Actualizar dependencias core
- Actualizar todas las dependencias Angular a `^18.2.0`
- `ng-packagr` → `^18.2.0`, `typescript` → `~5.5.4`
- Añadir `luxon ^3.4.0` + `@types/luxon` (peer de `ngx-material-timepicker` transitivo del framework)
- Eliminar `@angular/flex-layout` y `@ngbracket/ngx-layout`
- `ontimize-web-ngx` → `file:../ontimize-web-ngx/dist/ontimize-web-ngx-18.0.0-SNAPSHOT-0.tgz`
- Actualizar `projects/ontimize-web-ngx-filemanager/package.json`: peer deps a `^18.2.0`, `ontimize-web-ngx ^18.0.0`
- **`projects/ontimize-web-ngx-filemanager/tsconfig.lib.json`**: añadir `"compilationMode": "partial"` en `angularCompilerOptions`
  > ⚠️ `tsconfig.lib.prod.json` ya lo tiene, pero `tsconfig.lib.json` (usado por `npm run build` sin `-c production`) no. Sin esto el dist se compila en modo full y produce errores `NG0203` / `NullInjectorError` en el consumidor.

### 3.2 Eliminar flex-layout → CSS nativo
- **Alcance**: 10 templates con directivas `fxLayout`/`fxFlex`/`fxLayoutAlign`/`fxLayoutGap`
- Usar las clases utilitarias `o-flex-*` definidas en `ontimize-web-ngx` (flex-layout.scss)
- **Templates afectados**:
  - `o-file-input-extended.component.html`
  - `o-filemanager-table.component.html`
  - `o-table-column-renderer-filetype.component.html`
  - `change-name-dialog.component.html`
  - `copy-dialog.component.html`
  - `folder-name-dialog.component.html`
  - `o-table-extended.component.html`
  - `o-table-skeleton.component.html`
  - `download-progress.component.html`
  - `upload-progress.component.html`

### 3.3 Standalone migration
**Inventario de componentes a migrar:**
| Componente / Directiva | Archivo |
|---|---|
| `OFileManagerTableComponent` | `filemanager-table/o-filemanager-table.component.ts` |
| `OFileInputExtendedComponent` | `file-input/o-file-input-extended.component.ts` |
| `OTableExtendedComponent` | `table-extended/o-table-extended.component.ts` |
| `OTableSkeletonExtendedComponent` | `table-extended/skeleton/o-table-skeleton/o-table-skeleton.component.ts` |
| `OTableColumnRendererFileSizeComponent` | `filemanager-table/renderers/filesize/` |
| `OTableColumnRendererFileTypeComponent` | `filemanager-table/renderers/filetype/` |
| `ChangeNameDialogComponent` | `table-extended/dialog/changename/` |
| `CopyDialogComponent` | `table-extended/dialog/copy/` |
| `FolderNameDialogComponent` | `table-extended/dialog/foldername/` |
| `DownloadProgressComponent` | `status/download/` |
| `UploadProgressComponent` | `status/upload/` |
| `OFileManagerTranslatePipe` | `util/o-filemanager-translate.pipe.ts` |

**Módulos wrapper a mantener por backward compatibility:**
- `OFileManagerModule`, `OFileManagerTableModule`, `OFileInputExtendedModule`, `OTableExtendedModule` → re-exportar standalone components

**Pasos:**
1. Añadir `standalone: true` a cada componente/pipe
2. Mover sus `imports` de NgModule al array `imports` del decorador `@Component`
3. Mantener los NgModule wrapper re-exportando los standalone components
4. Verificar build y copia de theme a dist/

### 3.4 Migrar `Injector.get()` → `inject()`
- **2 usages**:
  - `OFileManagerTranslatePipe`: `this.injector.get(OTranslateService)` → `inject(OTranslateService)`
  - `OFileInputExtendedComponent`: `this.injector.get(WorkspaceService)` → `inject(WorkspaceService)`
- Patrón: mover a field initializer con `inject()` directo

### No aplica en este addon
- **M3 theming migration**: `o-filemanager-table-theme.scss` usa API M2 — compatible sin cambios con Angular Material 18; se actualizará cuando el framework migre a M3
- **Typed Forms**: sin uso de `UntypedFormGroup`/`UntypedFormControl` propios
- **Guards funcionales**: sin guards propios

---

## Verificación por fase

1. `npm run build` — debe compilar sin errores (incluye `copy-files` para el SCSS theme)
2. Verificar que `o-filemanager-table-theme.scss` se copia correctamente a `dist/`
3. `npm test` — spec pasa

---

## Decisiones

- **flex-layout**: Añadir `@ngbracket/ngx-layout` transitional en Fases 1-2; eliminar en Fase 3 y migrar a clases `o-flex-*` del framework
- **ontimize-web-ngx**: Usar `^15.9.0` en Fases 1-2; apuntar al tgz local `^18.0.0` en Fase 3
- **ngx-skeleton-loader**: Actualizar a `^8.0.0` en Fase 1 (Angular 16 compatible)
- **inject()**: Migrar 2 usages simples en Fase 3 junto con standalone
- **Standalone**: Migrar todos los componentes en Fase 3 — sin componentes hoja que justifiquen migración parcial en Fase 2
- **M3 theming**: Postergado — se actualizará cuando `ontimize-web-ngx` publique su nueva API de theming M3
- **Control flow**: Migrar en Fase 2 con el schematic automático
