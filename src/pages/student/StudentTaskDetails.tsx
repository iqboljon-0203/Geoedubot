import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ArrowLeft, Clock, MapPin, Loader2, Navigation, CheckCircle2, Image as ImageIcon, Camera, Paperclip, X } from 'lucide-react';

export default function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`*, groups (name, lat, lng), profiles:created_by (full_name, avatar)`)
        .eq('id', taskId)
        .single();
      if (taskError) throw taskError;
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (reportText.length < 50) {
      toast.error("Hisobot kamida 50 ta so'zdan iborat bo'lishi tavsiya etiladi.");
      return;
    }
    setSubmitting(true);
    // Simulation of submit
    setTimeout(() => {
      toast.success("Vazifa muvaffaqiyatli topshirildi!");
      setSubmitting(false);
      navigate(-1);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A87A]" />
      </div>
    );
  }

  if (!task) return <div className="p-8 text-center">Vazifa topilmadi</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Outfit'] pb-32">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                {task.type === 'internship' ? "Amaliy mashg'ulot" : "Uyga vazifa"}
              </p>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Topshiriq #{taskId?.slice(0, 4) || '104'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full text-[11px] font-bold text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Jarayonda
          </div>
        </div>
      </header>

      <div className="px-4 py-5 max-w-xl mx-auto space-y-5">
        
        {/* Badges */}
        <div className="flex gap-2">
          <span className="bg-[#5CE3A1] text-[#006644] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            Biogeografiya
          </span>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            {task.groups?.name || 'GEO-202'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          {task.title}
        </h2>

        {/* Instructor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.profiles?.avatar ? (
               <img src={task.profiles.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
            ) : (
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                 <img src="https://ui-avatars.com/api/?name=MK&background=c7d2fe&color=4f46e5" className="w-8 h-8 rounded-full" alt="avatar" />
               </div>
            )}
            <span className="text-sm font-semibold text-slate-700">{task.profiles?.full_name || 'Ustoz'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#006C4A]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            24 talaba
          </div>
        </div>

        {/* Deadline Block */}
        <div className="bg-red-50/80 rounded-2xl p-4 flex items-center justify-between border border-red-100/50 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Clock className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-red-700">Muddati: Bugun, 23:59 gacha</div>
              <div className="text-[11px] text-red-500 font-medium mt-0.5">Qolgan vaqt: 4 soat 20 daqiqa</div>
            </div>
          </div>
          <div className="text-red-600 font-bold text-[15px] relative z-10 bg-white/50 px-2.5 py-1 rounded-lg">
            04:20:18
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00A87A]"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </div>
            <h3 className="text-[13px] font-bold text-[#00A87A]">Vazifa yo'riqnomasi</h3>
          </div>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Live Geo-verification */}
        {task.type === 'internship' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#006C4A]" />
                <h3 className="font-bold text-slate-900 text-[15px]">Jonli Geo-tasdiqlash</h3>
              </div>
              <div className="bg-[#5CE3A1] text-[#006644] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006644] animate-pulse"></span>
                GPS Faol
              </div>
            </div>

            <div className="bg-white rounded-3xl p-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              {/* Map Placeholder */}
              <div className="relative w-full h-48 rounded-2xl bg-[#E6EFFF] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#005FB8 1px, transparent 1px), linear-gradient(90deg, #005FB8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Fake User Location */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative flex flex-col items-center">
                    <div className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-2 whitespace-nowrap">
                      Siz (aniqlik ±3m)
                    </div>
                    <div className="w-32 h-32 rounded-full border border-[#005FB8]/40 bg-[#005FB8]/10 flex items-center justify-center absolute top-10">
                       <div className="w-6 h-6 bg-[#005FB8] rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-white px-3 py-2 rounded-xl flex items-center gap-2 text-[12px] font-bold text-slate-700 shadow-sm">
                  <MapPin className="w-4 h-4 text-[#00A87A]" />
                  41.3456° N, 69.3142° E
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center ml-2 shadow-sm border border-slate-100">
                    <Navigation className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Success Banner */}
              <div className="mt-2 bg-[#E1F7EE] rounded-2xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00A87A] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#006C4A]">Siz ruxsat etilgan hududdasiz!</h4>
                  <p className="text-[12px] text-[#00875A] mt-0.5 leading-snug">
                    Markazgacha masofa: <strong>120 metr</strong>. Geo-joylashuv muvaffaqiyatli tasdiqlandi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-[14px]">Kuzatuv va tahlil hisoboti</h3>
            <span className="text-[11px] text-slate-400">Ixtiyoriy emas</span>
          </div>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Botanika bog'i 3-sektoridagi o'simliklar tahlili, barg tuzilishi va tuproq namligi bo'yicha hisobotingizni kiriting..."
            rows={5}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[14px] text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A87A]/20 focus:border-[#00A87A] transition-all resize-none shadow-inner"
          />
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[11px] font-medium text-slate-500">Minimal tavsiya: 50 ta so'z</span>
            <span className="text-[11px] font-bold text-slate-700">{reportText.length} belgi</span>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-[14px]">Biriktirilgan dalillar</h3>
            </div>
            <span className="text-[12px] font-bold text-blue-600">2 / 4 ta rasm</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Fake images */}
            <div className="relative h-24 rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="leaf" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="text-[10px] font-bold truncate">Foto_sektor3_GPS.jpg</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] text-white/70">3.4 MB</span>
                  <div className="flex items-center gap-1 text-[9px] text-[#5CE3A1]">
                    <CheckCircle2 className="w-3 h-3" /> Tasdiqlangan
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-24 rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1423164478839-4467d58fbc83?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="tree" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <div className="text-[10px] font-bold truncate">Daraxt_turlari_02.jpg</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] text-white/70">2.8 MB</span>
                  <div className="flex items-center gap-1 text-[9px] text-[#5CE3A1]">
                    <CheckCircle2 className="w-3 h-3" /> Tasdiqlangan
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors">
              <Camera className="w-4 h-4" /> Kamera ochish
            </button>
            <button className="w-12 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-40 pb-safe">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-[#006C4A] hover:bg-[#00573B] text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,108,74,0.3)] transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Vazifani topshirish (Geo-tasdiqlangan)
              </>
            )}
          </button>
          <p className="text-center text-[10px] font-medium text-slate-500 mt-3">
            GPS ma'lumotlari hisobot bilan birga o'qituvchiga yuboriladi
          </p>
        </div>
      </div>
    </div>
  );
}
