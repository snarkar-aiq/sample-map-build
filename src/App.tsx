
import { useState } from "react";
import { MapView } from "./components/MapView";
import { useMapStore } from "./store/useMapStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  const { layers, addLayer, setActiveLayer, toggleLayer, activeLayerId, removeLayer } = useMapStore();
  const [layerName, setLayerName] = useState("");

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-72 p-4 bg-muted border-r space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              placeholder="New Layer Name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && layerName.trim()) {
                  addLayer(layerName);
                  setLayerName("");
                }

              }}

            />
            <Button
              onClick={() => {
                if (layerName.trim()) {
                  addLayer(layerName);
                  setLayerName("");
                }
              }}
              className="w-full font-bold"
            >
              Add Layer
            </Button>

            <ScrollArea className="h-64 pr-2">
              <div className="space-y-2">
                {layers.map((layer) => (
                  <>
                    <div
                      key={layer.id}
                      className={`flex items-center justify-between px-2 py-1 rounded hover:bg-accent cursor-pointer transition-colors ${layer.id === activeLayerId ? "bg-accent font-semibold" : ""
                        }`}
                      onClick={() => setActiveLayer(layer.id)}
                    >
                      <span>{layer.name}</span>
                      <div className="flex items-center">

                        <Checkbox
                          checked={layer.visible}
                          onCheckedChange={() => toggleLayer(layer.id)}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => removeLayer(layer.id)}
                          className="ml-2"
                        >
                         🗑
                        </Button>
                      </div>
                    </div>

                  </>
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
