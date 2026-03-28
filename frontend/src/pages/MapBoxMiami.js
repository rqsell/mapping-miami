import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

mapboxgl.accessToken = process.env.REACT_APP_MAP_BOX_ACCESS_TOKEN;

// ---------- Image Modal ----------
const ImageModal = ({ image, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!image) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Modal box — stop clicks from closing */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12, padding: 20,
          maxWidth: "90vw", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 16,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{image.name}</p>

        {/* Image */}
        <div style={{ overflow: "hidden", borderRadius: 8, maxHeight: "60vh" }}>
          <img
            src={image.url}
            alt={image.name}
            style={{
              maxWidth: "70vw",
              maxHeight: "60vh",
              objectFit: "contain",
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              display: "block",
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "＋ Zoom In",   action: () => setZoom((z) => Math.min(z + 0.25, 4)) },
            { label: "－ Zoom Out",  action: () => setZoom((z) => Math.max(z - 0.25, 0.25)) },
            { label: "↺ Rotate L",  action: () => setRotation((r) => r - 90) },
            { label: "↻ Rotate R",  action: () => setRotation((r) => r + 90) },
            { label: "⟳ Reset",     action: () => { setZoom(1); setRotation(0); } },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                background: "#007cbf", color: "#fff", border: "none",
                padding: "6px 14px", borderRadius: 6,
                cursor: "pointer", fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={onClose}
            style={{
              background: "#e53e3e", color: "#fff", border: "none",
              padding: "6px 14px", borderRadius: 6,
              cursor: "pointer", fontSize: 13,
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
const MapBoxMiami = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [modalImage, setModalImage] = useState(null); // { url, name }

  useEffect(() => {
    const cleanNumber = (val) => {
      if (!val) return NaN;
      return parseFloat(val.toString().trim().replace(/^'/, ""));
    };

    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1Acm62Pc2Da_v-WOP6SksGTeMIakzzdSoVtKYG4kMqck/gviz/tq?tqx=out:csv&sheet=miami-data";

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
              const firstName = (keys.firstName || keys["name"] || "").trim();
              const imageUrl = (keys.imageurl || keys.image || "").trim();
              const workshopLocation = keys.workshopLocation || keys["workshop"] || "";
              const lat = cleanNumber(keys.latitude || keys.lat || "");
              const lng = cleanNumber(keys.longitude || keys.lon || keys.lng || "");

              return {
                type: "Feature",
                geometry: { type: "Point", coordinates: [lng, lat] },
                properties: { firstName, workshopLocation, imageUrl },
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

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/rqsell/cmfe4dvgz007801s4f6srej35/draft",
      center: [-80.1918, 25.7617],
      zoom: 10.7,
    });

    const map = mapRef.current;

    // ✅ Delegate clicks on popup images up to the map container
    const handlePopupImageClick = (e) => {
      if (e.target.tagName === "IMG" && e.target.closest(".mapboxgl-popup")) {
        setModalImage({
          url: e.target.src,
          name: e.target.alt || "",
        });
      }
    };
    mapContainer.current.addEventListener("click", handlePopupImageClick);

    map.on("load", async () => {
      const geojson = await loadCsv();
      if (!geojson) return;

      map.addSource("csvData", { type: "geojson", data: geojson });
      map.addLayer({
        id: "csvData",
        type: "circle",
        source: "csvData",
        paint: {
          "circle-radius": 5,
          "circle-color": [
            "match",
            ["get", "workshopLocation"],
            "Vizcaya Museum and Gardens 3/29/26", "green",
            "Main Branch 1/31/26",               "purple",
            "Bass Museum Pilot (2023)",           "orange",
            "#cccccc",
          ],
        },
      });

      const interval = setInterval(async () => {
        if (!map || map._removed) return;
        const src = map.getSource("csvData");
        if (!src) return;
        const updated = await loadCsv();
        if (updated) src.setData(updated);
      }, 30000);

      map.__refreshInterval = interval;
    });

    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["csvData"],
      });
      if (!features.length) return;

      const coords = features[0].geometry.coordinates;
      const featuresAtLocation = features.filter(
        (f) =>
          f.geometry.coordinates[0] === coords[0] &&
          f.geometry.coordinates[1] === coords[1]
      );

      let currentIndex = 0;

      const renderPopup = (index) => {
        const feature = featuresAtLocation[index];
        const total = featuresAtLocation.length;
        return `
          <div style="min-width:200px;">
            <h3 style="margin:0 0 8px 0;font-size:16px;">${feature.properties.firstName || ""}</h3>
            <p style="margin:0 0 12px 0;font-size:14px;">${feature.properties.workshopLocation || ""}</p>
            <img
              src="${feature.properties.imageUrl}"
              alt="${feature.properties.firstName}"
              title="Click to enlarge"
              style="width:100%;max-width:300px;height:auto;border-radius:8px;
                     margin-top:12px;cursor:zoom-in;"
            />
            ${
              total > 1
                ? `<div style="display:flex;justify-content:space-between;
                               align-items:center;border-top:1px solid #ddd;padding-top:8px;">
                    <button id="prev-btn" style="background:#007cbf;color:white;border:none;
                      padding:4px 12px;border-radius:4px;cursor:pointer;font-size:14px;">← Prev</button>
                    <span style="font-size:12px;color:#666;">${index + 1} of ${total}</span>
                    <button id="next-btn" style="background:#007cbf;color:white;border:none;
                      padding:4px 12px;border-radius:4px;cursor:pointer;font-size:14px;">Next →</button>
                  </div>`
                : ""
            }
          </div>
        `;
      };

      const popup = new mapboxgl.Popup({
        offset: [0, -15],
        closeButton: true,
        closeOnClick: false,
      })
        .setLngLat(coords)
        .setHTML(renderPopup(currentIndex))
        .addTo(map);

      if (featuresAtLocation.length > 1) {
        const addListeners = () => {
          const prevBtn = document.getElementById("prev-btn");
          const nextBtn = document.getElementById("next-btn");
          if (prevBtn) {
            prevBtn.addEventListener("click", () => {
              currentIndex = (currentIndex - 1 + featuresAtLocation.length) % featuresAtLocation.length;
              popup.setHTML(renderPopup(currentIndex));
              addListeners();
            });
          }
          if (nextBtn) {
            nextBtn.addEventListener("click", () => {
              currentIndex = (currentIndex + 1) % featuresAtLocation.length;
              popup.setHTML(renderPopup(currentIndex));
              addListeners();
            });
          }
        };
        addListeners();
      }
    });

    return () => {
      mapContainer.current?.removeEventListener("click", handlePopupImageClick);
      if (map.__refreshInterval) clearInterval(map.__refreshInterval);
      map.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}
      />
      {/* ✅ Modal lives outside the map div so React manages it cleanly */}
      <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
    </>
  );
};

export default MapBoxMiami;