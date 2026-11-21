import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Custom modern SVG icons that always render reliably
const targetIcon = L.divIcon({
  className: 'custom-target-marker',
  html: `<div style="background-color: #00A87A; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,168,122,0.45);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #2563EB; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 0 6px rgba(37,99,235,0.25);"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Fit Bounds Component
function ChangeView({ 
  userLoc, 
  groupLoc 
}: { 
  userLoc: { lat: number; lng: number } | null; 
  groupLoc: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (userLoc && groupLoc) {
      const bounds = L.latLngBounds([
        [userLoc.lat, userLoc.lng],
        [groupLoc.lat, groupLoc.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (userLoc) {
      map.flyTo([userLoc.lat, userLoc.lng], 16);
    } else if (groupLoc) {
      map.setView([groupLoc.lat, groupLoc.lng], 15);
    }
  }, [userLoc, groupLoc, map]);

  return null;
}

interface SubmissionMapProps {
  userLocation: { lat: number; lng: number } | null;
  groupLocation: { lat: number; lng: number } | null;
  radius?: number; // radius in meters
  targetName?: string;
}

export const SubmissionMap = ({ 
  userLocation, 
  groupLocation, 
  radius = 500,
  targetName 
}: SubmissionMapProps) => {
  const { t } = useTranslation();
  const defaultCenter = { lat: 41.2995, lng: 69.2401 };
  const center = groupLocation || userLocation || defaultCenter;

  return (
    <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-slate-200 relative z-0 shadow-sm bg-slate-50">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {groupLocation && (
          <>
            <Marker position={[groupLocation.lat, groupLocation.lng]} icon={targetIcon}>
              <Popup>
                <div className="text-xs font-semibold">
                  {targetName || t('map.target_location', 'Belgilangan amaliyot maydoni')}
                  <br />
                  <span className="text-slate-500 font-normal">Ruxsat doirasi: {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}</span>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[groupLocation.lat, groupLocation.lng]} 
              radius={radius} 
              pathOptions={{ 
                color: '#00A87A', 
                fillColor: '#00A87A', 
                fillOpacity: 0.15,
                weight: 2
              }} 
            />
          </>
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={100}>
            <Popup>
              <div className="text-xs font-semibold text-blue-600">
                {t('map.current_location', 'Sizning joylashuvingiz')}
              </div>
            </Popup>
          </Marker>
        )}

        <ChangeView userLoc={userLocation} groupLoc={groupLocation} />
      </MapContainer>
    </div>
  );
};
