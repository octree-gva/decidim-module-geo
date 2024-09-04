<h1 align="center"><img src="https://github.com/octree-gva/meta/blob/main/decidim/static/header.png?raw=true" alt="Decidim - Octree Participatory democracy on a robust and open source solution" /></h1>
<h4 align="center">
    <a href="https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab">Roadmap</a> |
    <a href="https://drive.google.com/file/d/1lfQJumDg0Ic-RZi-R3MM8frYtKN7PB_S/view?usp=sharing">Presentation</a> |
    <a href="https://github.com/octree-gva/decidim-module-geo/issues">Issues</a>  <br/>
    <a href="https://www.octree.ch">Octree</a> |
    <a href="https://octree.ch/en/contact-us/">Contact Us</a> |
    <a href="https://blog.octree.ch">Our Blog (FR)</a><br/><br/>
    <a href="https://decidim.org">Decidim</a> |
    <a href="https://docs.decidim.org/en/">Decidim Docs</a> |
    <a href="https://meta.decidim.org">Participatory Governance (meta decidim)</a><br/><br/>
    <a href="https://matrix.to/#/+decidim:matrix.org">Decidim Community (Matrix+Element.io)</a>
</h4>



# Decidim::Geo
Have you ever wondered to centralize all the participation in a map? Well, we do and that is the purpose of Decidim GEO. 
Participation on the map, means: 

* Overview participation: Be able to consult what happens where.
* Participate: Be able to pin points, select zones, etc. while participating

This project is its early stage, and has it is quiet ambicious, we open CO-FUNDING and setup a public Roadmap here: [https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab](https://octreegva.notion.site/Roadmap-Decidim-GEO-f191fcb9e220401f8135514a7bd41aab).

If you are curious on how it started, [we've made some slide to present the project](https://drive.google.com/file/d/1lfQJumDg0Ic-RZi-R3MM8frYtKN7PB_S/view?usp=sharing).


## Features

**Link shapes to a scope**<br />
On the admin side, you can now upload a zip shapefile in the `WGS 84` format.
Once uploaded, you can assign a scope type to the shapefile.

Example of use: 
- Add a shapefile to the admin with the shapes of the city neighborhoods
- Create a scope type called "neighborhoods"
- For each neighborhood, create a scope of type "neighborhoods"
- Link related meetings, assemblies, processes, and proposals to these scopes
- See the magic: the maps now display the neighborhoods, allowing you to navigate the platform through maps. 

---

**Homepage block**<br />
In the homepage settings, you can now drag a Decidim Geo block to display a map
with all the points of the platform.
Once the Decidim Geo homepage block is active, the map will provide an entry point to
navigate through the participatory platform.

---
**Default map center and zoom**<br />
You can now customize all Decidim Geo maps at once by defining a default center and zoom level. 
This provides a better experience when loading the map, already having the right perspective to start navigating.

To update the map's center and zoom, go to the Geo tab in the administration and click on Configuration.

---

**Custom Tiles**<br />
You can now define custom tiles to change the underlying appearance of the map.
Displaying custom tiles allows more precise control over what is viewed, and can, for example, increase map contrast for better accessibility.

---

**Hide maps when there is nothing to show**<br />
Maps will be hidden if there is no point to show. For example, a meeting without a location won't display a map in its details. 
Scopes that do not contain any data will also be hidden, preventing the user from filtering something when there is no data to display.

**Highlight points**<br />
We've defined some rules to highlight points displayed on the current page:

- When you are on a meeting detail page that is geolocated, the current point will be highlighted.
- When you are on a meeting page, all geolocated points will be highlighted.

Same for proposals, debates etc.

---

**Discover points around**<br />
If you have multiple processes linked to the same geolocated scope, points will appear to suggest navigating through the area you are currently in. 

Imagine the following situation:
- A participatory budget is running in the neighborhood.
- In the same neighborhood, another process is gathering projects.

From the participatory budget page, you will see all the points in the neighborhood, providing a quick overview of what is happening there.


<img
    src="https://github.com/octree-gva/meta/blob/main/decidim/static/geo/admin.png?raw=true"
    alt="Administration of the GEO space" />
<img
    src="https://github.com/octree-gva/meta/blob/main/decidim/static/geo/consult.png?raw=true"
    alt="Administration of the GEO space" />


## Documentation
You can consult our documentation on the [decidim-geo documentation website](https://octree-gva.github.io/decidim-module-geo/)

## Contributions

New ideas are welcome on our [feedback page](https://feedback.voca.city/?tags=decidim-geo). We manage there co-financing and release planning.
For technical aspects (contributions, code, issues), take a look at our [gitlab](https://git.octree.ch/decidim/decidim-module-geo).

## License

This engine is distributed under the [GNU AFFERO GENERAL PUBLIC LICENSE](LICENSE-AGPLv3.txt)

<br /><br />

<h3 align="center">With the support of</h3>
<p align="center">
        <img
            src="https://git.octree.ch/decidim/decidim-module-geo/-/raw/main/partners.png?raw=true"
            alt="Lausanne Participe — Une plateforme de participation pour imaginer et réaliser ensemble" />
</p>

