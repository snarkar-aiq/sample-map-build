// /src/store/useMapStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  features: GeoJSON.Feature[];
}

interface MapState {
  layers: Layer[];
  activeLayerId: string | null;
  setActiveLayer: (id: string) => void;
  addLayer: (name: string, color?: string) => void;
  toggleLayer: (id: string) => void;
  setLayerColor: (id: string, color: string) => void;
  addFeatureToLayer: (layerId: string, feature: GeoJSON.Feature) => void;
  removeLayer: (id: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
}

const randomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
};

export const useMapStore = create<MapState>((set, get) => ({
  layers: [],
  activeLayerId: null,

  setActiveLayer: (id) => set({ activeLayerId: id }),

  addLayer: (name, color) =>
    set((state) => {
      const newLayer: Layer = {
        id: uuidv4(),
        name,
        visible: true,
        color: color || randomColor(),
        features: [],
      };
      return {
        layers: [...state.layers, newLayer],
        activeLayerId: newLayer.id,
      };
    }),

  toggleLayer: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    })),

  setLayerColor: (id, color) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, color } : layer
      ),
    })),

  addFeatureToLayer: (id, feature) =>
    set((state) => {
      // find the layer to get its current color
      const layer = state.layers.find((l) => l.id === id);
      if (!layer) return { layers: state.layers };

      // inject color into feature properties
      const featureWithColor: GeoJSON.Feature = {
        ...feature,
        properties: {
          ...feature.properties,
          color: layer.color,
        },
      };

      return {
        layers: state.layers.map((l) =>
          l.id === id
            ? { ...l, features: [...l.features, featureWithColor] }
            : l
        ),
      };
    }),
  setLayerVisibility: (id:string, visible:boolean) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible } : layer
      ),
    })),

  removeLayer: (id: string) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      activeLayerId: state.activeLayerId === id ? null : state.activeLayerId,
    })),
}));
