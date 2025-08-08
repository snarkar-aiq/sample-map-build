import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useMapStore } from "@/store/useMapStore";
import jsPDF from "jspdf";
import { Button } from "./ui/button";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

export const MapView: React.FC = () => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // get layers from Zustand
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


  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
      center: [72.8777, 19.076],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
    });
    mapRef.current = map;


    // --- custom draw styles with dynamic colors ----
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

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      userProperties: true,
      styles: drawStyles,

    });
    drawRef.current = draw;
    map.addControl(draw as any);
    // map.on('load', function () {
    //   // Insert the layer beneath any symbol layer.
    //   const layers = map.getStyle().layers;

    //   let labelLayerId;
    //   for (let i = 0; i < layers.length; i++) {
    //     if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
    //       labelLayerId = layers[i].id;
    //       break;
    //     }
    //   }

    //   map.addLayer(
    //     {
    //       "id": "3d-buildings",
    //       "source": "openmaptiles",
    //       "source-layer": "building",
    //       "type": "fill-extrusion",
    //       "paint": {
    //         "fill-extrusion-color": [
    //           "interpolate",
    //           ["linear"],
    //           ["get", "render_height"],
    //           0,
    //           "#de8500ff",
    //           200,
    //           "#de0000ff",
    //           400,
    //           "#ff7772ff",
    //         ],
    //         "fill-extrusion-height": [
    //           "interpolate",
    //           ["linear"],
    //           ["zoom"],
    //           15,
    //           0,
    //           16,
    //           ["get", "render_height"],
    //         ],
    //         "fill-extrusion-base": [
    //           "case",
    //           [">=", ["get", "zoom"], 1240],
    //           ["get", "render_min_height"],
    //           0,
    //         ],
    //       },
    //     },
    //     labelLayerId
    //   );
    // });


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
  let cnt = 0;
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
          id: `gee-layer-${cnt++}`,
          type: 'raster',
          source: 'gee-layer',
          paint: { 'raster-opacity': 0.6 }
        });
      });
  }, []);


  // whenever the layer list changes, re-draw all visible features
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
      <button
        className="absolute top-4 left-4 bg-white border px-4 py-2 shadow-md z-10 cursor-pointer"
        onClick={() => drawRef.current?.changeMode("draw_polygon")}

      >
        ✍️ Draw Polygon
      </button>
      <Button onClick={handleExport} className="absolute top-4 right-4 border px-4 py-2 shadow-md z-10 cursor-pointer ">
        Export Map to PDF
      </Button>

      <Button
        onClick={exportActiveLayerToPDF}
        className="absolute top-20 right-4 border px-4 py-2 shadow-md z-10 cursor-pointer"
      >
        Export Active Layer to PDF
      </Button>

    </div>
  );
};

