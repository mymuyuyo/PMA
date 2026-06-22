# Guia para subir manualmente a GitHub

## 1. Crear repositorio

Crear un repositorio en GitHub, por ejemplo:

```text
pma-dashboard-muyuyo
```

Puede ser privado si los verificadores contienen informacion sensible.

## 2. Subir la estructura

Subir completa la carpeta `pma-dashboard-muyuyo/` al repositorio.

La estructura minima que debe estar en GitHub es:

```text
data/
documentos_pma/
evidencias/
schemas/
docs/
index.html
styles.css
app.js
README.md
SUBIR_A_GITHUB.md
```

## 3. Subir documentos del PMA

Colocar el PMA final en:

```text
documentos_pma/pma_final/
```

Colocar informes bianuales historicos en:

```text
documentos_pma/informes_bianuales/
```

La estructura de periodos es:

```text
2015_06_a_2016_05/  periodo anual excepcional
2016_06_a_2018_05/  periodo bianual
2018_06_a_2020_05/  periodo bianual
2020_06_a_2022_05/  periodo bianual
2022_06_a_2024_05/  periodo bianual
2024_06_a_2026_05/  periodo bianual
```

Colocar oficios, acuses y respuestas en:

```text
documentos_pma/oficios_presentacion/
```

Los oficios se archivan en la carpeta del mismo periodo del informe presentado.

## 4. Subir evidencias

Colocar cada verificador en su carpeta:

```text
evidencias/2026/01_patente_municipal/
evidencias/2026/02_bomberos/
evidencias/2026/03_desechos_solidos/
evidencias/2026/04_productos_proveedor/
evidencias/2026/05_verificacion_semestral/
evidencias/2026/06_acta_anual_pma_simulacro/
evidencias/2026/07_incidentes_acciones_quejas/
```

## 5. Actualizar el indice manual

Editar `data/evidence-index.json` y agregar cada archivo cargado dentro de `files`.

Ejemplo:

```json
{
  "path": "evidencias/2026/01_patente_municipal/2026_patente_municipal_muyuyo.pdf",
  "name": "2026_patente_municipal_muyuyo.pdf",
  "type": "patente_municipal",
  "year": 2026
}
```

## 6. Publicar dashboard

En GitHub:

1. Entrar a `Settings`.
2. Entrar a `Pages`.
3. En `Build and deployment`, seleccionar `Deploy from a branch`.
4. Elegir la rama principal.
5. Elegir carpeta `/root`.
6. Guardar.

## 7. Revisar cumplimiento

Abrir la URL publicada por GitHub Pages. El dashboard leera:

- `data/plan.json`
- `data/evidence-rules.json`
- `data/evidence-index.json`

Con esos archivos calcula el cumplimiento del PMA.
