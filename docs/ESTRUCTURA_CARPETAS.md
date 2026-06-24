# Estructura de carpetas

```text
pma-dashboard-muyuyo/
  README.md
  SUBIR_A_GITHUB.md
  index.html
  styles.css
  app.js
  documentos_pma/
    README.md
    pma_final/
    anexos/
      2015_06_a_2016_05/
      2016_06_a_2018_05/
      2018_06_a_2020_05/
      2020_06_a_2022_05/
      2022_06_a_2024_05/
      2024_06_a_2026_05/
      2026_06_a_2028_05/
      2028_06_a_2030_05/
      otros_periodos/
    informes_bianuales/
      2015_06_a_2016_05/
      2016_06_a_2018_05/
      2018_06_a_2020_05/
      2020_06_a_2022_05/
      2022_06_a_2024_05/
      2024_06_a_2026_05/
      2026_06_a_2028_05/
      2028_06_a_2030_05/
      otros_periodos/
    oficios_presentacion/
      2015_06_a_2016_05/
      2016_06_a_2018_05/
      2018_06_a_2020_05/
      2020_06_a_2022_05/
      2022_06_a_2024_05/
      2024_06_a_2026_05/
      2026_06_a_2028_05/
      2028_06_a_2030_05/
      otros_anios/
  evidencias/
    2026/
      01_patente_municipal/
      02_bomberos/
      03_desechos_solidos/
      04_productos_proveedor/
      05_verificacion_semestral/
      06_acta_anual_pma_simulacro/
      07_incidentes_acciones_quejas/
    2027/
      mismas subcarpetas de evidencias
    2028/
      mismas subcarpetas de evidencias
    2029/
      mismas subcarpetas de evidencias
    2030/
      mismas subcarpetas de evidencias
  data/
    plan.json
    evidence-rules.json
    evidence-index.json
    evidence-index.template.json
  schemas/
    plan.schema.json
    evidence-rules.schema.json
    evidence-index.schema.json
  docs/
    ARQUITECTURA.md
    ESTRUCTURA_CARPETAS.md
    FLUJO_OPERATIVO.md
    MANUAL_SEGUIMIENTO.html
    MANUAL_SUBIR_INFORMACION.html
    PMA_VIGENTE.html
```

## Convencion de nombres de archivos

Usar nombres claros, sin caracteres especiales:

```text
2026_patente_municipal_muyuyo.pdf
2026_informe_general_inspeccion_bomberos.pdf
2026_comprobante_recoleccion_desechos_solidos.pdf
2026_certificacion_proveedor_productos.pdf
2026_verificacion_semestral_01.pdf
2026_verificacion_semestral_02.pdf
2026_acta_revision_pma_simulacro.pdf
2028_patente_municipal_muyuyo.pdf
2028_verificacion_semestral_01.pdf
2015_06_a_2016_05_informe_anual_pma_muyuyo.pdf
2015_06_a_2016_05_oficio_presentacion_informe_anual.pdf
2015_06_a_2016_05_anexos_informe_cumplimiento.pdf
2022_06_a_2024_05_informe_bianual_pma_muyuyo.pdf
2022_06_a_2024_05_oficio_presentacion_informe_bianual.pdf
2022_06_a_2024_05_anexos_informe_cumplimiento.pdf
```

## Regla documental

Cada archivo subido debe pertenecer a una carpeta de evidencia y debe registrarse en `data/evidence-index.json`. Sin API, el dashboard no puede leer automaticamente el listado de carpetas de GitHub Pages; por eso el indice manual es parte del control documental.

Para periodos anteriores a `2026_06_a_2028_05`, la documentacion esperada es solo: informe de cumplimiento, oficio de presentacion y anexos. La matriz del plan vigente aplica desde `2026_06_a_2028_05` en adelante.
