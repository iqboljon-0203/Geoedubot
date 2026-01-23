import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Paperclip, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubmitAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | undefined;
  existingSubmission?: any;
  onSuccess: () => void;
}

export const SubmitAnswerModal = ({ 
  isOpen, 
  onClose, 
  taskId, 
  existingSubmission, 
  onSuccess 
}: SubmitAnswerModalProps) => {
  const { userId } = useAuthStore();
  const [comment, setComment] = useState(existingSubmission?.description || '');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!taskId || !userId) return;

    setIsSubmitting(true);
    try {
      let fileUrl = existingSubmission?.file_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `submissions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('task-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      const submissionData = {
        task_id: taskId,
        user_id: userId,
        description: comment,
        file_url: fileUrl,
        // created_at update automatically on insert, needed for update?
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

      toast.success('Submission sent successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-[32px] border-t border-zinc-800 h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2" onClick={onClose}>
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Submit Answer</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Your response</label>
                <Textarea
                  placeholder="Add a comment or explain your answer..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  className="min-h-[160px] bg-zinc-900 border-zinc-800 rounded-2xl resize-none text-white placeholder:text-zinc-600 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <div className="text-right text-xs text-zinc-600">
                  {comment.length}/1000
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Attachments</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 rounded-3xl p-8 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-white">Upload Photo/File</p>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
                
                {existingSubmission?.file_url && !file && (
                   <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Previous Submission</p>
                      <a href={existingSubmission.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View File</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-[#121212]">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!comment && !file && !existingSubmission)}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/20"
              >
                {isSubmitting ? (
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     Sending...
                   </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {existingSubmission ? 'Update Submission' : 'Send Submission'}
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
