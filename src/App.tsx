// // /src/App.tsx
// import React, { useState } from 'react';
// import { MapView } from './components/MapView';
// import { useMapStore } from './store/useMapStore';

// function App() {
//   const { layers, addLayer, setActiveLayer, toggleLayer, activeLayerId } = useMapStore();
//   const [layerName, setLayerName] = useState('');

//   return (
//     <div className="flex">
//       <div className="w-64 p-4 bg-gray-100 space-y-2">
//         <h2 className="font-bold text-lg">Layers</h2>
//         <input
//           type="text"
//           value={layerName}
//           onChange={(e) => setLayerName(e.target.value)}
//           placeholder="New Layer Name"
//           className="border px-2 py-1 w-full"
//         />
//         <button
//           className="bg-blue-500 text-white px-2 py-1 w-full"
//           onClick={() => {
//             if (layerName.trim()) {
//               addLayer(layerName);
//               setLayerName('');
//             }
//           }}
//         >
//           Add Layer
//         </button>

//         <ul>
//           {layers.map((layer) => (
//             <li key={layer.id} className="flex justify-between items-center py-1">
//               <button
//                 className={`text-left ${layer.id === activeLayerId ? 'font-bold text-blue-600' : ''
//                   }`}
//                 onClick={() => setActiveLayer(layer.id)}
//               >
//                 {layer.name}
//               </button>

//               <input
//                 type="checkbox"
//                 checked={layer.visible}
//                 onChange={() => toggleLayer(layer.id)}
//               />
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="flex-1">
//         <MapView />
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import { MapView } from "./components/MapView";
import { useMapStore } from "./store/useMapStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
            />
            <Button
              onClick={() => {
                if (layerName.trim()) {
                  addLayer(layerName);
                  setLayerName("");
                }
              }}
              className="w-full"
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
