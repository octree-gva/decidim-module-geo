---
sidebar_position: 2
title: Configure Shapes
description: Upload, configure and define shapes in decidim geo
---

# Scope with a geografical area

Decidim-Geo allows you to upload a shapefile, file that contains many shapes. 
After the upload, you can assign each shape to a decidim scope, creating a transversal nagivation for your whole platform. 



:::info
Configuring shapefiles and attribute shapes to scopes are optional.
If you never used Decidim Scopes before, you can safly skip this page.
:::


# Prerequisite
Your shapefile needs to fullfill the following constraints: 

- Shapes needs to have a `NAME` metadata. This name will be the label to use in your admin side. 
- The shapefile is a zip file containing nothing else but shape files data. No .DS_Store or other distribution specific files are supported
- The shapes needs to be exported in WSG-84 projection. 

# Upload the zip file
To upload the zipfile, go in you administration dashboard and click on the "Geo" icon.
![Click on the Geo in the lateral menu to configure Decidim geo](./upload-shapefile/screenshot-01.png)

On the lateral Menu, click on the Shapefile tab, and upload your zipfile. 
The upload may be loading for a while, to save all the shapes in the database, so please be patient. 

![Click on the Geo in the lateral menu to configure Decidim geo](./upload-shapefile/screenshot-02.png)

## Link Shapefile to a scope type
Once uploaded, you can link a shapefile to a scope type. Once done, all scopes of the scopetypes will be geo-compatible. 

![Click on the Geo in the lateral menu to configure Decidim geo](./upload-shapefile/screenshot-03.png)


## Link the scopes to the Shapedata
Once you have specified a geo-friendly scope type, all the scopes associates will have a field named "Shape Data". 
This allows you to select for each scope the matching scope data. 

![Click on the Geo in the lateral menu to configure Decidim geo](./upload-shapefile/screenshot-04.png)
