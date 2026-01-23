import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export const GradeSubmission = () => {
  const navigate = useNavigate();
  const { answerId } = useParams<{ answerId: string }>();
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
      toast.error('Failed to load submission');
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

      toast.success('Grade submitted successfully!', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        duration: 3000,
      });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error('Failed to submit grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-600">Submission not found</p>
      </div>
    );
  }

  const maxScore = 10; // Default max score

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Grade Submission
              </h1>
              <p className="text-sm text-zinc-600">{answer.tasks?.title}</p>
            </div>
          </div>
        </div>
      </div>

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
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {answer.profiles?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">
                    {answer.profiles?.full_name || 'Student'}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    Submitted{' '}
                    {new Date(answer.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </Card>

            {/* File Preview */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                Submitted File
              </h2>
              {answer.file_url ? (
                <div className="space-y-4">
                  {/* File Type Detection */}
                  {answer.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <div className="rounded-2xl overflow-hidden border border-zinc-200">
                      <img
                        src={answer.file_url}
                        alt="Submission"
                        className="w-full h-auto"
                      />
                    </div>
                  ) : answer.file_url.match(/\.pdf$/i) ? (
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-200">
                      <iframe
                        src={answer.file_url}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-300 text-center">
                      <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                      <p className="text-sm text-zinc-600 mb-4">
                        Preview not available
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(answer.file_url!, '_blank')}
                        className="rounded-xl"
                      >
                        Open File
                      </Button>
                    </div>
                  )}

                  {/* Download Button */}
                  <Button
                    variant="outline"
                    onClick={() => window.open(answer.file_url!, '_blank')}
                    className="w-full rounded-xl"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download File
                  </Button>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-300 text-center">
                  <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-600">No file submitted</p>
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
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-6">
                Score
              </h2>

              {/* Score Display */}
              <div className="mb-6">
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {score}
                  </span>
                  <span className="text-3xl font-semibold text-zinc-400 mb-2">
                    / {maxScore}
                  </span>
                </div>
                <p className="text-center text-sm text-zinc-600">
                  {score === maxScore
                    ? 'Perfect! 🎉'
                    : score >= maxScore * 0.8
                    ? 'Excellent! 🌟'
                    : score >= maxScore * 0.6
                    ? 'Good job! 👍'
                    : score >= maxScore * 0.4
                    ? 'Keep trying! 💪'
                    : 'Needs improvement 📚'}
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
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>0</span>
                  <span>{maxScore}</span>
                </div>
              </div>
            </Card>

            {/* Feedback */}
            <Card className="p-6">
              <Label htmlFor="feedback" className="text-lg font-semibold mb-4 block">
                Feedback (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Provide constructive feedback to help the student improve..."
                rows={6}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="rounded-xl resize-none"
              />
            </Card>

            {/* Submit Button */}
            <Card className="p-6">
              <Button
                onClick={handleSubmitGrade}
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Submit Grade
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
