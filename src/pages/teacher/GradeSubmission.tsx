import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Answer {
  id: string;
  user_id: string;
  task_id: string;
  file_url: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  tasks: {
    title: string;
  };
}

const getFullUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return supabase.storage.from('answers').getPublicUrl(trimmed).data.publicUrl;
};

export const GradeSubmission = () => {
  const navigate = useNavigate();
  const { answerId } = useParams<{ answerId: string }>();
  const { t, i18n } = useTranslation();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [score, setScore] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnswer();
  }, [answerId]);

  const fetchAnswer = async () => {
    if (!answerId) return;

    try {
      const { data, error } = await supabase
        .from('answers')
        .select(
          `
          *,
          profiles!user_id (
            full_name,
            avatar_url
          ),
          tasks!task_id (
            title
          )
        `
        )
        .eq('id', answerId)
        .single();

      if (error) throw error;
      setAnswer(data as any);

      // Set initial score to middle value
      setScore(5);
    } catch (error) {
      console.error('Error fetching answer:', error);
      toast.error(t('grading.load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitGrade = async () => {
    if (!answerId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('answers')
        .update({
          score,
          feedback,
          graded_at: new Date().toISOString(),
        })
        .eq('id', answerId);

      if (error) throw error;

      toast.success(t('grading.grade_success'), {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 3000,
      });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error(t('grading.grade_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get formatted date based on current locale
  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get score feedback message
  const getScoreFeedback = (score: number, maxScore: number) => {
    if (score === maxScore) return t('grading.perfect');
    if (score >= maxScore * 0.8) return t('grading.excellent');
    if (score >= maxScore * 0.6) return t('grading.good');
    if (score >= maxScore * 0.4) return t('grading.keep_trying');
    return t('grading.needs_improvement');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label={t('common.loading')}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('grading.not_found')}</p>
      </div>
    );
  }

  const maxScore = 10; // Default max score

  return (
    <div className="p-0" role="main" aria-labelledby="grade-title">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
              aria-label={t('common.back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 id="grade-title" className="text-xl sm:text-2xl font-bold text-foreground">
                {t('grading.grade_submission')}
              </h1>
              <p className="text-sm text-muted-foreground">{answer.tasks?.title}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: File Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Student Info */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-lg"
                  aria-hidden="true"
                >
                  {answer.profiles?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {answer.profiles?.full_name || t('auth.student')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('grading.submitted')} {formatDate(answer.created_at)}
                  </p>
                </div>
              </div>
            </Card>

            {/* File Preview */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t('grading.submitted_file')}
              </h2>
              {answer.file_url ? (
                <div className="space-y-4">
                  {(() => {
                    const fileUrls = answer.file_url.split(',').map((u) => u.trim()).filter(Boolean);
                    return (
                      <div className="space-y-3">
                        <div className={`grid ${fileUrls.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                          {fileUrls.map((rawUrl, idx) => {
                            const fullUrl = getFullUrl(rawUrl);
                            const clean = fullUrl.split('?')[0].toLowerCase();
                            const ext = clean.split('.').pop() || '';
                            const fileName = decodeURIComponent(fullUrl.split('/').pop()?.split('?')[0] || `Fayl ${idx + 1}`);
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp'].includes(ext);
                            const isPdf = ext === 'pdf';
                            const isWord = ['doc', 'docx'].includes(ext);

                            return (
                              <div key={idx} className="rounded-2xl border border-border bg-card p-3 shadow-sm space-y-2.5">
                                {isImage ? (
                                  <div
                                    className="relative h-44 rounded-xl overflow-hidden cursor-pointer group bg-muted/30"
                                    onClick={() => window.open(fullUrl, '_blank')}
                                  >
                                    <img
                                      src={fullUrl}
                                      alt={fileName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                                      To'liq ko'rish
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                    <div
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        isPdf
                                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                          : isWord
                                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                          : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                                      }`}
                                    >
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-foreground truncate" title={fileName}>
                                        {fileName}
                                      </p>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {isPdf ? 'PDF Hujjat' : isWord ? 'Word Hujjat' : `${ext.toUpperCase()} Fayli`}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(fullUrl, '_blank')}
                                    className="flex-1 h-9 rounded-xl text-xs gap-1.5 font-medium"
                                  >
                                    {isImage ? "Rasmni ochish" : isPdf ? "PDFni ochish" : "Faylni ochish"}
                                  </Button>

                                  {isWord && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="secondary"
                                      onClick={() =>
                                        window.open(
                                          `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=false`,
                                          '_blank'
                                        )
                                      }
                                      className="h-9 rounded-xl text-xs gap-1 font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                      title="Google Docs orqali brauzerda ko'rish"
                                    >
                                      Online ko'rish
                                    </Button>
                                  )}

                                  <a
                                    href={fullUrl}
                                    download={fileName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-9 px-3 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1 text-xs"
                                    title="Yuklab olish"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-border text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{t('grading.no_file')}</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Right: Grading Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Score Slider */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                {t('grading.score')}
              </h2>

              {/* Score Display */}
              <div className="mb-6">
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
                    {score}
                  </span>
                  <span className="text-3xl font-semibold text-muted-foreground mb-2">
                    / {maxScore}
                  </span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {getScoreFeedback(score, maxScore)}
                </p>
              </div>

              {/* Slider */}
              <div className="space-y-4">
                <Slider
                  value={[score]}
                  onValueChange={(values) => setScore(values[0])}
                  min={0}
                  max={maxScore}
                  step={1}
                  className="w-full"
                  aria-label={t('grading.score')}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{maxScore}</span>
                </div>
              </div>
            </Card>

            {/* Feedback */}
            <Card className="p-6 bg-card border-border">
              <Label htmlFor="feedback" className="text-lg font-semibold mb-4 block text-foreground">
                {t('grading.feedback')}
              </Label>
              <Textarea
                id="feedback"
                placeholder={t('grading.feedback_placeholder')}
                rows={6}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="rounded-xl resize-none"
              />
            </Card>

            {/* Submit Button */}
            <Card className="p-6 bg-card border-border">
              <Button
                onClick={handleSubmitGrade}
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold text-lg shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    {t('grading.submitting')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" aria-hidden="true" />
                    {t('grading.submit_grade')}
                  </div>
                )}
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GradeSubmission;
