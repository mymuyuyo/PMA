# Flujo operativo

## 1. Carga de documentos

La administracion carga los verificadores en la carpeta que corresponde al anio y tipo de evidencia.

Ejemplo:

```text
evidencias/2026/01_patente_municipal/2026_patente_municipal_muyuyo.pdf
evidencias/2026/02_bomberos/2026_informe_general_inspeccion_bomberos.pdf
```

Los informes historicos se cargan por periodo junio-mayo. El periodo 2015-2016 es anual excepcional; los periodos siguientes son bianuales.

```text
documentos_pma/informes_bianuales/2015_06_a_2016_05/
documentos_pma/informes_bianuales/2016_06_a_2018_05/
documentos_pma/informes_bianuales/2018_06_a_2020_05/
documentos_pma/informes_bianuales/2020_06_a_2022_05/
documentos_pma/informes_bianuales/2022_06_a_2024_05/
```

Los oficios de presentacion, acuses o respuestas se cargan en la carpeta del mismo periodo:

```text
documentos_pma/oficios_presentacion/2022_06_a_2024_05/
```

## 2. Actualizacion del indice manual

Cuando se sube o modifica una evidencia, se actualiza `data/evidence-index.json` agregando la ruta del archivo. Este archivo es el indice que lee el dashboard.

Ejemplo:

```json
{
  "path": "evidencias/2026/01_patente_municipal/2026_patente_municipal_muyuyo.pdf",
  "name": "2026_patente_municipal_muyuyo.pdf",
  "type": "patente_municipal",
  "year": 2026
}
```

## 3. Revision en dashboard

El dashboard lee el indice y muestra:

- Cumplimiento general.
- Cumplimiento por subplan.
- Verificadores presentes y pendientes.
- Alertas documentales.
- Historial por anio.

## 4. Revision PNG

Para revision del PNG se entrega:

- PMA final en PDF.
- Dashboard de cumplimiento.
- Carpeta de evidencias por anio.
- Matriz de cumplimiento exportable.

## 5. Operacion sin API

El HTML no escribe en GitHub. El flujo operativo es manual:

1. Cargar archivos en `evidencias/`.
2. Actualizar `data/evidence-index.json`.
3. Publicar cambios en GitHub.
4. Revisar el dashboard publicado en GitHub Pages.

El dashboard se publica desde la raiz del repositorio mediante `index.html`.
