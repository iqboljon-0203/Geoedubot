import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useStudentGrades } from "@/hooks/useStudentGrades";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getGradeBadge(grade: number | null) {
  if (grade === null) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 px-4 py-1.5 text-sm rounded-full font-semibold">
        ⏳ Baholanmagan
      </Badge>
    );
  }
  if (grade >= 8) {
    return (
      <Badge className="bg-green-100 text-green-700 px-4 py-1.5 text-sm rounded-full font-semibold">
        ✅ {grade} / 10
      </Badge>
    );
  }
  if (grade >= 5) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 px-4 py-1.5 text-sm rounded-full font-semibold">
        ⚠️ {grade} / 10
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 px-4 py-1.5 text-sm rounded-full font-semibold">
      ❌ {grade} / 10
    </Badge>
  );
}

export default function StudentGrades() {
  const { userId } = useAuthStore();
  const { data: answers = [], isLoading, error } = useStudentGrades(userId);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600" />
            </button>
            <h1 className="text-xl font-bold text-zinc-900">Barcha javoblar</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Xatolik yuz berdi
            </h3>
            <p className="text-zinc-600">{error.message}</p>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Hali javob yuborilmagan
            </h3>
            <p className="text-zinc-600">
              Topshiriqlarni bajarib javob yuboring
            </p>
          </div>
        ) : (
          answers.map((task) => (
            <Card
              key={task.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/60 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-zinc-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-zinc-600">
                        📁 {task.group}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={
                            task.type === "homework"
                              ? "bg-blue-100 text-blue-700 px-3 py-1 text-xs rounded-full font-semibold"
                              : "bg-green-100 text-green-700 px-3 py-1 text-xs rounded-full font-semibold"
                          }
                        >
                          {task.type === "homework" ? "📝 Uyga vazifa" : "💼 Amaliyot"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase">
                    Baho
                  </span>
                  {getGradeBadge(task.grade)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-zinc-50 rounded-2xl">
                  <p className="text-xs font-semibold text-zinc-700 mb-2">
                    📝 Sizning tavsifingiz:
                  </p>
                  <p className="text-sm text-zinc-900">
                    {task.studentDesc && task.studentDesc !== "EMPTY" ? (
                      task.studentDesc
                    ) : (
                      <span className="text-zinc-500 italic">Tavsif yo'q</span>
                    )}
                  </p>
                </div>

                {task.teacherComment && task.teacherComment !== "EMPTY" && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/60">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      👨‍🏫 Ustoz izohi:
                    </p>
                    <p className="text-sm text-blue-900">
                      {task.teacherComment}
                    </p>
                  </div>
                )}

                {task.answer && (
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={
                        supabase.storage
                          .from("answers")
                          .getPublicUrl(task.answer).data.publicUrl
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-2xl text-sm font-medium text-zinc-700 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Javobni ko'rish
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
