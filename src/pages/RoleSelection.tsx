import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useTelegramAuth } from "@/contexts/TelegramAuthContext";
import { Globe, GraduationCap, BookOpen, ArrowRight } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: "teacher" | "student") => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("profiles").insert([
        {
          id: crypto.randomUUID(),
          telegram_user_id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          username: user.username || `user_${user.id}`,
          role: role,
        },
      ]);

      if (error) throw error;

      navigate(role === "teacher" ? "/teacher-dashboard" : "/student-dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GeoEducationbot</h1>
            <p className="text-gray-600 mt-2">Select your path to continue</p>
          </div>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect("teacher")}
            disabled={isLoading}
            className="w-full group"
          >
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <span className="text-3xl group-hover:scale-110 transition-transform">👨‍🏫</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Teacher</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Manage your virtual classrooms, create engaging curriculum, and monitor student performance in real-time.
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect("student")}
            disabled={isLoading}
            className="w-full group"
          >
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                  <span className="text-3xl group-hover:scale-110 transition-transform">👨‍🎓</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Embark on geographical quests, complete interactive lessons, and build your digital portfolio.
                  </p>
                  <div className="mt-4 flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
