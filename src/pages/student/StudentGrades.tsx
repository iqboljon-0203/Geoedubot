import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Award, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useStudentGrades } from "@/hooks/useStudentGrades";

function getGradeColor(grade: number | null) {
  if (grade === null) return "bg-gray-100 text-gray-500 border-gray-200";
  if (grade >= 8) return "bg-green-100 text-green-700 border-green-200";
  if (grade >= 5) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export default function StudentGrades() {
  const { userId } = useAuthStore();
  const { data: rawAnswers, isLoading } = useStudentGrades(userId);
  const answers = (rawAnswers || []) as any[];

  // Calculate generic Stats
  const gradedCount = answers.filter(a => a.grade !== null).length;
  const averageScore = gradedCount > 0 
    ? (answers.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedCount).toFixed(1) 
    : "0.0";

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-primary-gradient pb-10 rounded-b-[2.5rem] shadow-lg pt-8 px-6 text-white relative z-10">
         <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm opacity-80 mb-1">Academic Performance</p>
              <h1 className="text-2xl font-black tracking-wide">MY GRADES</h1>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Award className="w-6 h-6 text-white" />
            </div>
         </div>
         
         {/* Stats Card */}
         <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/20">
            <div>
              <p className="text-xs text-indigo-100 mb-1">Average Score</p>
              <h2 className="text-3xl font-black">{averageScore} <span className="text-sm font-normal opacity-60">/ 10</span></h2>
            </div>
            <div className="h-12 w-px bg-white/20 mx-4" />
            <div>
               <p className="text-xs text-indigo-100 mb-1">Graded Tasks</p>
               <h2 className="text-3xl font-black">{gradedCount}</h2>
            </div>
         </div>
      </div>

      <div className="px-6 -mt-6 relative z-20 space-y-4">
        {isLoading ? (
           <div className="text-center py-8 text-muted-foreground animate-pulse">Loading grades...</div>
        ) : answers.length === 0 ? (
           <div className="text-center py-10 bg-white rounded-[2rem] shadow-soft">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No Grades Yet</h3>
              <p className="text-gray-500 text-sm">Complete tasks to see your progress.</p>
           </div>
        ) : (
          answers.map((task) => (
            <div key={task.id} className="card-modern bg-white p-5 hover:shadow-xl transition-all">
               <div className="flex justify-between items-start mb-3">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getGradeColor(task.grade)}`}>
                    {task.grade !== null ? `${task.grade} Points` : "Pending"}
                  </div>
                  <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200 bg-gray-50">
                    {task.type === "homework" ? "Homework" : "Internship"}
                  </Badge>
               </div>
               
               <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{task.title}</h3>
               <p className="text-xs text-muted-foreground font-medium mb-3">{task.group}</p>
               
               {/* Progress Bar Visual (Mock) */}
               <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                 <div 
                   className={`h-full rounded-full ${task.grade && task.grade >= 8 ? 'bg-green-500' : task.grade && task.grade >= 5 ? 'bg-yellow-400' : 'bg-gray-300'}`} 
                   style={{ width: task.grade ? `${task.grade * 10}%` : '0%' }}
                 />
               </div>

               <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                  {task.teacherComment && task.teacherComment !== "EMPTY" && (
                     <div>
                       <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Teacher Feedback</p>
                       <p className="text-xs text-gray-700 italic">"{task.teacherComment}"</p>
                     </div>
                  )}

                  {task.answer && (
                    <div className="pt-2 border-t border-gray-100">
                      <a
                         href={supabase.storage.from("answers").getPublicUrl(task.answer).data.publicUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center gap-2 text-primary text-xs font-bold hover:underline"
                      >
                        <FileText className="w-3 h-3" /> View Submission
                      </a>
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
