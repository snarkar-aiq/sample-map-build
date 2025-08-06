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
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('map.pdf');
  };
  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
      center: [72.8777, 19.076],
      zoom: 10,
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
      styles: drawStyles
    });
    drawRef.current = draw;
    map.addControl(draw as any);

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
      <Button onClick={handleExport} className="absolute top-4 right-4 bg-white border px-4 py-2 shadow-md z-10 cursor-pointer text-black">
        Export Map to PDF
      </Button>
    </div>
  );
};