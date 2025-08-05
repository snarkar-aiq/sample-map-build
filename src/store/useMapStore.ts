// /src/store/useMapStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  features: GeoJSON.Feature[];
}

interface MapState {
  layers: Layer[];
  activeLayerId: string | null;
  setActiveLayer: (id: string) => void;
  addLayer: (name: string) => void;
  toggleLayer: (id: string) => void;
  addFeatureToLayer: (layerId: string, feature: GeoJSON.Feature) => void;
  removeLayer: (id: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  layers: [],
  activeLayerId: null,
  setActiveLayer: (id) => set({ activeLayerId: id }),
  addLayer: (name) =>
    set((state) => {
      const newLayer: Layer = {
        id: uuidv4(),
        name,
        visible: true,
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
  addFeatureToLayer: (id, feature) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id
          ? { ...layer, features: [...layer.features, feature] }
          : layer
      ),
    })),
  removeLayer: (id: string) => {
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      activeLayerId: state.activeLayerId === id ? null : state.activeLayerId
    }));
  }

}));
