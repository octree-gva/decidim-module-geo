---
sidebar_position: 1
title: Prepare Shape
description: Use QGIS to prepare shapefiles in decidim geo 
---

:::info
You can skip this section if you already have your shapefile at hand. 
:::

# Before starting
Decidim Geo add some GIS functionnality to decidim, and work with a special geo-data file type named Shapefile. 
A shapefile is a file that describe polygons: shape, name and other metadatas. 

Decidim Geo allows you to bind shapefiles to your decidim scopes. This enables use cases like: 

- Add one shape per neighborhood
- Add regions (south/east/oest) areas in the platform
- Use Decidim for a country/state and use geografic shapes.

## Prepare your shapes in QGIS
[QGIS](https://qgis.org/) is a desktop application to manipulate spacial data. It's an open-source software commonly used for geographical data. 
It enables many uses cases, as creating layers, polygons or points. In specific Decidim Geo use case, we will use QGIS to prepare polygonal shapes we will attribute later to Decidim scopes. 

**Install QGIS**<br />
[Install QGis for your distribution (Mac/Linux/Windows): https://qgis.org/download/](https://qgis.org/download/)

**Open QGIS and use the openstreet map tiles**<br />
![Open QGIS](./prepare-shapefiles/prepare-shapefile-00.png)


**Add a Shapefile Layer**<br />
![Click on Add Layer to project](./prepare-shapefiles/prepare-shapefile-07.png)

**Add details to the new layer**<br />
![Configure the new layer](./prepare-shapefiles/prepare-shapefile-08.png)
- File Name: the name of the layer you will work on
- File encoding: UTF-8
- Additional Dimention: None, in WGS-84

**Add a `NAME` field**<br />
![Add a NAME field to the shape](./prepare-shapefiles/prepare-shapefile-09.png)
- Name: NAME
- Type: Text
- Length: The max length for your shape label. 200 is enough normally

**Add field to list**<br />
![Click on the add field to list button](./prepare-shapefiles/prepare-shapefile-10.png)

**Select your new empty layer**<br />
![Select your new empty layer](./prepare-shapefiles/prepare-shapefile-11.png)

**Click on edit - pencil button**<br />
![Click on the pencil button](./prepare-shapefiles/prepare-shapefile-13.png)
Click on the pencil button of the topbar to start editing your shape. 

**Select polygon stencil**<br />
![Click on the polygon tool to start designing a polygon](./prepare-shapefiles/prepare-shapefile-14.png)

**Make your shape**<br />
![Click by click, make your polygon](./prepare-shapefiles/prepare-shapefile-16.png)
Click after click, make your polygon. Once you are done, right-click to finalize the shape. 

**Complete the id and NAME field**<br />
![Add any uniq value to the id field, and labelize your shape by entering the NAME metadatas](./prepare-shapefiles/prepare-shapefile-17.png)
- id: any numeric value. MUST be uniq between shapes
- NAME: the label you will use in Decidim to identificate the shape. It is not a label visible by the users of Decidim Geo, but only the admins.

**Add more shapes**<br />
![You can then add more shapes](./prepare-shapefiles/prepare-shapefile-18.png)

**Export the shape**<br />
![Click right on the shape, export > save feature as](./prepare-shapefiles/prepare-shapefile-21.png)

- Right click on the shape layer
- Go to Export > Save Feature As

**Export the shape**<br />
![Click right on the shape, export > save feature as](./prepare-shapefiles/prepare-shapefile-22.png)

- Filename: Whatever you want, Avoid special characters, spaces, or upercases.
- Layer name: Same as filename
- CRS: WSG 84

Click on OK to export

**Find the exported files in your computer**<br />
![Click right on the shape, export > save feature as](./prepare-shapefiles/prepare-shapefile-24.png)

- Select all the 6 generated files
- Compress in zip file these files


-> Done! You have a zip file that can be uploaded through the decidim administration



