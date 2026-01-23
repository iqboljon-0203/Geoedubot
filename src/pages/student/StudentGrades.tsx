import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useStudentGrades } from "@/hooks/useStudentGrades";

function getGradeBadge(grade: number | null) {
  if (grade === null) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 px-3 py-1 text-sm">
        Baholanmagan
      </Badge>
    );
  }
  if (grade >= 8) {
    return (
      <Badge className="bg-green-100 text-green-700 px-3 py-1 text-sm">
        {grade} / 10
      </Badge>
    );
  }
  if (grade >= 5) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 px-3 py-1 text-sm">
        {grade} / 10
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 px-3 py-1 text-sm">
      {grade} / 10
    </Badge>
  );
}

export default function StudentGrades() {
  const { userId } = useAuthStore();
  const { data: answers = [], isLoading, error } = useStudentGrades(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Baholar</h1>
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-lg text-muted-foreground">
            Yuklanmoqda...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-lg text-red-500">
            Xatolik: {error.message}
          </div>
        ) : answers.length === 0 ? (
          <div className="text-muted-foreground text-center py-12 text-lg">
            Hali javob yuborilmagan
          </div>
        ) : (
          answers.map((task) => (
            <Card
              key={task.id}
              className="relative p-6 bg-gradient-to-br from-blue-50 to-white dark:from-muted dark:to-muted/60 border border-border rounded-2xl shadow-md hover:shadow-lg transition flex flex-col gap-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {task.group}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        task.type === "homework" ? "default" : "secondary"
                      }
                      className={
                        task.type === "homework"
                          ? "bg-blue-100 text-blue-700 px-3 py-1 text-xs"
                          : "bg-green-100 text-green-700 px-3 py-1 text-xs"
                      }
                    >
                      {task.type === "homework" ? "Uyga vazifa" : "Amaliyot"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-muted-foreground">
                    Baho:
                  </span>
                  {getGradeBadge(task.grade)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <b>Sizning tavsifingiz:</b>{" "}
                {task.studentDesc && task.studentDesc !== "EMPTY" ? (
                  task.studentDesc
                ) : (
                  <span className="text-muted-foreground">Tavsif yo'q</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <b>Ustoz izohi:</b>{" "}
                {task.teacherComment && task.teacherComment !== "EMPTY" ? (
                  task.teacherComment
                ) : (
                  <span className="text-muted-foreground">Izoh yo'q</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm mt-1">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1 border-blue-200"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Javob:</span>
                  {task.answer ? (
                    <a
                      href={
                        supabase.storage
                          .from("answers")
                          .getPublicUrl(task.answer).data.publicUrl
                      }
                      className="text-blue-600 underline hover:text-blue-800 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Faylni ko‘rish
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Yuborilmagan</span>
                  )}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
