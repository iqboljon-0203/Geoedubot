import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Fit Bounds Component
function ChangeView({ userLoc, groupLoc }: { userLoc: { lat: number, lng: number } | null, groupLoc: { lat: number, lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (userLoc && groupLoc) {
            const bounds = L.latLngBounds([userLoc, groupLoc]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (userLoc) {
             map.flyTo(userLoc, 16);
        } else if (groupLoc) {
             map.setView(groupLoc, 15);
        }
    }, [userLoc, groupLoc, map]);
    return null;
}

interface SubmissionMapProps {
    userLocation: { lat: number; lng: number } | null;
    groupLocation: { lat: number; lng: number } | null;
}

export const SubmissionMap = ({ userLocation, groupLocation }: SubmissionMapProps) => {
    const { t } = useTranslation();
    // Default center (Tashkent) if nothing provided
    const defaultCenter = { lat: 41.2995, lng: 69.2401 };
    const center = groupLocation || userLocation || defaultCenter;

    return (
        <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-border mt-4 relative z-0 shadow-sm">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                 <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {groupLocation && (
                    <>
                        <Marker position={groupLocation}>
                            <Popup>{t('map.target_location')}</Popup>
                        </Marker>
                        <Circle 
                            center={groupLocation} 
                            radius={100} 
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} 
                        />
                    </>
                )}

                {userLocation && (
                    <Marker position={userLocation} zIndexOffset={100}>
                        <Popup>{t('map.current_location')}</Popup>
                    </Marker>
                )}

                <ChangeView userLoc={userLocation} groupLoc={groupLocation} />
            </MapContainer>
        </div>
    );
};
