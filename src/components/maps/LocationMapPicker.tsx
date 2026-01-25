import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Crosshair, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const { t, i18n } = useTranslation();
  const [position, setPosition] = useState<LatLng>(new LatLng(initialLat, initialLng));
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<any>(null);

  // Reverse geocoding using Photon (Komoot) - provides better street-level accuracy and is CORS friendly
  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoading(true);
    
    // Clear existing timer if any (debounce)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          
          // Construct explicit address parts
          const addressParts = [
            props.name,
            props.housenumber,
            props.street,
            props.district,
            props.city,
            props.country
          ].filter(Boolean); // Remove null/undefined/empty strings

          // Remove duplicates and join
          const uniqueParts = [...new Set(addressParts)];
          const formattedAddress = uniqueParts.length > 0 
            ? uniqueParts.join(', ') 
            : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          setAddress(formattedAddress);
          onLocationChange(lat, lng, formattedAddress);
        } else {
          // Fallback if no features found
          const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddress(fallbackAddress);
          onLocationChange(lat, lng, fallbackAddress);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onLocationChange(lat, lng, fallbackAddress);
      } finally {
        setIsLoading(false);
      }
    }, 800); // 800ms delay to wait for user to stop moving map
  };

  useEffect(() => {
    getAddressFromCoords(initialLat, initialLng);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapMove = (lat: number, lng: number) => {
    setPosition(new LatLng(lat, lng));
    getAddressFromCoords(lat, lng);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Photon for search (CORS friendly, based on OSM)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates; // Photon returns [lng, lat]
        
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 16);
          // Manually trigger update since flyTo might not trigger moveend immediately in all cases
          // or we want immediate feedback
          setPosition(new LatLng(lat, lng));
          getAddressFromCoords(lat, lng);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 16);
          }
          setIsSearching(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsSearching(false);
          // Toast or helper text could be added here
        }
      );
    }
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

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('groups.search_location')}
              className="pl-9 bg-white/90 backdrop-blur-md border-zinc-200 shadow-lg h-10 rounded-xl text-zinc-900 placeholder:text-zinc-500"
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            disabled={isSearching}
            className="h-10 w-10 bg-white/90 backdrop-blur-md border border-zinc-200 shadow-lg hover:bg-zinc-50 text-zinc-700 rounded-xl shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={handleLocateMe}
            className="h-10 w-10 bg-white/90 backdrop-blur-md border border-zinc-200 shadow-lg hover:bg-zinc-50 text-blue-600 rounded-xl shrink-0"
            title={t('groups.my_location')}
          >
             <Crosshair className="w-4 h-4" />
          </Button>
        </form>
      </div>

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
                {t('groups.current_selection')}
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-zinc-600">{t('groups.loading_address')}</span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-zinc-900 line-clamp-2">
                  {address || '...'}
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
