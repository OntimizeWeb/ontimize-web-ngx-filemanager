# Migración Angular 15 → 18 — Estado actual — ontimize-web-ngx-filemanager

> Última actualización: 22 abril 2026 (adopción del framework M3 — rama `migration/18.x.x`)

## Repositorio y ramas

| Rama | Estado |
|------|--------|
| `15.x.x` | Base original, intocable |
| `18.x.x` | Rama destino (copia de 15.x.x) |
| `migration/16.x.x` | ✅ Completado |
| `migration/17.x.x` | ✅ Completado |
| `migration/18.x.x` | ✅ Completado |

**Ruta local**: `C:\work\ontimize-web-ngx\18.x.x\ontimize-web-ngx-filemanager`

---

## ESTADO GLOBAL

| Fase | Estado | Commit |
|------|--------|--------|
| Fase 1: Angular 15→16 | ✅ Completado | `008d749` |
| Fase 2: Angular 16→17 | ✅ Completado | `d5bb6ce` |
| Fase 3: Angular 17→18 + standalone | ✅ Completado | `401ca93` |
| Fase 4: Adopción framework M3 | ✅ Completado | `8072f32` |

---

## FASES COMPLETADAS

### Fase 1: Angular 15 → 16 — commit `008d749` (22 abril 2026)

**Rama**: `migration/16.x.x`

#### Dependencias actualizadas

| Paquete | De | A |
|---------|-----|-----|
| `@angular/*` | `^15.2.9` | `^16.2.0` |
| `@angular-eslint/*` | `15.2.1` | `^16.0.0` |
| `ng-packagr` | `^15.2.2` | `^16.2.0` |
| `typescript` | `~4.9.5` | `~5.0.4` |
| `zone.js` | `~0.12.0` | `~0.13.0` |
| `ngx-skeleton-loader` | `7.0.0` | `^8.0.0` |
| `moment` | — | `^2.29.4` (añadido) |
| `ontimize-web-ngx` | `^15.7.1` | `^15.9.0` |

**`tsconfig.json`**: `module` → `es2022`

**`projects/ontimize-web-ngx-filemanager/package.json`**: peer deps `ontimize-web-ngx` → `^15.9.0`

#### Notas

- `@angular/flex-layout@^15.0.0-beta.42` se mantiene (se eliminará en Fase 3)
- `ontimize-web-ngx` no tiene versión 16/17 publicada — se usa `^15.9.0`
- Fix de spec: `OntimizeWebModule`/`TranslateModule` causa error en Angular 16 test env → reemplazado por `ONTIMIZE_PROVIDERS` + mock `TranslateService` + `HttpClientTestingModule`

---

### Fase 2: Angular 16 → 17 — commit `d5bb6ce` (22 abril 2026)

**Rama**: `migration/17.x.x`

| Paquete | De | A |
|---------|-----|-----|
| `@angular/*` | `^16.2.0` | `^17.3.0` |
| `@angular-eslint/*` | `^16.0.0` | `^17.0.0` |
| `ng-packagr` | `^16.2.0` | `^17.3.0` |
| `typescript` | `~5.0.4` | `~5.2.2` |
| `zone.js` | `~0.13.0` | `~0.14.0` |

Sin cambios en código fuente.

---

### Fase 3: Angular 17 → 18 + standalone — commit `401ca93` (22 abril 2026)

**Rama**: `migration/18.x.x`

#### Dependencias

| Paquete | De | A |
|---------|-----|-----|
| `@angular/*` | `^17.3.0` | `^18.2.0` |
| `@angular-eslint/*` | `^17.0.0` | `^18.0.0` |
| `ng-packagr` | `^17.3.0` | `^18.2.0` |
| `typescript` | `~5.2.2` | `~5.5.4` |
| `luxon` | — | `^3.4.0` (nuevo) |
| `@angular/flex-layout` | `^15.0.0-beta.42` | eliminado |
| `ontimize-web-ngx` | `^15.9.0` | `file:../ontimize-web-ngx/dist/ontimize-web-ngx-18.0.0-SNAPSHOT-0.tgz` |

#### Eliminación de `@angular/flex-layout`

10 templates migrados (`fxLayout`, `fxLayoutAlign`, `fxFlex`, `fxFill`, `fxLayoutGap`) → clases `o-flex-*` / `style="..."`:

| Template | Directivas eliminadas |
|---|---|
| `download-progress.component.html` | 5 |
| `upload-progress.component.html` | 5 |
| `o-file-input-extended.component.html` | 4 |
| `o-filemanager-table.component.html` | 1 |
| `o-table-column-renderer-filetype.component.html` | 1 |
| `o-table-extended.component.html` | 6 |
| `change-name-dialog.component.html` | 2 |
| `folder-name-dialog.component.html` | 2 |
| `copy-dialog.component.html` | 2 |
| `o-table-skeleton.component.html` | 5 |

#### Migración standalone

| Componente / Pipe | Cambio |
|---|---|
| `OFileManagerTranslatePipe` | `standalone: true`, `inject(OTranslateService)` |
| `DownloadProgressComponent` | `standalone: true`, imports Material modules |
| `UploadProgressComponent` | `standalone: true`, imports Material modules |
| `OTableColumnRendererFileSizeComponent` | `standalone: true` |
| `OTableColumnRendererFileTypeComponent` | `standalone: true`, imports `CommonModule`, `MatIconModule` |
| `OTableSkeletonExtendedComponent` | `standalone: true`, imports `NgxSkeletonLoaderModule`, `inject(AppearanceService)` |
| `ChangeNameDialogComponent` | `standalone: true`, `inject(MAT_DIALOG_DATA)` |
| `CopyDialogComponent` | `standalone: true`, `inject(MAT_DIALOG_DATA)` |
| `FolderNameDialogComponent` | `standalone: true`, imports Material + pipe |
| `OFileInputExtendedComponent` | `standalone: true`, imports Material + `OSharedModule` |
| `OTableExtendedComponent` | `standalone: true`, imports `OntimizeWebModule` + deps |
| `OFileManagerTableComponent` | `standalone: true`, imports todos los standalone hijos |
| `OFileManagerTableModule` | Convertido a wrapper NgModule (`imports/exports` standalone) |
| `OTableExtendedModule` | Convertido a wrapper NgModule |
| `OFileInputExtendedModule` | Convertido a wrapper NgModule |
| `OFileManagerTranslateModule` | Convertido a wrapper NgModule |

**spec**: `OFileInputExtendedComponent` movido de `declarations` a `imports` en TestBed.

---

### Fase 4: Adopción del framework M3 — commit `8072f32` (22 abril 2026)

**Rama**: `migration/18.x.x`

#### Cambios

| Fichero | Cambio |
|---|---|
| `o-filemanager-table-theme.scss` | Reescrito: `mat-color`/`map-get` M2 eliminados → `color-mix(in srgb, var(--o-primary-500) 54%, transparent)` y `var(--o-bg-background)` |

#### Validación

- `npm run build`: ✅ 0 errores.
- `npx ng test --watch=false`: ✅ `TOTAL: 1 SUCCESS`, 0 fallos.

---

### Corrección post-migración — commit `ef1ab76` (29 abril 2026)

| Fichero | Cambio |
|---|---|
| `o-filemanager-table.component.ts` | `OFileManagerTranslatePipe` añadido a `providers` del componente |

**Causa**: `OFileManagerTranslatePipe` es `standalone: true` y se obtiene vía `injector.get()` en el constructor. Los pipes standalone no se registran automáticamente como providers de DI — deben declararse explícitamente en el array `providers` del componente consumidor.

---

## PENDIENTE

Ninguno — migración completa ✅

---

## WORKFLOW DE BUILD

```bash
export PATH="$HOME/AppData/Local/nvs/node/20.18.3/x64:$PATH"

cd C:/work/ontimize-web-ngx/18.x.x/ontimize-web-ngx-filemanager
npm install --legacy-peer-deps
npm run build
# build incluye: ng build + copy-files (copia o-filemanager-table-theme.scss a dist/)
```
