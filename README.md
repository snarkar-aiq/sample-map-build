# 🗺️ Map Layer Manager App

A simple web application to manage polygon layers on an interactive MapTiler basemap, built using **Maplibre + MapTiler SDK**, **Zustand** for state management, and **Axios** for future API integration.

---

## 🚀 Features

- ✅ Interactive base map using MapTiler SDK  
- ✍️ Draw polygons directly on the map  
- 📚 Create multiple layers to group shapes  
- 👁️ Toggle visibility of individual layers  
- ⚙️ Global state management with Zustand  
- 🔗 Axios setup for future backend integration  

---

## 🛠️ Tech Stack

- [React](https://reactjs.org/)
- [Maptiler SDK](https://www.maptiler.com/maps/sdk/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Maplibre GL](https://maplibre.org/)
- [MapBox Draw](https://github.com/mapbox/mapbox-gl-draw)

---

## 📦 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/snarkar-aiq/sample-map-build.git
cd map-layer-manager
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Add MapTiler API key

Create a `.env` file:

```
VITE_MAPTILER_API_KEY=your_maptiler_api_key
```

### 4. Run the app

```bash
npm run dev
# or
yarn dev
```

---

## 📁 Project Structure

```bash
/src
│
├── components/
|   ├── ui (Consists of ShadCN components.)
│   ├── MapView.tsx         # Maptiler map with draw tool
│
├── store/
│   └── useMapStore.ts      # Zustand store for map layers
│
├── lib/
    └── utils.ts
│
├── App.tsx                 # Main app with layer manager and map
└── index.tsx               # Entry point
```

