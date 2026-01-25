import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Paperclip, FileText, CheckCircle2, MapPin, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { isToday, parseISO, isValid } from 'date-fns';
import { SubmissionMap } from '@/components/maps/SubmissionMap';
import { useTranslation } from 'react-i18next';

interface SubmitAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  existingSubmission?: any;
  onSuccess: () => void;
  taskType?: 'homework' | 'internship';
  taskDate?: string;
  groupLocation?: { lat: number; lng: number } | null;
}

export const SubmitAnswerModal = ({ 
  isOpen, 
  onClose, 
  taskId, 
  existingSubmission, 
  onSuccess,
  taskType,
  taskDate,
  groupLocation
}: SubmitAnswerModalProps) => {
  const { userId } = useAuthStore();
  const { t } = useTranslation();
  const [comment, setComment] = useState(existingSubmission?.description || '');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Geolocation states
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Reset states
        setLocationError(null);
        setDistance(null);
        setCurrentLocation(null);
        if (taskType === 'internship') {
            checkLocation();
        }
    }
  }, [isOpen, taskType]);

  const checkLocation = () => {
    if (!navigator.geolocation) {
        setLocationError(t('modals.submit.geo_not_supported'));
        return;
    }
    
    setIsLocating(true);
    setLocationError(null);
    setDistance(null);

    // Telegram WebApp va Mobile uchun options
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setIsLocating(false);

            if (groupLocation && groupLocation.lat && groupLocation.lng) {
                const d = calculateDistance(latitude, longitude, groupLocation.lat, groupLocation.lng);
                setDistance(d);

                if (d > 500) {
                     // Agar masofa uzoq bo'lsa, lekin GPS aniqligi juda past bo'lsa (masalan 200m dan ko'p), 
                     // demak qurilma aniq GPS koordinatasini olmayapti (ehtimol Wi-Fi/IP location).
                     if (accuracy > 200) {
                         setLocationError(t('modals.submit.gps_accuracy_low', { accuracy: Math.round(accuracy) }));
                     } else {
                         setLocationError(t('modals.submit.distance_error', { distance: Math.round(d) }));
                     }
                }
            }
        },
        (error) => {
            setIsLocating(false);
            let errorMsg = t('modals.submit.location_error_title');
            if (error.code === 1) errorMsg = t('modals.submit.permission_denied');
            if (error.code === 2) errorMsg = t('modals.submit.gps_not_found');
            if (error.code === 3) errorMsg = t('modals.submit.timeout');
            setLocationError(errorMsg);
        },
        options
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!taskId || !userId) return;

    // Validation for Internship
    if (taskType === 'internship') {
        if (taskDate) {
            const date = new Date(taskDate);
            if (isValid(date) && !isToday(date)) {
                 toast.error(t('modals.submit.wrong_date_desc', { date: taskDate }));
                 return;
            }
        }
        
        if (groupLocation && (!currentLocation || (distance !== null && distance > 500))) {
             toast.error(t('modals.submit.fail_location'));
             return;
        }
    }

    setIsSubmitting(true);
    try {
      let fileUrl = existingSubmission?.file_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${taskId}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('answers') 
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        fileUrl = fileName; 
      }

      const submissionData = {
        task_id: taskId,
        user_id: userId,
        description: comment,
        file_url: fileUrl,
        location_lat: currentLocation?.lat,
        location_lng: currentLocation?.lng
      };

      if (existingSubmission) {
        // Update
        const { error } = await supabase
          .from('answers')
          .update(submissionData)
          .eq('id', existingSubmission.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('answers')
          .insert(submissionData);
        if (error) throw error;
      }

      toast.success(t('modals.submit.success'));
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if today is the correct day for internship
  const isCorrectDay = taskType === 'internship' && taskDate ? isToday(new Date(taskDate)) : true;
  const isDistanceValid = taskType === 'internship' && groupLocation ? (distance !== null && distance <= 500) : true;
  const canSubmit = comment || file || existingSubmission;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[32px] border-t border-border h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2" onClick={onClose}>
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between border-b border-border/50">
              <h2 className="text-xl font-bold">{t('modals.submit.title')}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Internship Validation Warning */}
              {taskType === 'internship' && (
                 <div className="space-y-4">
                    {!isCorrectDay && (
                        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive flex items-start gap-3 border border-destructive/20">
                            <AlertCircle className="w-5 h-5 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">{t('modals.submit.wrong_date')}</h4>
                                <p className="text-xs mt-1">{t('modals.submit.wrong_date_desc', { date: taskDate })}</p>
                            </div>
                        </div>
                    )}
                    
                    {groupLocation ? (
                         <div className={cn(
                             "p-4 rounded-2xl flex items-start gap-3 border transition-colors",
                             locationError || (distance !== null && distance > 500)
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : distance !== null 
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-muted text-muted-foreground border-border"
                         )}>
                            {isLocating ? (
                                <RefreshCw className="w-5 h-5 mt-0.5 animate-spin" /> 
                            ) : distance !== null && distance <= 500 ? (
                                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                            ) : (
                                <MapPin className="w-5 h-5 mt-0.5" />
                            )}
                            
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">
                                    {isLocating ? t('modals.submit.verifying') : 
                                     locationError ? t('modals.submit.location_error_title') :
                                     distance !== null ? `Masofa: ${Math.round(distance)}m` :
                                     t('modals.submit.check_location')}
                                </h4>
                                <p className="text-xs mt-1 whitespace-pre-wrap">
                                     {locationError 
                                        ? locationError 
                                        : (distance !== null 
                                            ? (distance <= 500 ? t('modals.submit.success_location') : t('modals.submit.fail_location')) 
                                            : t('modals.submit.pre_location'))}
                                </p>
                                
                                {(locationError || distance === null || distance > 500) && !isLocating && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={checkLocation} 
                                        className="mt-3 h-8 text-xs bg-background hover:bg-muted"
                                    >
                                        {t('modals.submit.retry_gps')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-xl text-xs border border-yellow-500/20">
                           Ogohlantirish: O'qituvchi tomonidan guruh lokatsiyasi belgilanmagan.
                        </div>
                    )}
                    
                    {/* Map Visualization */}
                    {(groupLocation || currentLocation) && (
                        <div className="space-y-2">
                             {(locationError || (distance !== null && distance > 500)) && (
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg text-center border border-border">
                                    💡 {t('modals.submit.map_hint')}
                                </div>
                            )}
                            <SubmissionMap 
                                userLocation={currentLocation} 
                                groupLocation={groupLocation || null} 
                            />
                        </div>
                    )}
                 </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('modals.submit.comment_label')}</label>
                <Textarea
                  placeholder={t('modals.submit.comment_placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  className="min-h-[160px] bg-muted/50 border-input rounded-2xl resize-none focus:ring-primary"
                  disabled={taskType === 'internship' && (!isCorrectDay || (groupLocation && !isDistanceValid))}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {comment.length}/1000
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('modals.submit.upload_title')}</label>
                <div 
                  onClick={() => !isSubmitting && (!taskType || taskType !== 'internship' || (isCorrectDay && isDistanceValid)) && fileInputRef.current?.click()}
                  className={cn(
                      "border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 group",
                      (taskType === 'internship' && (!isCorrectDay || (groupLocation && !isDistanceValid))) 
                        ? "opacity-50 cursor-not-allowed border-border bg-muted" 
                        : "cursor-pointer border-border bg-muted/30 hover:bg-muted hover:border-primary"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                    disabled={taskType === 'internship' && (!isCorrectDay || (groupLocation && !isDistanceValid))}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{t('modals.submit.upload_title')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('modals.submit.upload_desc')}</p>
                  </div>
                </div>

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
                
                {existingSubmission?.file_url && !file && (
                   <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-2xl border border-green-500/20">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t('modals.submit.existing_file')}</p>
                      <p className="text-xs text-green-600">{t('modals.submit.replace_file_hint')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-card">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit || (taskType === 'internship' && (!isCorrectDay || (groupLocation && !isDistanceValid)))}
                className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg"
              >
                {isSubmitting ? (
                   <div className="flex items-center gap-2">
                     <Loader2 className="w-5 h-5 animate-spin" />
                     {t('modals.submit.submitting')}
                   </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {existingSubmission ? t('tasks.update_submission') : t('tasks.submit_answer')}
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
