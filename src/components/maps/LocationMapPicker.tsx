import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

// Component to handle map events
function MapEventHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onLocationChange(center.lat, center.lng);
    },
  });

  return null;
}

export const LocationMapPicker = ({
  initialLat = 41.2995,
  initialLng = 69.2401,
  onLocationChange,
}: LocationMapPickerProps) => {
  const [position, setPosition] = useState<LatLng>(new LatLng(initialLat, initialLng));
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<any>(null);

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const formattedAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(formattedAddress);
      onLocationChange(lat, lng, formattedAddress);
    } catch (error) {
      console.error('Geocoding error:', error);
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      onLocationChange(lat, lng, fallbackAddress);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAddressFromCoords(initialLat, initialLng);
  }, []);

  const handleMapMove = (lat: number, lng: number) => {
    setPosition(new LatLng(lat, lng));
    getAddressFromCoords(lat, lng);
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={13}
        className="w-full h-full rounded-2xl"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler onLocationChange={handleMapMove} />
      </MapContainer>

      {/* Center Pin Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none">
        <div className="relative">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <MapPin className="w-6 h-6 text-white" fill="white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-30" />
        </div>
      </div>

      {/* Address Display */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-zinc-200/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                CURRENT SELECTION
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-zinc-600">Loading address...</span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-zinc-900 line-clamp-2">
                  {address || '14 Amir Temur Avenue'}
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapPicker;
