// src/App.tsx
import { useState } from "react";
import { MapView } from "./components/MapView";
import { useMapStore } from "./store/useMapStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  const {
    layers,
    addLayer,
    setActiveLayer,
    toggleLayer,
    activeLayerId,
    removeLayer,
    setLayerColor,
  } = useMapStore();

  const [layerName, setLayerName] = useState("");
  const [newLayerColor, setNewLayerColor] = useState("#a0aec0");

  const handleAdd = () => {
    if (!layerName.trim()) return;
    // pass color into addLayer
    addLayer(layerName.trim(), newLayerColor);
    setLayerName("");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-72 p-4 bg-muted border-r space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
                placeholder="New Layer Name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <input
                type="color"
                value={newLayerColor}
                onChange={(e) => setNewLayerColor(e.target.value)}
                title="Choose layer color"
                className="w-10 h-10 p-0 border rounded"
              />
            </div>

            <Button onClick={handleAdd} className="w-full font-bold">
              Add Layer
            </Button>

            <ScrollArea className="h-64 pr-2">
              <div className="space-y-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center justify-between px-2 py-1 rounded hover:bg-accent cursor-pointer transition-colors ${
                      layer.id === activeLayerId ? "bg-accent font-semibold" : ""
                    }`}
                    onClick={() => setActiveLayer(layer.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {/* Inline color picker for updating layer color */}
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => setLayerColor(layer.id, e.target.value)}
                        title="Edit layer color"
                        className="w-6 h-6 p-0 border rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>{layer.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={layer.visible}
                        onCheckedChange={() => toggleLayer(layer.id)}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(layer.id);
                        }}
                        className="ml-2"
                      >
                        🗑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <MapView />
      </div>
    </div>
  );
}

export default App;
