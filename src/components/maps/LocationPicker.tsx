import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { lat: number; lng: number; address: string }) => void;
}

function MapEvents({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function LocationPicker({
  isOpen,
  onClose,
  onSelect,
}: LocationPickerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    // Reverse geocoding using Photon API (Komoot) - No CORS issues
    fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`)
      .then((res) => res.json())
      .then((data) => {
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          address = [
            props.name,
            props.street,
            props.housenumber,
            props.district,
            props.city,
            props.state,
            props.country
          ].filter(Boolean).join(", ");
        }

        const newLocation = {
          lat,
          lng,
          address,
        };
        setSelectedLocation(newLocation);
      })
      .catch(() => {
        // Fallback
        const newLocation = {
          lat,
          lng,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        };
        setSelectedLocation(newLocation);
      });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Xatolik",
        description: "Geolokatsiya qo'llab-quvvatlanmaydi",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude);
        setIsSearching(false);
      },
      (error) => {
        console.error(error);
        toast({
          title: "Xatolik",
          description: "Joylashuvni aniqlab bo'lmadi. Ruxsat berilganligini tekshiring.",
          variant: "destructive",
        });
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Xatolik",
        description: "Qidiruv so'rovini kiriting",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Using Photon API for search
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates; // GeoJSON is [lon, lat]
        const props = feature.properties;
        
        const address = [
            props.name,
            props.street,
            props.housenumber,
            props.district,
            props.city,
            props.state,
            props.country
        ].filter(Boolean).join(", ");

        const location = {
          lat,
          lng,
          address: address || searchQuery,
        };
        setSelectedLocation(location);
      } else {
        toast({
          title: "Xatolik",
          description: "Manzil topilmadi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Qidiruvda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manzilni tanlang</DialogTitle>
          <DialogDescription>
            Manzilni qidirish yoki xaritadan tanlash orqali guruh joylashuvini
            belgilang
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Manzilni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleCurrentLocation} variant="outline" title="Mening joylashuvim" disabled={isSearching}>
                <Locate className="w-4 h-4" />
            </Button>
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <MapContainer
              center={[40.7833, 72.3333]} // Andijon markazi
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedLocation && (
                <>
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                  />
                  <ChangeView
                    center={[selectedLocation.lat, selectedLocation.lng]}
                  />
                </>
              )}
              <MapEvents onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </div>

          {selectedLocation && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Tanlangan manzil:</p>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Koordinatalar: {selectedLocation.lat.toFixed(4)},{" "}
                {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={!selectedLocation}
          >
            Tanlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
