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

  // Group features by coordinates to find duplicates at same location
  const coords = features[0].geometry.coordinates;
  const featuresAtLocation = features.filter(f => 
    f.geometry.coordinates[0] === coords[0] && 
    f.geometry.coordinates[1] === coords[1]
  );

  let currentIndex = 0;

  // Function to render popup content
  const renderPopup = (index) => {
    const feature = featuresAtLocation[index];
    const total = featuresAtLocation.length;
    
    return `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">${feature.properties.title || 'Untitled'}</h3>
        <p style="margin: 0 0 12px 0; font-size: 14px;">${feature.properties.description || ''}</p>
        ${total > 1 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ddd; padding-top: 8px;">
            <button id="prev-btn" style="
              background: #007cbf;
              color: white;
              border: none;
              padding: 4px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">← Prev</button>
            <span style="font-size: 12px; color: #666;">${index + 1} of ${total}</span>
            <button id="next-btn" style="
              background: #007cbf;
              color: white;
              border: none;
              padding: 4px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Next →</button>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Create popup
  const popup = new mapboxgl.Popup({ 
    offset: [0, -15],
    closeButton: true,
    closeOnClick: false
  })
    .setLngLat(coords)
    .setHTML(renderPopup(currentIndex))
    .addTo(map);

  // Add event listeners for navigation buttons (if multiple features)
  if (featuresAtLocation.length > 1) {
    const addListeners = () => {
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + featuresAtLocation.length) % featuresAtLocation.length;
          popup.setHTML(renderPopup(currentIndex));
          addListeners(); // Re-attach listeners after HTML update
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % featuresAtLocation.length;
          popup.setHTML(renderPopup(currentIndex));
          addListeners(); // Re-attach listeners after HTML update
        });
      }
    };

    addListeners();
  }
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
