

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

  // Subscribe to Zustand store for layers
  const layers = useMapStore((state) => state.layers);

  // 🗺️ Initialize map and drawing once
  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
      center: [72.8777, 19.076],
      zoom: 10,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
    });
    drawRef.current = draw;
    map.addControl(draw as any);

    map.on('draw.create', (e) => {
      // Get fresh state inside handler
      const { activeLayerId, addFeatureToLayer } = useMapStore.getState();

      if (!activeLayerId) {
        alert('Please create and select a layer first.');
        drawRef.current?.deleteAll();
        return;
      }

      const feature = e.features?.[0];
      if (!feature || !feature.geometry?.type) {
        console.error('Invalid feature drawn:', feature);
        return;
      }

      addFeatureToLayer(activeLayerId, feature);
    });

    return () => {
      map.remove();
    };
  }, []);

  // 👁️ Render only visible layers' features
  useEffect(() => {
    if (!drawRef.current) return;

    drawRef.current.deleteAll();

    const visibleFeatures = layers
      .filter((layer) => layer.visible)
      .flatMap((layer) => layer.features || []);

    if (visibleFeatures.length) {
      drawRef.current.add({
        type: "FeatureCollection",
        features: visibleFeatures,
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
