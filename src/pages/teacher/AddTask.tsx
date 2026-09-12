import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, MapPin, BookOpen, Map, CheckCircle, Upload, Award, Users, Camera, ShieldCheck, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch"; // Assuming this exists, if not we'll use a simple HTML checkbox

export default function AddTask() {
  const { t } = useTranslation();
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "internship",
    deadline: "",
    groupId: "",
    radius: 1.5,
    mandatoryGeo: true
  });
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, students:group_members(count)")
        .eq("created_by", userId);
      if (!error && data) setGroups(data);
    };
    fetchGroups();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, radius: parseFloat(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.groupId) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type as "homework" | "internship",
      group_id: form.groupId,
      created_by: userId || "",
      deadline: form.deadline || null,
      radius: form.radius,
      mandatory_geo: form.mandatoryGeo
    };
    
    const { error } = await supabase.from("tasks").insert([payload]);
    if (error) {
      toast.error("Xatolik yuz berdi: " + error.message);
    } else {
      toast.success("Vazifa muvaffaqiyatli qo'shildi!");
      navigate("/teacher-dashboard/tasks");
    }
  };

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen font-['Outfit']">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Yangi topshiriq</h1>
              <p className="text-[11px] text-slate-500">Geo-amaliyot va dala tadqiqoti</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
            Qoralama
          </div>
        </div>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 max-w-xl mx-auto">
        
        {/* Tabs */}
        <div className="flex bg-blue-50/50 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, type: 'internship' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              form.type === 'internship' 
                ? 'bg-white text-[#00A87A] shadow-[0_2px_10px_rgb(0,0,0,0.05)]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Geo-amaliyot
          </button>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, type: 'homework' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              form.type === 'homework' 
                ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgb(0,0,0,0.05)]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Oddiy vazifa
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Topshiriq Nomi
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Amirsoy relyefi va balandlik profili tahlili"
            className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[15px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A87A]/20 focus:border-[#00A87A] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Topshiriq Ta'rifi va Yo'riqnoma
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ko'rsatilgan GPS nuqtasiga yetib boring, relyef qatlamlarini rasmga oling..."
              rows={4}
              className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A87A]/20 focus:border-[#00A87A] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all resize-none placeholder:text-slate-400"
            />
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              Joyida geo-tasdiqlash talab etiladi
            </div>
            <div className="absolute bottom-3 right-4 text-[11px] text-slate-400 font-medium">
              {form.description.length}/500
            </div>
          </div>
        </div>

        {/* Deadline & Group Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Muddat (Deadline)
            </label>
            <div className="relative">
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[14px] font-semibold text-slate-900 focus:outline-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] appearance-none"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Guruh
            </label>
            <div className="relative">
              <select
                name="groupId"
                value={form.groupId}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl text-[14px] font-semibold text-slate-900 focus:outline-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] appearance-none"
              >
                <option value="">Tanlang...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00A87A] pointer-events-none">
                <Users className="w-5 h-5" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Geo-fens Section */}
        {form.type === 'internship' && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E1F7EE] flex items-center justify-center">
                  <TargetIcon className="w-5 h-5 text-[#006C4A]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">Geo-fens (Geo-hudud) sozlamasi</h3>
                  <p className="text-[11px] text-slate-500">Qabul qilinadigan GPS tekshiruv maydoni</p>
                </div>
              </div>
              <div className="bg-[#E1F7EE] text-[#006C4A] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                CAN-GPS v2
              </div>
            </div>

            {/* Map Mockup */}
            <div className="relative w-full h-48 rounded-2xl bg-[#E6EFFF] overflow-hidden border border-slate-100 mb-5 flex items-center justify-center">
              {/* Fake Map Grid */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#005FB8 1px, transparent 1px), linear-gradient(90deg, #005FB8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {/* Fake Location */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-bold text-slate-700 shadow-sm border border-white">
                <Mountain className="w-3.5 h-3.5 text-[#005FB8]" />
                Amirsoy Resort Zona #4
              </div>

              {/* Fake Radius Circles */}
              <div className="relative w-32 h-32 rounded-full border-2 border-[#00A87A]/30 bg-[#00A87A]/10 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
                <div className="w-16 h-16 rounded-full border border-[#00A87A]/40 bg-[#00A87A]/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#006C4A] rounded-full flex items-center justify-center shadow-lg shadow-[#006C4A]/40">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Fake Coordinates */}
              <div className="absolute bottom-3 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D287]"></span>
                41.5123° N, 70.0245° E
              </div>

              {/* Radius Label */}
              <div className="absolute bottom-3 right-3 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-sm">
                <TargetIcon className="w-3.5 h-3.5 text-[#00A87A]" />
                {form.radius.toFixed(1)} km ruxsat
              </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-3">
                <span>Geo-radius doirasi</span>
                <span className="bg-[#E1F7EE] text-[#006C4A] px-2 py-0.5 rounded-md">{form.radius.toFixed(1)} km</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="5.0" 
                step="0.1" 
                value={form.radius} 
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00A87A]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>500 m</span>
                <span>2.5 km</span>
                <span>5.0 km</span>
              </div>
            </div>

            {/* Mandatory Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E1F7EE] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#00A87A]" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900">Geo-tasdiqlash majburiy</div>
                  <div className="text-[10px] text-slate-500">Talaba hudud ichida bo'lmasa qabul qilinmaydi</div>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.mandatoryGeo} 
                  onChange={(e) => setForm(prev => ({ ...prev, mandatoryGeo: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006C4A]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <Award className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <div className="font-bold text-slate-900 text-[14px]">+120 XP</div>
            <div className="text-[10px] text-slate-500">Mukofot bali</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <Camera className="w-5 h-5 text-[#00A87A] mx-auto mb-2" />
            <div className="font-bold text-slate-900 text-[14px]">3 ta rasm</div>
            <div className="text-[10px] text-slate-500">Foto-hisobot</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <TargetIcon className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <div className="font-bold text-slate-900 text-[14px]">Maks 8m</div>
            <div className="text-[10px] text-slate-500">GPS aniqligi</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-14 bg-[#006C4A] hover:bg-[#00573B] text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,108,74,0.3)] transition-all active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          Topshiriqni e'lon qilish va yuborish
        </button>
      </form>
    </div>
  );
}

// Helper icons
function TargetIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  );
}
function Mountain(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
  );
}
