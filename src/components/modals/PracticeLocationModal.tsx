import { useState, useEffect } from "react";
import { AdaptiveDrawer } from "@/components/ui/AdaptiveDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationMapPicker } from "@/components/maps/LocationMapPicker";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  CheckCircle2, 
  Loader2, 
  Info 
} from "lucide-react";

interface PracticeLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  userId: string;
  initialData?: {
    school_name?: string | null;
    practice_lat?: number | null;
    practice_lng?: number | null;
    practice_address?: string | null;
  } | null;
  onSaved: (data: {
    school_name: string;
    practice_lat: number;
    practice_lng: number;
    practice_address: string;
  }) => void;
}

export function PracticeLocationModal({
  isOpen,
  onClose,
  groupId,
  userId,
  initialData,
  onSaved,
}: PracticeLocationModalProps) {
  const [schoolName, setSchoolName] = useState(initialData?.school_name || "");
  const [lat, setLat] = useState<number | null>(initialData?.practice_lat || null);
  const [lng, setLng] = useState<number | null>(initialData?.practice_lng || null);
  const [address, setAddress] = useState(initialData?.practice_address || "");
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSchoolName(initialData?.school_name || "");
      setLat(initialData?.practice_lat || null);
      setLng(initialData?.practice_lng || null);
      setAddress(initialData?.practice_address || "");
      setShowMap(false);
    }
  }, [isOpen, initialData]);

  // Telefon GPS orqali hozirgi nuqtani olish
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Qurilmangizda geolokatsiya qo'llab-quvvatlanmaydi.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const curLat = pos.coords.latitude;
        const curLng = pos.coords.longitude;
        setLat(curLat);
        setLng(curLng);

        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lon=${curLng}&lat=${curLat}`);
          const data = await res.json();
          if (data?.features?.[0]?.properties) {
            const p = data.features[0].properties;
            const parts = [p.name, p.street, p.district, p.city].filter(Boolean);
            const foundAddr = parts.length > 0 ? parts.join(", ") : `${curLat.toFixed(5)}, ${curLng.toFixed(5)}`;
            setAddress(foundAddr);
          } else {
            setAddress(`${curLat.toFixed(5)}, ${curLng.toFixed(5)}`);
          }
        } catch {
          setAddress(`${curLat.toFixed(5)}, ${curLng.toFixed(5)}`);
        } finally {
          setIsLocating(false);
          toast.success("Hozirgi GPS joylashuvingiz olindi!");
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("GPS error:", err);
        toast.error("GPS joylashuvni olib bo'lmadi. Geolokatsiya ruxsatini yoqing yoki xaritadan tanlang.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleMapLocationChange = (newLat: number, newLng: number, newAddress: string) => {
    setLat(newLat);
    setLng(newLng);
    setAddress(newAddress);
  };

  const handleSave = async () => {
    if (!schoolName.trim()) {
      toast.error("Iltimos, amaliyot maktabingiz yoki muassasa nomini kiriting.");
      return;
    }
    if (lat === null || lng === null) {
      toast.error("Iltimos, maktab joylashuvini GPS orqali yoki xaritadan belgilang.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("group_members")
        .update({
          school_name: schoolName.trim(),
          practice_lat: lat,
          practice_lng: lng,
          practice_address: address.trim() || null,
        })
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) {
        console.error("Save practice location error:", error);
        toast.error("Saqlashda xatolik yuz berdi: " + error.message);
        return;
      }

      toast.success("Amaliyot maktabi muvaffaqiyatli biriktirildi!");
      onSaved({
        school_name: schoolName.trim(),
        practice_lat: lat,
        practice_lng: lng,
        practice_address: address,
      });
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Saqlab bo'lmadi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdaptiveDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Amaliyot maktabini biriktirish"
    >
      <div className="space-y-5 font-['Outfit']">
        {/* Info Box */}
        <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-3.5 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-emerald-900 leading-relaxed">
            Dual ta'limda har bir talaba o'z tumanidagi maktabda amaliyot o'taydi. Maktabingizni bir marta belgilang, 
            keyingi amaliyot vazifalarini shu maktab hududidan topshirasiz.
          </p>
        </div>

        {/* School Name Input */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Maktab yoki tashkilot nomi <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Masalan: Pastdarg'om tumani 14-sonli maktab"
              className="pl-10 h-12 rounded-xl text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Location Selection Method Buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Maktab joylashuvini belgilash <span className="text-red-500">*</span>
          </Label>
          
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="h-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Navigation className="w-4 h-4 text-emerald-600" />
              )}
              <span>Hozirgi joyim (GPS)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className={`h-12 rounded-xl border-slate-200 font-semibold text-xs gap-1.5 active:scale-95 transition-all shadow-sm ${
                showMap ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <MapIcon className="w-4 h-4 text-blue-600" />
              <span>{showMap ? "Xaritani yopish" : "Xaritadan tanlash"}</span>
            </Button>
          </div>
        </div>

        {/* Map Picker if toggled */}
        {showMap && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-1 bg-slate-50">
            <p className="text-[11px] text-slate-500 px-3 py-1.5 font-medium">
              💡 Xaritani siljitib, nishonni maktab binosi ustiga keltiring:
            </p>
            <div className="h-[280px]">
              <LocationMapPicker
                initialLat={lat || 41.2995}
                initialLng={lng || 69.2401}
                onLocationChange={handleMapLocationChange}
              />
            </div>
          </div>
        )}

        {/* Selected Coordinates & Address Card */}
        {lat !== null && lng !== null && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Joylashuv belgilandi</span>
            </div>
            {address && (
              <p className="text-xs text-slate-700 font-medium leading-snug">
                📍 {address}
              </p>
            )}
            <p className="text-[11px] text-slate-400 font-mono">
              Koordinatalar: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !schoolName.trim() || lat === null}
            className="w-full h-12 rounded-2xl bg-[#00A87A] hover:bg-[#009169] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saqlanmoqda...
              </div>
            ) : (
              "Amaliyot maktabini saqlash"
            )}
          </Button>
        </div>
      </div>
    </AdaptiveDrawer>
  );
}
