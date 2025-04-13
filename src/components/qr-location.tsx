﻿import { useState, useEffect } from "react";
import axios from "axios";
import { QRControlType } from "@/types/qr-controls";

interface LocationResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

interface LocationSaveData {
  controlType: string;
  lat: string | number;
  lng: string | number;
  name?: string;
  address?: string;
  isManual: boolean;
}

export default function QRLocation({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [manualCoords, setManualCoords] = useState({
    lat: initialData?.isManual ? String(initialData.lat) || "" : "",
    lng: initialData?.isManual ? String(initialData.lng) || "" : "",
  });
  const [useManualCoords, setUseManualCoords] = useState(
    initialData?.isManual || false,
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      // Set up based on whether it's manual coordinates or a selected location
      if (initialData.isManual) {
        setUseManualCoords(true);
        setManualCoords({
          lat: String(initialData.lat) || "",
          lng: String(initialData.lng) || "",
        });
      } else if (initialData.name && initialData.lat && initialData.lng) {
        // Create a synthetic location result from the saved data
        setSelectedLocation({
          name: initialData.name,
          address: initialData.address || "",
          lat: Number(initialData.lat),
          lng: Number(initialData.lng),
          place_id:
            initialData.place_id || `${initialData.lat}-${initialData.lng}`,
        });
      }

      setIsInitialized(true);

      // Update parent value with initial data
      setTimeout(updateParentValue, 0);
    }
  }, [initialData, isInitialized]);

  // Update parent with location data
  const updateParentValue = () => {
    if (useManualCoords && manualCoords.lat && manualCoords.lng) {
      const geoUri = `geo:${manualCoords.lat},${manualCoords.lng}`;
      setText(geoUri);
      setChanged(true);

      // Add save data for manual coordinates
      if (setSaveData) {
        const saveData: LocationSaveData = {
          controlType: "location",
          lat: manualCoords.lat,
          lng: manualCoords.lng,
          isManual: true,
        };
        setSaveData(saveData);
      }
    } else if (selectedLocation) {
      const encodedName = encodeURIComponent(selectedLocation.name);
      const geoUri = `geo:${selectedLocation.lat},${selectedLocation.lng}?q=${encodedName}`;
      setText(geoUri);
      setChanged(true);

      // Add save data for selected location
      if (setSaveData) {
        const saveData: LocationSaveData = {
          controlType: "location",
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          name: selectedLocation.name,
          address: selectedLocation.address,
          isManual: false,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) {
        setSaveData(null);
      }
    }
  };

  // Search for locations using Google Places API
  const searchLocations = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);

    try {
      const response = await axios.get("/api/location-search", {
        params: { query: searchTerm },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.data && Array.isArray(response.data.results)) {
        if (response.data.results.length === 0) {
          setSearchError(
            "No locations found. Try a different search term or check your API key configuration.",
          );
        } else {
          setSearchResults(response.data.results);
        }
      } else {
        console.warn("Unexpected response format:", response.data);
        setSearchError("Received an invalid response format from the server");
      }
    } catch (error) {
      console.error("Error searching locations:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error("API Error:", { status, data: errorData });

        if (status === 405) {
          console.error(
            "API endpoint method not allowed. Check if your API route is correctly implemented.",
          );
        } else {
          console.error(
            errorData?.error ||
              `Failed to search locations (Status: ${status || "unknown"})`,
          );
        }
      } else {
        setSearchError("An unexpected error occurred");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Select a location from search results
  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setUseManualCoords(false);
    setSearchResults([]);
    setHasSearched(false); // Reset search state when location is selected
  };

  // Handle manual coordinate input
  const handleManualCoordsChange = (field: "lat" | "lng", value: string) => {
    // Allow only numeric input with decimals and minus sign
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setManualCoords((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Update parent when selection changes
  useEffect(() => {
    updateParentValue();
  }, [selectedLocation, useManualCoords, manualCoords.lat, manualCoords.lng]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchLocations();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-2">
        <button
          type="button"
          className={`px-3 py-1 text-sm rounded ${
            !useManualCoords
              ? "bg-qrmory-purple-800 text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
          onClick={() => setUseManualCoords(false)}
        >
          Search Location
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-sm rounded ${
            useManualCoords
              ? "bg-qrmory-purple-800 text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
          onClick={() => setUseManualCoords(true)}
        >
          Enter Coordinates
        </button>
      </div>

      {!useManualCoords ? (
        <>
          <div className="relative">
            <label className="control-label block">
              Search for a Location:
              <div className="flex mt-1">
                <input
                  type="text"
                  className="control-input w-full"
                  placeholder="Enter a location name, address, or landmark"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="button"
                  className="ml-2 px-4 py-2 bg-qrmory-purple-800 text-white rounded hover:bg-qrmory-purple-700 disabled:bg-qrmory-purple-300"
                  onClick={searchLocations}
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </label>

            {/* Error message */}
            {searchError && (
              <div className="mt-2 p-2 text-sm text-rose-600 bg-rose-50 rounded-md">
                {searchError}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-md overflow-hidden shadow-md">
                <ul className="max-h-64 overflow-y-auto divide-y">
                  {searchResults.map((location) => (
                    <li
                      key={location.place_id}
                      className="p-3 hover:bg-neutral-100 cursor-pointer"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-neutral-600">
                        {location.address}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No results message - only show after a search attempt returns no results */}
            {!isSearching &&
              searchTerm &&
              searchResults.length === 0 &&
              !searchError &&
              !selectedLocation &&
              hasSearched && (
                <div className="mt-2 p-2 text-sm text-neutral-600 bg-neutral-50 rounded-md">
                  No locations found for "{searchTerm}". Try a different search
                  term.
                </div>
              )}
          </div>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="mt-4 p-3 bg-neutral-50 rounded-md border">
              <div className="font-medium">Selected Location:</div>
              <div className="text-sm">{selectedLocation.name}</div>
              <div className="text-sm text-neutral-600">
                {selectedLocation.address}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </div>
              <button
                type="button"
                className="mt-2 text-sm text-qrmory-purple-800 hover:underline"
                onClick={() => {
                  setSelectedLocation(null);
                  setHasSearched(false); // Reset search state when changing location
                }}
              >
                Change Location
              </button>
            </div>
          )}
        </>
      ) : (
        <div>
          <label className="control-label block">
            Enter Latitude:
            <input
              type="text"
              className="control-input w-full mt-1"
              placeholder="e.g. 37.7749"
              value={manualCoords.lat}
              onChange={(e) => handleManualCoordsChange("lat", e.target.value)}
            />
          </label>

          <label className="control-label block mt-3">
            Enter Longitude:
            <input
              type="text"
              className="control-input w-full mt-1"
              placeholder="e.g. -122.4194"
              value={manualCoords.lng}
              onChange={(e) => handleManualCoordsChange("lng", e.target.value)}
            />
          </label>

          {manualCoords.lat && manualCoords.lng && (
            <div className="mt-4 p-3 bg-neutral-50 rounded-md border">
              <div className="font-medium">Custom Location:</div>
              <div className="text-sm text-neutral-600 mt-1">
                Coordinates: {manualCoords.lat}, {manualCoords.lng}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-neutral-500 mt-4">
        When scanned, this QR code will open the location in the user's default
        maps app.
        <br />
        Make sure the coordinates are accurate for the best user experience.
      </div>
    </div>
  );
}
