const { initMap, createScopesDropdown } = require("./ui");
const { getGeoShapefiles, getGeoJSON } = require("./api");
const polylabel = require("polylabel");

async function main() {
  const map = await initMap();

  const shapefiles = await getGeoShapefiles();
  shapefiles.forEach(async shapefileElement => {
    const geojsonFeature = await getGeoJSON(shapefileElement.shapefile);

    const shapefileLayer = L.geoJSON(geojsonFeature, {
      onEachFeature: function (feature, layer) {
        const label = String(feature.properties.NAME);
        if (feature.geometry.type === "Polygon") {
          const centroid = polylabel(feature.geometry.coordinates, 1.0);
          const circle = new L.circleMarker([centroid[1], centroid[0]], {
            radius: 6,
            fillColor: "#000000",
            fillOpacity: 1,
            color: "#cccccc",
            opacity: 1,
            weight: 5,
          });
          return circle
            .bindTooltip(label, {
              permanent: true,
              opacity: 1,
              permanent: true,
              direction: "top",
              className: "decidimGeo__scope__tooltip",
            })
            .openTooltip()
            .addTo(map);
        }
      },
      style: feature => {
        return {
          fillColor: "#cccccc",
          color: "#999999",
          lineJoin: "miter",
          dashArray: "5, 10",
          dashOffset: "5",
        };
      },
    }).addTo(map);
  });

  const scopesDropdown = await createScopesDropdown(map);
}

main();
