import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

mapboxgl.accessToken =
  "pk.eyJ1IjoicnFzZWxsIiwiYSI6ImNtZGoxd25qYzBpMGQyam9qeXBlcjd5cXAifQ.iXLBlCELLaYma9nfTDCOrg";

const MapBoxMiami = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // ---------- Helper to clean numbers ----------
    const cleanNumber = (val) => {
      if (!val) return NaN;
      // Remove leading/trailing spaces and any leading apostrophe
      return parseFloat(val.toString().trim().replace(/^'/, ""));
    };

    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1Acm62Pc2Da_v-WOP6SksGTeMIakzzdSoVtKYG4kMqck/gviz/tq?tqx=out:csv&sheet=miami-data";

    // ---------- Load CSV and convert to GeoJSON ----------
    const loadCsv = async () => {
      try {
        const res = await fetch(`${sheetUrl}&cacheBust=${Date.now()}`);
        const csvText = await res.text();
        const rows = d3.csvParse(csvText);

        const geojson = {
          type: "FeatureCollection",
          features: rows
            .map((r) => {
              const keys = Object.fromEntries(
                Object.entries(r).map(([k, v]) => [k.trim().toLowerCase(), v])
              );

              const title = (keys.title || keys.name || "").trim();
              const description = (keys.description || keys.notes || "").trim();

              const lat = cleanNumber(keys.latitude || keys.lat || "");
              const lng = cleanNumber(keys.longitude || keys.lon || keys.lng || "");

              return {
                type: "Feature",
                geometry: { type: "Point", coordinates: [lng, lat] },
                properties: { title, description },
              };
            })
            .filter(
              (f) =>
                !isNaN(f.geometry.coordinates[0]) &&
                !isNaN(f.geometry.coordinates[1])
            ),
        };

        return geojson;
      } catch (err) {
        console.error("Error loading CSV:", err);
        return null;
      }
    };

    // ---------- Initialize Map ----------
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/rqsell/cmfe4dvgz007801s4f6srej35/draft",
      center: [-80.1918, 25.7617],
      zoom: 10.7,
    });

    const map = mapRef.current;

    // ---------- When map loads ----------
    map.on("load", async () => {
      const geojson = await loadCsv();
      if (!geojson) return;

      // Add source & layer
      map.addSource("csvData", { type: "geojson", data: geojson });
      map.addLayer({
        id: "csvData",
        type: "circle",
        source: "csvData",
        paint: { "circle-radius": 5, "circle-color": "purple" },
      });

      // ---------- Auto-refresh every 30s ----------
      const interval = setInterval(async () => {
        if (!map || map._removed) return;
        const src = map.getSource("csvData");
        if (!src) return;

        const updated = await loadCsv();
        if (updated) {
          console.log("Updating map with new data...");
          src.setData(updated);
        }
      }, 30000);

      map.__refreshInterval = interval;
    });

    // ---------- Popup on click ----------
    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["csvData"],
      });
      if (!features.length) return;

      const feature = features[0];
      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          `<h3>${feature.properties.title}</h3>
           <p>${feature.properties.description}</p>`
        )
        .addTo(map);
    });

    // ---------- Cleanup ----------
    return () => {
      if (map.__refreshInterval) clearInterval(map.__refreshInterval);
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}
    />
  );
};

export default MapBoxMiami;
