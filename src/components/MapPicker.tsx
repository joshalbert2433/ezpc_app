'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: any) => void;
}

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Reverse geocoding using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'EZPC-App' } }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const formattedAddress = {
          street: addr.road || addr.suburb || addr.neighbourhood || addr.amenity || addr.building || '',
          city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
          state: addr.state || addr.region || '',
          zipCode: addr.postcode || '',
        };
        
        onLocationSelect(lat, lng, formattedAddress);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-[var(--card-border)] shadow-inner">
      <MapContainer 
        center={[14.5995, 120.9842]} // Default center: Manila
        zoom={12} 
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={handleLocationSelect} />
      </MapContainer>
      
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest bg-dark/50 px-2 py-1 rounded">Updating Coordinates...</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-cyan-500 text-black text-[8px] font-black px-2 py-1 rounded shadow-lg z-10 uppercase tracking-widest border border-cyan-400/50">
        Live Targeting
      </div>

      <div className="absolute bottom-4 left-4 right-4 bg-[var(--card)]/90 backdrop-blur-md p-2 rounded-xl border border-[var(--card-border)] z-10 shadow-xl">
        <p className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest text-center opacity-80">
          Click map to adjust pin. Fields will auto-populate below.
        </p>
      </div>
    </div>
  );
}
