// import React, { useEffect, useRef } from "react";
// import maplibregl from "maplibre-gl";
// import "@maptiler/sdk/dist/maptiler-sdk.css";
// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// import MapboxDraw from "@mapbox/mapbox-gl-draw";
// import { useMapStore } from "@/store/useMapStore";
// import jsPDF from "jspdf";
// import { Button } from "./ui/button";

// const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

// export const MapView: React.FC = () => {
//   const mapRef = useRef<maplibregl.Map | null>(null);
//   const drawRef = useRef<MapboxDraw | null>(null);

//   // get layers from Zustand
//   const layers = useMapStore((s) => s.layers);
//   const handleExport = () => {
//     // Grab the MapLibre GL canvas directly to avoid html2canvas limitations
//     mapRef.current?.redraw();
//     let lastIdleDataURL = "";
//     let mapCanvas = mapRef.current?.getCanvas();
//     if (!mapCanvas) {
//       console.error("Map canvas not found");
//       return;
//     }
//     const originalToDataURL = mapCanvas.toDataURL.bind(mapCanvas);
//     // Convert canvas to image data
//     console.log(mapCanvas)
//     const imgData = mapCanvas.toDataURL('image/png');
//     mapCanvas.toDataURL = function () {

//       return lastIdleDataURL;
//     }
//     // Waiting for the next moment, just after redraw,
//     // when the GPU will not be computing a new frame
//     // When the map is idle, we get the dataURL to be stored for later.
//     // Note how we are using the "originalToDataURL" function,
//     // since it's the one that does the actual frame grabbing
//     mapRef.current?.on("idle", async () => {
//       lastIdleDataURL = originalToDataURL();
//     });
//     // Create PDF
//     const pdf = new jsPDF({ orientation: 'landscape' });
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     // Calculate cover dimensions
//     const img = new Image();
//     img.src = imgData;
//     img.onload = () => {
//       const imgWidth = img.width;
//       const imgHeight = img.height;
//       const scale = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);
//       const renderWidth = imgWidth * scale;
//       const renderHeight = imgHeight * scale;
//       const xOffset = (pageWidth - renderWidth) / 2;
//       const yOffset = (pageHeight - renderHeight) / 2;

//       // Add image covering the page
//       pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
//       pdf.save('map.pdf');
//     }
//   };


//   const exportActiveLayerToPDF = async () => {
//     const {
//       layers,
//       activeLayerId,
//       setLayerVisibility,
//     } = useMapStore.getState();

//     if (!activeLayerId) {
//       alert("No active layer selected");
//       return;
//     }

//     // Step 1: Save visibility state and hide all other layers
//     const originalVisibility = layers.map((layer) => ({
//       id: layer.id,
//       visible: layer.visible,
//     }));

//     for (const layer of layers) {
//       if (layer.id !== activeLayerId && layer.visible) {
//         setLayerVisibility(layer.id, false); // hide non-active layers
//       }
//     }

//     // Wait one frame to ensure map updates
//     await new Promise((res) => setTimeout(res, 400)).then(() => {
//       mapRef.current?.redraw()
//     });
//     // Step 2: Export canvas

//     let lastIdleDataURL = "";
//     let mapCanvas = mapRef.current?.getCanvas();
//     if (!mapCanvas) {
//       console.error("Map canvas not found");
//       return;
//     }
//     const originalToDataURL = mapCanvas.toDataURL.bind(mapCanvas);
//     // Convert canvas to image data

//     const imgData = mapCanvas.toDataURL('image/png');
//     mapCanvas.toDataURL = function () {
//       return lastIdleDataURL;
//     }

//     mapRef.current?.on("idle", async () => {
//       lastIdleDataURL = originalToDataURL();
//     });
//     const pdf = new jsPDF({ orientation: "landscape" });

//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     const img = new Image();
//     img.src = imgData;
//     img.onload = () => {
//       const imgWidth = img.width;
//       const imgHeight = img.height;
//       const scale = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);
//       const renderWidth = imgWidth * scale;
//       const renderHeight = imgHeight * scale;
//       const xOffset = (pageWidth - renderWidth) / 2;
//       const yOffset = (pageHeight - renderHeight) / 2;

//       // Add image covering the page
//       pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
//       pdf.save('map.pdf');

//       // Step 3: Restore original visibility
//       for (const layer of originalVisibility) {
//         setLayerVisibility(layer.id, layer.visible);
//       }
//     };
//   };


//   useEffect(() => {
//     const map = new maplibregl.Map({
//       container: "map",
//       style: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
//       center: [72.8777, 19.076],
//       zoom: 15.5,
//       pitch: 45,
//       bearing: -17.6,
//     });
//     mapRef.current = map;


//     // --- custom draw styles with dynamic colors ----
//     const drawStyles: any[] = [
//       // line stroke - using data-driven styling
//       {
//         "id": "gl-draw-line",
//         "type": "line",
//         "filter": ["all", ["==", "$type", "LineString"]],
//         "layout": {
//           "line-cap": "round",
//           "line-join": "round"
//         },
//         "paint": {
//           "line-color": [
//             "case",
//             ["has", "user_color"],
//             ["get", "user_color"],
//             "#aeaeae" // fallback color
//           ],
//           "line-dasharray": [0.2, 2],
//           "line-width": 3
//         }
//       },
//       // polygon fill - using data-driven styling
//       {
//         "id": "gl-draw-polygon-fill",
//         "type": "fill",
//         "filter": ["all", ["==", "$type", "Polygon"]],
//         "paint": {
//           "fill-color": [
//             "case",
//             ["has", "user_color"],
//             ["get", "user_color"],
//             "#aeaeae" // fallback color
//           ],
//           "fill-outline-color": [
//             "case",
//             ["has", "user_color"],
//             ["get", "user_color"],
//             "#aeaeae" // fallback color
//           ],
//           "fill-opacity": 0.4
//         }
//       },
//       // polygon mid points
//       {
//         'id': 'gl-draw-polygon-midpoint',
//         'type': 'circle',
//         'filter': ['all',
//           ['==', '$type', 'Point'],
//           ['==', 'meta', 'midpoint']],
//         'paint': {
//           'circle-radius': 3,
//           'circle-color': '#fbb03b'
//         }
//       },
//       // polygon outline stroke - using data-driven styling
//       {
//         "id": "gl-draw-polygon-stroke-active",
//         "type": "line",
//         "filter": ["all", ["==", "$type", "Polygon"]],
//         "layout": {
//           "line-cap": "round",
//           "line-join": "round"
//         },
//         "paint": {
//           "line-color": [
//             "case",
//             ["has", "user_color"],
//             ["get", "user_color"],
//             "#aeaeae" // fallback color
//           ],
//           "line-dasharray": [0.2, 2],
//           "line-width": 3
//         }
//       },
//       // vertex point halos
//       {
//         "id": "gl-draw-polygon-and-line-vertex-halo-active",
//         "type": "circle",
//         "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
//         "paint": {
//           "circle-radius": 5,
//           "circle-color": "#FFF"
//         }
//       },
//       // vertex points - using data-driven styling
//       {
//         "id": "gl-draw-polygon-and-line-vertex-active",
//         "type": "circle",
//         "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
//         "paint": {
//           "circle-radius": 3,
//           "circle-color": [
//             "case",
//             ["has", "user_color"],
//             ["get", "user_color"],
//             "#aeaeae" // fallback color
//           ],
//         }
//       }
//     ];

//     const draw = new MapboxDraw({
//       displayControlsDefault: false,
//       controls: {},
//       userProperties: true,
//       styles: drawStyles,

//     });
//     drawRef.current = draw;
//     map.addControl(draw as any);
//     // map.on('load', function () {
//     //   // Insert the layer beneath any symbol layer.
//     //   const layers = map.getStyle().layers;

//     //   let labelLayerId;
//     //   for (let i = 0; i < layers.length; i++) {
//     //     if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
//     //       labelLayerId = layers[i].id;
//     //       break;
//     //     }
//     //   }

//     //   map.addLayer(
//     //     {
//     //       "id": "3d-buildings",
//     //       "source": "openmaptiles",
//     //       "source-layer": "building",
//     //       "type": "fill-extrusion",
//     //       "paint": {
//     //         "fill-extrusion-color": [
//     //           "interpolate",
//     //           ["linear"],
//     //           ["get", "render_height"],
//     //           0,
//     //           "#de8500ff",
//     //           200,
//     //           "#de0000ff",
//     //           400,
//     //           "#ff7772ff",
//     //         ],
//     //         "fill-extrusion-height": [
//     //           "interpolate",
//     //           ["linear"],
//     //           ["zoom"],
//     //           15,
//     //           0,
//     //           16,
//     //           ["get", "render_height"],
//     //         ],
//     //         "fill-extrusion-base": [
//     //           "case",
//     //           [">=", ["get", "zoom"], 1240],
//     //           ["get", "render_min_height"],
//     //           0,
//     //         ],
//     //       },
//     //     },
//     //     labelLayerId
//     //   );
//     // });


//     map.on("draw.create", (e) => {
//       const { activeLayerId, addFeatureToLayer, layers: allLayers } =
//         useMapStore.getState();

//       if (!activeLayerId) {
//         alert("Please create and select a layer first.");
//         draw.deleteAll();
//         return;
//       }
//       const feature = e.features?.[0];
//       if (!feature) return;

//       // inject the layer's current color
//       const layer = allLayers.find((l) => l.id === activeLayerId)!;
//       feature.properties = {
//         ...feature.properties,
//         user_color: layer.color
//       };

//       // add feature to the active layer
//       addFeatureToLayer(activeLayerId, feature);
//       draw.deleteAll(); // clear the sketch from the draw canvas
//     });

//     return () => {
//       map.remove();
//     };
//   }, []);
//   // useEffect(() => {
//   //   fetch("http://localhost:8000/gee-tiles")
//   //     .then(res => res.json())
//   //     .then(data => {
//   //       if (!mapRef.current) return;
//   //       mapRef.current.addSource('gee-layer', {
//   //         type: 'raster',
//   //         tiles: [data.tile_url],
//   //         tileSize: 512
//   //       });

//   //       mapRef.current.addLayer({
//   //         id: `gee-layer`,
//   //         type: 'raster',
//   //         source: 'gee-layer',
//   //         paint: { 'raster-opacity': 0.6 }
//   //       });
//   //     });
//   // }, []);


//   // whenever the layer list changes, re-draw all visible features
//   useEffect(() => {
//     if (!drawRef.current) return;
//     drawRef.current.deleteAll();

//     const visibleFeatures = layers
//       .filter((l) => l.visible)
//       .flatMap((l) =>
//         (l.features || []).map((f) => ({
//           ...f,
//           properties: {
//             ...f.properties,
//             user_color: l.color // Use user_color instead of color for consistency
//           }
//         }))
//       );

//     if (visibleFeatures.length) {
//       drawRef.current.add({
//         type: "FeatureCollection",
//         features: visibleFeatures
//       });
//     }
//   }, [layers]);

//   return (
//     <div className="relative h-screen w-full">
//       <div id="map" className="h-full w-full" />
//       <button
//         className="absolute top-4 left-4 bg-white border px-4 py-2 shadow-md z-10 cursor-pointer"
//         onClick={() => drawRef.current?.changeMode("draw_polygon")}

//       >
//         ✍️ Draw Polygon
//       </button>
//       <Button onClick={handleExport} className="absolute top-4 right-4 border px-4 py-2 shadow-md z-10 cursor-pointer ">
//         Export Map to PDF
//       </Button>

//       <Button
//         onClick={exportActiveLayerToPDF}
//         className="absolute top-20 right-4 border px-4 py-2 shadow-md z-10 cursor-pointer"
//       >
//         Export Active Layer to PDF
//       </Button>

//     </div>
//   );
// };



import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
// @ts-ignore
import osmtogeojson from "osmtogeojson";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/useMapStore";
import { jsPDF } from "jspdf";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

export const MapView: React.FC = () => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  useEffect(() => {
    fetch("http://localhost:8000/gee-tiles")
      .then(res => res.json())
      .then(data => {
        if (!mapRef.current) return;
        mapRef.current.addSource('gee-layer', {
          type: 'raster',
          tiles: [data.tile_url],
          tileSize: 512
        });

        mapRef.current.addLayer({
          id: `gee-layer`,
          type: 'raster',
          source: 'gee-layer',
          paint: { 'raster-opacity': 0.6 }
        });
      });
  }, []);
  /** Utility: Compute bbox from GeoJSON */
  const getGeoJSONBBox = (geojson: GeoJSON.GeoJSON) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const inspect = (coords: any) => {
      if (typeof coords[0] === "number") {
        const [x, y] = coords;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      } else coords.forEach(inspect);
    };
    if (geojson.type === "FeatureCollection")
      geojson.features.forEach((f: any) => inspect(f.geometry.coordinates));
    else if (geojson.type === "Feature")
      inspect(geojson.geometry.coordinates);
    else inspect((geojson as any).coordinates);

    return isFinite(minX) ? [[minX, minY], [maxX, maxY]] : null;
  };

  /** Draw boundary on map */
  const drawBoundary = useCallback((geojson: GeoJSON.GeoJSON, id = "search-boundary") => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getSource(id)) {
      (map.getSource(id) as maplibregl.GeoJSONSource).setData(geojson as any);
    } else {
      map.addSource(id, { type: "geojson", data: geojson });
    }

    if (!map.getLayer(`${id}-fill`)) {
      map.addLayer({
        id: `${id}-fill`,
        type: "fill",
        source: id,
        paint: { "fill-color": "#fbb03b", "fill-opacity": 0.25 },
      });
    }
    if (!map.getLayer(`${id}-line`)) {
      map.addLayer({
        id: `${id}-line`,
        type: "line",
        source: id,
        paint: { "line-color": "#f57c00", "line-width": 2 },
      });
    }

    const bbox = getGeoJSONBBox(geojson);
    if (bbox) map.fitBounds(bbox as any, { padding: 40 });
  }, []);

  /** Nominatim search */
  const searchNominatim = async (q: string) => {
    setLoadingSearch(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&polygon_geojson=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data || []);
      return data || [];
    } catch (err) {
      console.error("Nominatim search error", err);
      setResults([]);
      return [];
    } finally {
      setLoadingSearch(false);
    }
  };

  /** Overpass fallback */
  const fetchOverpassForOsm = async (osmType: string, osmId: number) => {
    try {
      const overpassQL = `[out:json];${osmType}(${osmId});out geom;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQL)}`;
      const res = await fetch(url);
      const json = await res.json();
      return osmtogeojson(json);
    } catch (err) {
      console.error("Overpass fetch error", err);
      return null;
    }
  };

  /** Handle selecting a search result */
  const handleSelectResult = async (r: any) => {
    const map = mapRef.current;
    if (!map) return;

    setResults([]);

    // Drop a marker for cities/towns/villages
    if (["city", "town", "village", "hamlet"].includes(r.type) && r.lat && r.lon) {
      const coords: [number, number] = [parseFloat(r.lon), parseFloat(r.lat)];
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new maplibregl.Marker({ color: "#d00" })
        .setLngLat(coords)
        .addTo(map);
      map.flyTo({ center: coords, zoom: 12 });
    }

    // Draw boundary if available
    if (r.geojson) {
      const geo: GeoJSON.GeoJSON =
        r.geojson.type === "FeatureCollection" || r.geojson.type === "Feature"
          ? r.geojson
          : {
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry: r.geojson, properties: { display_name: r.display_name } }],
          };
      drawBoundary(geo);
      return;
    }

    // Try Overpass
    if (r.osm_type && r.osm_id) {
      const osmType = r.osm_type === "relation" ? "relation" : r.osm_type === "way" ? "way" : "node";
      const geojson = await fetchOverpassForOsm(osmType, r.osm_id);
      if (geojson) drawBoundary(geojson);
      else alert("Could not fetch boundary geometry for this place.");
      return;
    }

    // Fallback: fit bounds
    if (r.boundingbox) {
      const [south, north, west, east] = r.boundingbox.map(Number);
      map.fitBounds([[west, south], [east, north]], { padding: 40 });
    }

  };

  /** Submit search */
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    await searchNominatim(query);

  };


  const exportActiveLayerToPDF = async () => {
    const {
      layers,
      activeLayerId,
      setLayerVisibility,
    } = useMapStore.getState();

    if (!activeLayerId) {
      alert("No active layer selected");
      return;
    }

    // Step 1: Save visibility state and hide all other layers
    const originalVisibility = layers.map((layer) => ({
      id: layer.id,
      visible: layer.visible,
    }));

    for (const layer of layers) {
      if (layer.id !== activeLayerId && layer.visible) {
        setLayerVisibility(layer.id, false); // hide non-active layers
      }
    }

    // Wait one frame to ensure map updates
    await new Promise((res) => setTimeout(res, 400)).then(() => {
      mapRef.current?.redraw()
    });
    // Step 2: Export canvas

    let lastIdleDataURL = "";
    let mapCanvas = mapRef.current?.getCanvas();
    if (!mapCanvas) {
      console.error("Map canvas not found");
      return;
    }
    const originalToDataURL = mapCanvas.toDataURL.bind(mapCanvas);
    // Convert canvas to image data

    const imgData = mapCanvas.toDataURL('image/png');
    mapCanvas.toDataURL = function () {
      return lastIdleDataURL;
    }

    mapRef.current?.on("idle", async () => {
      lastIdleDataURL = originalToDataURL();
    });
    const pdf = new jsPDF({ orientation: "landscape" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      const scale = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);
      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;
      const xOffset = (pageWidth - renderWidth) / 2;
      const yOffset = (pageHeight - renderHeight) / 2;

      // Add image covering the page
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
      pdf.save('map.pdf');

      // Step 3: Restore original visibility
      for (const layer of originalVisibility) {
        setLayerVisibility(layer.id, layer.visible);
      }
    };
  };

  const layers = useMapStore((s) => s.layers);


  const handleExport = () => {
    // Grab the MapLibre GL canvas directly to avoid html2canvas limitations
    mapRef.current?.redraw();
    let lastIdleDataURL = "";
    let mapCanvas = mapRef.current?.getCanvas();
    if (!mapCanvas) {
      console.error("Map canvas not found");
      return;
    }
    const originalToDataURL = mapCanvas.toDataURL.bind(mapCanvas);
    // Convert canvas to image data
    console.log(mapCanvas)
    const imgData = mapCanvas.toDataURL('image/png');
    mapCanvas.toDataURL = function () {

      return lastIdleDataURL;
    }
    // Waiting for the next moment, just after redraw,
    // when the GPU will not be computing a new frame
    // When the map is idle, we get the dataURL to be stored for later.
    // Note how we are using the "originalToDataURL" function,
    // since it's the one that does the actual frame grabbing
    mapRef.current?.on("idle", async () => {
      lastIdleDataURL = originalToDataURL();
    });
    // Create PDF
    const pdf = new jsPDF({ orientation: 'landscape' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate cover dimensions
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      const scale = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);
      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;
      const xOffset = (pageWidth - renderWidth) / 2;
      const yOffset = (pageHeight - renderHeight) / 2;

      // Add image covering the page
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
      pdf.save('map.pdf');
    }
  };


  /** Init map */

  const drawStyles: any[] = [
    // line stroke - using data-driven styling
    {
      "id": "gl-draw-line",
      "type": "line",
      "filter": ["all", ["==", "$type", "LineString"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": [
          "case",
          ["has", "user_color"],
          ["get", "user_color"],
          "#aeaeae" // fallback color
        ],
        "line-dasharray": [0.2, 2],
        "line-width": 3
      }
    },
    // polygon fill - using data-driven styling
    {
      "id": "gl-draw-polygon-fill",
      "type": "fill",
      "filter": ["all", ["==", "$type", "Polygon"]],
      "paint": {
        "fill-color": [
          "case",
          ["has", "user_color"],
          ["get", "user_color"],
          "#aeaeae" // fallback color
        ],
        "fill-outline-color": [
          "case",
          ["has", "user_color"],
          ["get", "user_color"],
          "#aeaeae" // fallback color
        ],
        "fill-opacity": 0.4
      }
    },
    // polygon mid points
    {
      'id': 'gl-draw-polygon-midpoint',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'midpoint']],
      'paint': {
        'circle-radius': 3,
        'circle-color': '#fbb03b'
      }
    },
    // polygon outline stroke - using data-driven styling
    {
      "id": "gl-draw-polygon-stroke-active",
      "type": "line",
      "filter": ["all", ["==", "$type", "Polygon"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": [
          "case",
          ["has", "user_color"],
          ["get", "user_color"],
          "#aeaeae" // fallback color
        ],
        "line-dasharray": [0.2, 2],
        "line-width": 3
      }
    },
    // vertex point halos
    {
      "id": "gl-draw-polygon-and-line-vertex-halo-active",
      "type": "circle",
      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
      "paint": {
        "circle-radius": 5,
        "circle-color": "#FFF"
      }
    },
    // vertex points - using data-driven styling
    {
      "id": "gl-draw-polygon-and-line-vertex-active",
      "type": "circle",
      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
      "paint": {
        "circle-radius": 3,
        "circle-color": [
          "case",
          ["has", "user_color"],
          ["get", "user_color"],
          "#aeaeae" // fallback color
        ],
      }
    }
  ];

  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
      center: [72.8777, 19.076],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
    });
    mapRef.current = map;

    const draw = new MapboxDraw({
      // displayControlsDefault: false,
      controls: {},
      userProperties: true,
      styles: drawStyles,

    });
    map.addControl(draw as any);
    drawRef.current = draw;
    map.on("draw.create", (e) => {
      const { activeLayerId, addFeatureToLayer, layers: allLayers } =
        useMapStore.getState();

      if (!activeLayerId) {
        alert("Please create and select a layer first.");
        draw.deleteAll();
        return;
      }
      const feature = e.features?.[0];
      if (!feature) return;

      // inject the layer's current color
      const layer = allLayers.find((l) => l.id === activeLayerId)!;
      feature.properties = {
        ...feature.properties,
        user_color: layer.color
      };

      // add feature to the active layer
      addFeatureToLayer(activeLayerId, feature);
      draw.deleteAll(); // clear the sketch from the draw canvas
    });

    return () => {
      map.remove();
    };
  }, []);

   useEffect(() => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();

    const visibleFeatures = layers
      .filter((l) => l.visible)
      .flatMap((l) =>
        (l.features || []).map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            user_color: l.color // Use user_color instead of color for consistency
          }
        }))
      );

    if (visibleFeatures.length) {
      drawRef.current.add({
        type: "FeatureCollection",
        features: visibleFeatures
      });
    }
  }, [layers]);




  return (
    <div className="relative h-screen w-full">
      <div id="map" className="h-full w-full" />

      {/* Search UI */}
      <form
        onSubmit={handleSearchSubmit}
        className="absolute left-1/2 -translate-x-1/2 top-4 z-20 bg-white p-2 rounded shadow-md"
      >
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Maharashtra or any district..."
            className="px-3 py-1 border rounded"
          />
          <button type="submit" className="px-3 py-1 border rounded">
            Search
          </button>
        </div>
        {loadingSearch && <div className="text-sm mt-1">Searching…</div>}
        {results.length > 0 && (
          <ul className="mt-1 max-h-40 overflow-auto text-sm">
            {results.map((r, i) => (
              <li
                key={i}
                className="cursor-pointer hover:bg-slate-100 p-1"
                onClick={() => handleSelectResult(r)}
              >
                <div className="font-medium">{r.display_name}</div>
                <div className="text-xs text-slate-500">
                  {r.class} / {r.type}
                </div>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Drawing & Export buttons */}
      <button
        className="absolute top-4 left-4 bg-white border px-4 py-2 shadow-md z-10"
        onClick={() => drawRef.current?.changeMode("draw_polygon")}
      >
        ✍️ Draw Polygon
      </button>

      <Button
        onClick={handleExport}
        className="absolute top-4 right-4 border px-4 py-2 shadow-md z-10"
      >
        Export Map to PDF
      </Button>

      <Button
        onClick={exportActiveLayerToPDF}
        className="absolute top-20 right-4 border px-4 py-2 shadow-md z-10"
      >
        Export Active Layer to PDF
      </Button>
    </div>
  );
};
