# PMA Dashboard Muyuyo

Estructura base manual para subir a GitHub el sistema de seguimiento documental del Plan de Manejo Ambiental del Hostal Muyuyo.

Este repositorio esta disenado para trabajar sin API, sin tokens y sin automatizaciones. El dashboard es un sitio estatico que lee archivos JSON cargados manualmente junto con las evidencias.

El repositorio permite:

- Mantener el PMA final y sus respaldos documentales.
- Organizar evidencias por anio y tipo de verificador.
- Actualizar manualmente un indice de evidencias.
- Mostrar un dashboard HTML de cumplimiento para revision del PNG.
- Publicar el dashboard mediante GitHub Pages.

## Capas del repositorio

| Carpeta | Funcion |
| --- | --- |
| `documentos_pma/` | Versiones oficiales del PMA, anexos, informes bianuales historicos y oficios de presentacion. |
| `evidencias/` | Verificadores anuales, semestrales y eventuales cargados por anio. |
| `data/` | Reglas del plan, matriz de cumplimiento e indice manual de evidencias. |
| `index.html`, `styles.css`, `app.js` | Dashboard HTML, CSS y JavaScript para consulta desde la raiz. |
| `docs/` | Arquitectura, flujo de uso y criterios de cumplimiento. |

## Flujo general

1. Se suben verificadores a `evidencias/<anio>/<tipo_verificador>/`.
2. Se actualiza manualmente `data/evidence-index.json` con la ruta de cada evidencia cargada.
3. El dashboard lee `data/plan.json`, `data/evidence-rules.json` y `data/evidence-index.json`.
4. El dashboard calcula y muestra el estado de cumplimiento del PMA.

Los informes bianuales historicos y oficios de presentacion se archivan en `documentos_pma/informes_bianuales/` y `documentos_pma/oficios_presentacion/`. Estos documentos forman parte del expediente historico del PMA.

## Regla tecnica sin API

Sin API, un HTML publicado en GitHub Pages no puede listar automaticamente todos los archivos de una carpeta del repositorio. Por eso el dashboard usa `data/evidence-index.json` como indice manual. Cada vez que se sube, elimina o cambia una evidencia, se actualiza ese archivo.

## Publicacion

El repositorio se publica en GitHub Pages desde la carpeta `/root`. El archivo `index.html` debe quedar en la raiz junto con `styles.css`, `app.js`, `data/`, `documentos_pma/` y `evidencias/`.
