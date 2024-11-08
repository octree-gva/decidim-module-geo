---
sidebar_position: 1
title: Prepare Shape
description: Use QGIS to prepare shapefiles in Decidim Geo 
---

:::info
You can skip this section if you already have your shapefile ready. 
:::

# Before Starting
Decidim Geo adds GIS functionality to Decidim and works with a specific geo-data file type called a Shapefile. A shapefile describes polygons, including their shape, name, and other metadata.

Decidim Geo allows you to bind shapefiles to Decidim scopes, enabling use cases such as:

- Adding a shape per neighborhood
- Adding regions (south/east/west) to the platform
- Using Decidim for a country or state with geographic shapes

## Prepare Your Shapes in QGIS
[QGIS](https://qgis.org/) is an open-source desktop application commonly used for geographic data manipulation. It enables various operations like creating layers, polygons, or points. In Decidim Geo, we use QGIS to prepare polygonal shapes for assignment to Decidim scopes.

**Install QGIS**  
[Install QGIS for your operating system (Mac/Linux/Windows): https://qgis.org/download/](https://qgis.org/download/)

**Open QGIS and use the OpenStreetMap tiles**  
![Open QGIS](./prepare-shapefiles/prepare-shapefile-00.png)

**Add a Shapefile Layer**  
![Click on Add Layer to project](./prepare-shapefiles/prepare-shapefile-07.png)

**Add Details to the New Layer**  
![Configure the new layer](./prepare-shapefiles/prepare-shapefile-08.png)

- **File Name:** The name of the layer you will work on
- **File Encoding:** UTF-8
- **Additional Dimension:** None, in WGS-84

**Add a `NAME` Field**  
![Add a NAME field to the shape](./prepare-shapefiles/prepare-shapefile-09.png)

- **Name:** NAME
- **Type:** Text
- **Length:** Set the maximum length for your shape label (200 is usually sufficient)

**Add Field to List**  
![Click on the add field to list button](./prepare-shapefiles/prepare-shapefile-10.png)

**Select Your New Empty Layer**  
![Select your new empty layer](./prepare-shapefiles/prepare-shapefile-11.png)

**Click the Edit (Pencil) Button**  
![Click on the pencil button](./prepare-shapefiles/prepare-shapefile-13.png)  
Click the pencil button on the top bar to start editing your shape.

**Select Polygon Tool**  
![Click on the polygon tool to start designing a polygon](./prepare-shapefiles/prepare-shapefile-14.png)

**Draw Your Shape**  
![Click by click, make your polygon](./prepare-shapefiles/prepare-shapefile-16.png)  
Click to define each point of your polygon. When complete, right-click to finalize the shape.

**Complete the ID and NAME Fields**  
![Add any unique value to the id field, and label your shape by entering the NAME metadata](./prepare-shapefiles/prepare-shapefile-17.png)

- **ID:** Any unique numeric value
- **NAME:** The label for the shape in Decidim (used by admins only)

**Add More Shapes if Needed**  
![You can then add more shapes](./prepare-shapefiles/prepare-shapefile-18.png)

**Export the Shape**  
![Right-click on the shape layer, go to Export > Save Feature As](./prepare-shapefiles/prepare-shapefile-21.png)

- Right-click on the shape layer
- Select Export > Save Feature As

**Export Settings**  
![Set export options](./prepare-shapefiles/prepare-shapefile-22.png)

- **Filename:** Avoid special characters, spaces, or uppercase letters
- **Layer Name:** Same as filename
- **CRS:** WSG 84

Click **OK** to export.

**Find the Exported Files on Your Computer**  
![Locate the exported shapefile set](./prepare-shapefiles/prepare-shapefile-24.png)

- Select all six generated files
- Compress these files into a zip file

-> Done! You now have a zip file that can be uploaded through the Decidim administration.
