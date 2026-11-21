import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Loader2, 
  Navigation, 
  CheckCircle2, 
  Image as ImageIcon, 
  Camera, 
  Paperclip, 
  X,
  FileText,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Building2,
  Edit3
} from 'lucide-react';
import { SubmissionMap } from '@/components/maps/SubmissionMap';
import { PracticeLocationModal } from '@/components/modals/PracticeLocationModal';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/utils/location';

interface EvidenceItem {
  id: string;
  file?: File;
  url: string;
  name: string;
  size: string;
}

export default function StudentTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportText, setReportText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingAnswer, setExistingAnswer] = useState<any>(null);
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [practiceLocation, setPracticeLocation] = useState<any>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get user GPS position
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Brauzeringizda geolokatsiya qo'llab-quvvatlanmaydi.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId, userId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`*, groups (name, lat, lng, address), profiles:created_by (full_name, avatar)`)
        .eq('id', taskId)
        .single();
        
      if (taskError) throw taskError;
      setTask(taskData);

      // Guruh a'zoligi orqali talabaning individual amaliyot maktabini olish (Dual ta'lim)
      if (userId && taskData.group_id) {
        try {
          const { data: memberData } = await supabase
            .from('group_members')
            .select('id, school_name, practice_lat, practice_lng, practice_address')
            .eq('group_id', taskData.group_id)
            .eq('user_id', userId)
            .maybeSingle();

          if (memberData) {
            setPracticeLocation(memberData);
          }
        } catch (memberErr) {
          console.warn("Could not fetch student practice location:", memberErr);
        }
      }

      // Check for existing answer
      if (userId) {
        const { data: answerData } = await supabase
          .from('answers')
          .select('*')
          .eq('task_id', taskId)
          .eq('user_id', userId)
          .maybeSingle();

        if (answerData) {
          setExistingAnswer(answerData);
          if (answerData.description) {
            setReportText(answerData.description);
          }
          if (answerData.file_url) {
            const urls = answerData.file_url.split(',').map((u: string) => u.trim()).filter(Boolean);
            const loaded: EvidenceItem[] = urls.map((rawUrl: string, idx: number) => {
              const url = rawUrl.startsWith('http') 
                ? rawUrl 
                : supabase.storage.from('answers').getPublicUrl(rawUrl).data.publicUrl;
              const name = url.split('/').pop()?.split('?')[0] || `Fayl_${idx + 1}.jpg`;
              return {
                id: `existing_${idx}`,
                url,
                name,
                size: 'Yuklangan',
              };
            });
            setEvidences(loaded);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - evidences.length;
    if (remainingSlots <= 0) {
      toast.error("Maksimal 4 tagacha fayl biriktirish mumkin.");
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots);
    
    // Mobil qurilmalarda (Android/Telegram) fayl oqimi yopilib qolmasligi uchun
    // fayl baytlarini darhol xotiraga (ArrayBuffer/Blob) o'qib olamiz
    const newItems: EvidenceItem[] = await Promise.all(
      filesArray.map(async (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let mime = file.type;
        if (!mime) {
          if (ext === 'pdf') mime = 'application/pdf';
          else if (ext === 'docx') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else if (ext === 'doc') mime = 'application/msword';
          else mime = 'image/jpeg';
        }

        try {
          const buffer = await file.arrayBuffer();
          const safeBlob = new Blob([buffer], { type: mime });
          const safeFile = new File([safeBlob], file.name, { type: mime });
          return {
            id: Math.random().toString(36).substring(2, 9),
            file: safeFile,
            url: URL.createObjectURL(safeBlob),
            name: file.name,
            size: formatFileSize(file.size),
          };
        } catch {
          return {
            id: Math.random().toString(36).substring(2, 9),
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: formatFileSize(file.size),
          };
        }
      })
    );

    setEvidences((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} ta fayl qo'shildi`);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidences((prev) => {
      const item = prev.find((e) => e.id === id);
      if (item && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((e) => e.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      toast.error("Iltimos, hisobot yoki javobingizni kiriting.");
      return;
    }

    if (!userId) {
      toast.error("Foydalanuvchi ma'lumotlari topilmadi. Qayta kiring.");
      return;
    }

    // Geo-amaliyot va majburiy geo tekshiruvi (Dual ta'lim: har bir talaba o'z maktabida)
    if (task.type === 'internship' && task.mandatory_geo) {
      if (!targetLocation) {
        setIsLocationModalOpen(true);
        toast.error("Iltimos, avval amaliyot o'tayotgan maktabingizni biriktiring!");
        return;
      }
      if (!userLocation) {
        toast.error("Geo-tasdiqlash majburiy! Iltimos, GPS joylashuvni aniqlang.");
        return;
      }
      if (distMeters !== null && !isWithinRadius) {
        const placeName = targetLocation.name || "amaliyot maktabingiz";
        toast.error(`Geo-tasdiqlash majburiy! Siz ${placeName} hududi ichida emassiz (Masofa: ${distMeters < 1000 ? distMeters + ' m' : distKm?.toFixed(2) + ' km'}, ruxsat: ${(radiusMeters / 1000).toFixed(1)} km).`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < evidences.length; i++) {
        const item = evidences[i];
        if (item.file) {
          const rawExt = item.name.split('.').pop() || 'jpg';
          const fileExt = rawExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
          const fileName = `${userId}/${taskId}/${Date.now()}_${i}.${fileExt}`;
          const mimeType = item.file.type || (
            fileExt === 'pdf' 
              ? 'application/pdf' 
              : fileExt === 'docx' 
              ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
              : fileExt === 'doc' 
              ? 'application/msword' 
              : 'image/jpeg'
          );

          let uploaded = false;

          // 1-urinish: 'answers' storage bucket'iga yuklash
          try {
            const { data, error: answersError } = await supabase.storage
              .from('answers')
              .upload(fileName, item.file, {
                contentType: mimeType,
                upsert: false,
              });

            if (!answersError && data) {
              const { data: urlData } = supabase.storage
                .from('answers')
                .getPublicUrl(fileName);
              uploadedUrls.push(urlData.publicUrl);
              uploaded = true;
            } else if (answersError) {
              console.warn("Answers bucket upload warning:", answersError);
            }
          } catch (storageErr) {
            console.warn("Answers bucket upload exception:", storageErr);
          }

          // 2-urinish: agar answers bo'lmasa, 'tasks' bucket'iga yuklab ko'rish
          if (!uploaded) {
            try {
              const { data, error: tasksError } = await supabase.storage
                .from('tasks')
                .upload(fileName, item.file, {
                  contentType: mimeType,
                  upsert: false,
                });

              if (!tasksError && data) {
                const { data: urlData } = supabase.storage
                  .from('tasks')
                  .getPublicUrl(fileName);
                uploadedUrls.push(urlData.publicUrl);
                uploaded = true;
              } else if (tasksError) {
                console.warn("Tasks bucket fallback error:", tasksError);
              }
            } catch (tasksStorageErr) {
              console.warn("Tasks bucket fallback exception:", tasksStorageErr);
            }
          }

          if (!uploaded) {
            console.warn(`"${item.name}" fayli storage'ga yuklanmadi, ammo matn saqlanadi.`);
          }
        } else if (item.url) {
          uploadedUrls.push(item.url);
        }
      }

      const fileUrlToSave = uploadedUrls.length > 0 ? uploadedUrls.join(',') : null;

      const payload: any = {
        task_id: taskId,
        user_id: userId,
        description: reportText.trim(),
        file_url: fileUrlToSave,
        location_lat: userLocation?.lat || null,
        location_lng: userLocation?.lng || null,
        school_name: practiceLocation?.school_name || null,
      };

      const saveAnswer = async (dataToSave: any) => {
        if (existingAnswer) {
          return await supabase
            .from('answers')
            .update(dataToSave)
            .eq('id', existingAnswer.id);
        } else {
          return await supabase
            .from('answers')
            .insert(dataToSave);
        }
      };

      let { error: saveErr } = await saveAnswer(payload);

      // Agar answers jadvalida school_name ustuni hali mavjud bo'lmasa, uni olib tashlab qayta urinish
      if (saveErr && saveErr.message?.includes('school_name')) {
        delete payload.school_name;
        const retryRes = await saveAnswer(payload);
        saveErr = retryRes.error;
      }

      if (saveErr) {
        // Agar 409 unique constraint (avval javob berilgan bo'lsa), yangilashga o'tkazish
        if (saveErr.code === '23505') {
          const { error: updateErr } = await supabase
            .from('answers')
            .update(payload)
            .eq('task_id', taskId)
            .eq('user_id', userId);
          if (updateErr) throw updateErr;
        } else {
          throw saveErr;
        }
      }

      toast.success(existingAnswer ? "Javobingiz yangilandi!" : "Vazifa muvaffaqiyatli topshirildi!");
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err: any) {
      console.error("Submit error:", err);
      const msg = err.message === 'Failed to fetch'
        ? "Tarmoq bilan aloqa uzildi. Internetni tekshirib qayta urinib ko'ring."
        : (err.message || "Yuklab bo'lmadi");
      toast.error("Xatolik yuz berdi: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A87A]" />
      </div>
    );
  }

  if (!task) return <div className="p-8 text-center text-slate-500">Vazifa topilmadi</div>;

  const deadlineDate = task.deadline || task.date;
  const hasIndividualLocation = !!(practiceLocation?.practice_lat && practiceLocation?.practice_lng);
  const targetLocation = hasIndividualLocation
    ? {
        lat: Number(practiceLocation.practice_lat),
        lng: Number(practiceLocation.practice_lng),
        name: practiceLocation.school_name || "Amaliyot maktabi",
        address: practiceLocation.practice_address || "",
        isIndividual: true,
      }
    : (task?.groups?.lat && task?.groups?.lng)
    ? {
        lat: Number(task.groups.lat),
        lng: Number(task.groups.lng),
        name: task.groups.name || "Guruh lokatsiyasi",
        address: task.groups.address || "",
        isIndividual: false,
      }
    : null;

  const radiusMeters = (task?.radius || 1.5) * 1000;
  const distKm = (userLocation && targetLocation) 
    ? calculateDistance(userLocation.lat, userLocation.lng, targetLocation.lat, targetLocation.lng) 
    : null;
  const distMeters = distKm !== null ? Math.round(distKm * 1000) : null;
  const isWithinRadius = distMeters !== null ? distMeters <= radiusMeters : true;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Outfit'] pb-36">
      
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                {task.type === 'internship' ? "Geo-amaliyot" : "Uyga vazifa"}
              </p>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Topshiriq #{taskId?.slice(0, 4) || '104'}</h1>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
            existingAnswer 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-blue-50 text-blue-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              existingAnswer ? 'bg-emerald-500' : 'bg-blue-600'
            }`}></span>
            {existingAnswer ? 'Topshirilgan' : 'Jarayonda'}
          </div>
        </div>
      </header>

      <div className="px-4 py-5 max-w-xl mx-auto space-y-5">
        
        {/* Badges */}
        <div className="flex gap-2">
          <span className="bg-[#5CE3A1] text-[#006644] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            {task.type === 'internship' ? "Geo-tadqiqot" : "Nazariy"}
          </span>
          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
            {task.groups?.name || 'Guruh'}
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
               <img src={task.profiles.avatar} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
            ) : (
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                 {task.profiles?.full_name?.slice(0, 2)?.toUpperCase() || 'US'}
               </div>
            )}
            <span className="text-sm font-semibold text-slate-700">{task.profiles?.full_name || "O'qituvchi"}</span>
          </div>
        </div>

        {/* Deadline Block */}
        {deadlineDate && (
          <div className="bg-red-50/80 rounded-2xl p-4 flex items-center justify-between border border-red-100/50 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-red-700">
                  Muddati: {new Date(deadlineDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-[11px] text-red-500 font-medium mt-0.5">Topshiriq muddati belgilangan</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#00A87A]" />
            </div>
            <h3 className="text-[13px] font-bold text-[#00A87A]">Vazifa yo'riqnomasi</h3>
          </div>
          <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">
            {task.description || "Yo'riqnoma mavjud emas."}
          </p>

          {/* Teacher's Attachment */}
          {task.file_url && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <a
                href={task.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Paperclip className="w-4 h-4 text-[#00A87A] flex-shrink-0" />
                  <span className="text-[12px] font-bold truncate">O'qituvchi biriktirgan fayl</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Live Geo-verification for internship */}
        {task.type === 'internship' && (
          <div className="space-y-4">
            {/* Dual Education Practice School Card */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                      Dual ta'lim: Amaliyot maktabi
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {practiceLocation?.school_name || "Maktab hali biriktirilmagan"}
                    </h4>
                    {practiceLocation?.practice_address ? (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        📍 {practiceLocation.practice_address}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Har bir talaba o'z tumanidagi maktab koordinatasini belgilaydi
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="rounded-xl text-xs font-semibold gap-1.5 h-9 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex-shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{hasIndividualLocation ? "O'zgartirish" : "Biriktirish"}</span>
                </Button>
              </div>

              {!hasIndividualLocation && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-800 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>Amaliyot maktabingizni biriktiring!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-bold text-amber-900 underline hover:no-underline whitespace-nowrap"
                  >
                    Hozir belgilash →
                  </button>
                </div>
              )}
            </div>

            {/* Map & Distance Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#006C4A]" />
                  <h3 className="font-bold text-slate-900 text-[15px]">Jonli Geo-tasdiqlash</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={isLocating}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors active:scale-95"
                    title="GPS yangilash"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#00A87A]' : ''}`} />
                    GPS yangilash
                  </button>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase ${
                    userLocation ? 'bg-[#5CE3A1] text-[#006644]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${userLocation ? 'bg-[#006644] animate-pulse' : 'bg-amber-600'}`}></span>
                    {userLocation ? "GPS Faol" : "GPS Kutilmoqda"}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 space-y-3">
                {/* Real Interactive Map */}
                <SubmissionMap 
                  userLocation={userLocation} 
                  groupLocation={targetLocation ? { lat: targetLocation.lat, lng: targetLocation.lng } : null} 
                  radius={radiusMeters} 
                  targetName={targetLocation?.name ? `🏫 ${targetLocation.name}` : undefined}
                />

                {/* Status and distance indicator */}
                {targetLocation ? (
                  <div>
                    {userLocation ? (
                      isWithinRadius ? (
                        <div className="bg-[#E1F7EE] text-[#006C4A] p-3 rounded-2xl flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#00A87A]" />
                          <div className="text-[12px]">
                            <p className="font-bold text-[13px] leading-snug">Siz ruxsat etilgan hududdasiz!</p>
                            <p className="opacity-90 text-[11px] mt-0.5">
                              {targetLocation.name}gacha masofa: <strong>{distMeters! < 1000 ? `${distMeters} metr` : `${distKm?.toFixed(2)} km`}</strong> (Ruxsat: {(radiusMeters / 1000).toFixed(1)} km)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200/60 text-amber-900 p-3 rounded-2xl flex items-center gap-2.5">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                          <div className="text-[12px]">
                            <p className="font-bold text-[13px] text-amber-800 leading-snug">
                              {task.mandatory_geo ? "Belgilangan hududdan tashqaridasiz!" : "Hududdan tashqaridasiz"}
                            </p>
                            <p className="text-amber-700 text-[11px] mt-0.5">
                              {targetLocation.name}gacha masofa: <strong>{distMeters! < 1000 ? `${distMeters} m` : `${distKm?.toFixed(2)} km`}</strong> (Ruxsat: {(radiusMeters / 1000).toFixed(1)} km). 
                              {task.mandatory_geo ? " Vazifa topshirish uchun amaliyot maktabingiz hududiga kiring." : ""}
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 text-[12px]">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>GPS joylashuvingiz aniqlanmadi</span>
                        </div>
                        <button
                          type="button"
                          onClick={requestLocation}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Aniqlash
                        </button>
                      </div>
                    )}

                    {targetLocation.address && (
                      <p className="text-[11px] text-slate-500 px-1 mt-2">
                        Mo'ljal manzili: <span className="font-semibold text-slate-700">{targetLocation.address}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 p-2 text-center">Guruh yoki amaliyot maktabi uchun koordinata belgilanmagan</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-[14px]">Kuzatuv va tahlil hisoboti</h3>
            <span className="text-[11px] text-slate-400">Majburiy</span>
          </div>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Kuzatuv natijalari, tahlil va xulosalaringizni batafsil yozing..."
            rows={5}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A87A]/20 focus:border-[#00A87A] transition-all resize-none shadow-sm placeholder:text-slate-400"
          />
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[11px] font-medium text-slate-500">Batafsil ma'lumot qoldiring</span>
            <span className="text-[11px] font-bold text-slate-700">{reportText.length} belgi</span>
          </div>
        </div>

        {/* Real Attachments (Dalillar) Section */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-[14px]">Biriktirilgan dalillar</h3>
            </div>
            <span className="text-[12px] font-bold text-blue-600">{evidences.length} / 4 ta fayl</span>
          </div>

          {/* Evidence Grid or Empty State */}
          {evidences.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#00A87A]/50 transition-colors mb-4 bg-slate-50/50"
            >
              <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-[13px] font-bold text-slate-600">Hozircha dalillar biriktirilmagan</p>
              <p className="text-[11px] text-slate-400 mt-1">Kameradan suratga oling yoki rasm, PDF, Word fayllarini tanlang (maks. 4 ta)</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {evidences.map((item) => {
                const lowerName = item.name.toLowerCase();
                const isPdf = lowerName.endsWith('.pdf');
                const isWord = lowerName.endsWith('.doc') || lowerName.endsWith('.docx');
                const isDoc = isPdf || isWord;

                return (
                  <div key={item.id} className="relative h-28 rounded-2xl overflow-hidden group border border-slate-100 shadow-sm bg-slate-100">
                    {!isDoc ? (
                      <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center p-2 text-center ${
                        isPdf ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        <FileText className={`w-8 h-8 mb-1 ${isPdf ? 'text-red-500' : 'text-blue-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {isPdf ? 'PDF HUJJAT' : 'WORD HUJJAT'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                    
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEvidence(item.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-colors z-10"
                      title="O'chirish"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <div className="text-[10px] font-bold truncate" title={item.name}>{item.name}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-white/70">{item.size}</span>
                        <div className="flex items-center gap-1 text-[9px] text-[#5CE3A1]">
                          <CheckCircle2 className="w-3 h-3" /> Tayyor
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={evidences.length >= 4}
              className="flex-1 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] disabled:opacity-50 text-blue-700 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4" /> Kamera ochish
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={evidences.length >= 4}
              className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 text-slate-700 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
              title="Galereya yoki Hujjat tanlash"
            >
              <Paperclip className="w-4 h-4" /> Fayl biriktirish
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-40 pb-safe">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-[#006C4A] hover:bg-[#00573B] text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,108,74,0.3)] transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yuklanmoqda va yuborilmoqda...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {existingAnswer 
                  ? "Javobni yangilash" 
                  : (task.type === 'internship' ? "Vazifani topshirish (Geo-tasdiqlangan)" : "Vazifani topshirish")}
              </>
            )}
          </button>
          <p className="text-center text-[10px] font-medium text-slate-500 mt-2">
            {task.type === 'internship' 
              ? "GPS ma'lumotlari hisobot bilan birga o'qituvchiga yuboriladi" 
              : "Javobingiz tekshirish uchun o'qituvchiga yuboriladi"}
          </p>
        </div>
      </div>

      {/* Practice Location Modal (Dual Ta'lim) */}
      {task?.group_id && userId && (
        <PracticeLocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          groupId={task.group_id}
          userId={userId}
          initialData={practiceLocation}
          onSaved={(savedData) => {
            setPracticeLocation(savedData);
          }}
        />
      )}
    </div>
  );
}
