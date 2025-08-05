import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useMapStore } from "@/store/useMapStore";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

export const MapView: React.FC = () => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const { activeLayerId, layers, addFeatureToLayer } = useMapStore();

  // 🗺️ Initialize map and drawing once
  useEffect(() => {
    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: "map",
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: [72.8777, 19.076],
        zoom: 10,
      });

      mapRef.current = map;

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {}, // no default buttons
      });

      drawRef.current = draw;
      map.addControl(draw as any);

      map.on('draw.create', (e) => {
  if (!activeLayerId) {
    alert('Please create and select a layer first.');
    drawRef.current?.deleteAll();
    return;
  }

  const feature = e.features?.[0];

  if (!feature || !feature.geometry || !feature.geometry.type) {
    console.error('Invalid feature drawn:', feature);
    return;
  }

  addFeatureToLayer(activeLayerId, feature);
});

    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [activeLayerId, addFeatureToLayer]);

  // 👁️ Render only visible layers' features
  useEffect(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      console.log(layers.filter((layer) => layer.visible).flatMap((layer) => layer.features).flat());
      // Clear existing features
      // Add features from visible
      const featureCollection: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: [layers.filter((layer) => layer.visible).flatMap((layer) => layer.features)].flat() // Flatten the array of features,
        };
      layers
        .filter((layer) => layer.visible)
        .forEach((layer) => {
          if (layer.features && layer.features.length > 0) {
            drawRef.current!.add(featureCollection);
          }
        });
    }
  }, [layers]);

  return (
    <div className="relative h-screen w-full">
      <div id="map" className="h-full w-full" />
      <button
        className="absolute top-4 left-4 bg-white border px-4 py-2 shadow-md z-10"
        onClick={() => drawRef.current?.changeMode("draw_polygon")}
      >
        ✍️ Draw Polygon
      </button>
    </div>
  );
};
