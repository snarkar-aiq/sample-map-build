# fastapi_gee_tiles.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import ee
from google.oauth2 import service_account
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-production-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration (use env vars in production)
GEE_PROJECT = os.getenv("GEE_PROJECT", "soy-bridge-468406-s0")

def initialize_ee():
    """
    Initialize Earth Engine. Prefer service account if provided, otherwise fall back
    to Application Default Credentials (ADC).
    """
    try:
        # If EE already initialized, return early
        # (ee.Initialize raises if not initialized; this is a safe guard)
        ee_api_info = ee.data.getAssetRoots()  # quick call to check connectivity
        logger.info("Earth Engine appears available (already initialized).")
        return
    except Exception:
        pass

    # Fall back to ADC — good for deployments where ADC is configured
    logger.info("Initializing Earth Engine with Application Default Credentials (ADC).")
    ee.Initialize(project=GEE_PROJECT)

# Initialize on module import (or you can call lazily)
try:
    initialize_ee()
except Exception as e:
    logger.exception("Failed to initialize Earth Engine: %s", e)
    # Don't raise here — endpoints will return an error describing the init failure.

@app.get("/gee-tiles")
def get_gee_tiles():
    """
    Returns a tile URL template for the JAXA ALOS AW3D30 DSM dataset.
    Example response:
    {
      "map_info": { "mapid": "...", "token": "..." },
      "tile_url": "https://earthengine.googleapis.com/map/<mapid>/{z}/{x}/{y}?token=<token>"
    }
    """
    try:
        # 1) Load the ImageCollection, convert to a single image, and select the DSM band
        collection = ee.ImageCollection("JAXA/ALOS/AW3D30/V4_1")
        # mosaic() merges tiles into one image; alternative: median(), first(), etc.
        image = collection.mosaic().select("DSM")

        # 2) Visualization parameters (single-band only)
        vis_params = {
            "min": 0,
            "max": 5000,
            # If you want a palette, ensure you're visualizing a single band (we are).
            "palette": ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff'],
        }

        # 3) Request mapid/token
        # Ensure we're passing an ee.Image (not an ImageCollection)
        map_info = ee.Image(image).getMapId(vis_params)
        logger.info("GEE map_info: %s", map_info)

        mapid = map_info.get("mapid")
        token = map_info.get("token", "")

        if not mapid:
            raise RuntimeError(f"No mapid returned from GEE. map_info={map_info}")

        # Handle possibly-empty token gracefully
        if token:
            tile_url = f"https://earthengine.googleapis.com/v1/{mapid}/tiles/{{z}}/{{x}}/{{y}}"

        else:
            # Some EE setups return an empty token — the mapid URL still works in that case
            tile_url = f"https://earthengine.googleapis.com/v1/{mapid}/tiles/{{z}}/{{x}}/{{y}}"

        return {"map_info": map_info, "tile_url": tile_url}

    except Exception as exc:
        logger.exception("Failed to build GEE tile URL: %s", exc)
        # Provide a helpful error message to the client
        raise HTTPException(status_code=500, detail=f"Failed to generate GEE tiles: {exc}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the GEE Tile Service!"}
