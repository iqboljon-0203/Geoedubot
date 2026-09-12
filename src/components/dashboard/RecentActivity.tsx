import { motion } from 'framer-motion';
import { CheckCircle2, Crosshair, RefreshCw, Activity, Map, Users, FileText } from 'lucide-react';
import { ActivityItem } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface RecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

const getActivityUI = (item: ActivityItem, t: any) => {
  switch (item.type) {
    case 'task_submit':
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />,
        name: item.user || 'Talaba',
        task: item.subtitle,
        statusTag: 'Yangi javob',
        statusType: 'success', // green
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user || 'S')}&background=E1F7EE&color=006C4A`,
        dotColor: 'bg-[#00A87A]',
        btnText: 'Tekshirish',
        btnVariant: 'primary'
      };
    case 'group_join':
      return {
        icon: <Users className="w-3.5 h-3.5 flex-shrink-0" />,
        name: item.user || 'Talaba',
        task: item.subtitle,
        statusTag: "Guruhga qo'shildi",
        statusType: 'info', // blue
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user || 'S')}&background=EBF4FF&color=2563EB`,
        dotColor: 'bg-blue-500',
        btnText: "Ko'rish",
        btnVariant: 'secondary'
      };
    case 'new_task':
      return {
        icon: <FileText className="w-3.5 h-3.5 flex-shrink-0" />,
        name: t(item.titleKey) || 'Yangi vazifa',
        task: item.subtitle,
        statusTag: 'Yaratildi',
        statusType: 'pending', // gray
        avatarUrl: `https://ui-avatars.com/api/?name=T&background=F3F4F6&color=4B5563`,
        dotColor: 'bg-slate-500',
        btnText: "Ko'rish",
        btnVariant: 'secondary'
      };
    case 'new_group':
    default:
      return {
        icon: <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />,
        name: t(item.titleKey) || 'Yangi guruh',
        task: item.subtitle,
        statusTag: 'Yaratildi',
        statusType: 'pending',
        avatarUrl: `https://ui-avatars.com/api/?name=G&background=F3F4F6&color=4B5563`,
        dotColor: 'bg-slate-500',
        btnText: "Ko'rish",
        btnVariant: 'secondary'
      };
  }
};

export const RecentActivity = ({ activities = [], isLoading }: RecentActivityProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Yuklanmoqda...</div>;
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#006C4A]" />
          <h3 className="text-lg font-bold text-slate-900">
            Oxirgi faolliklar
          </h3>
        </div>
        <button className="text-[13px] font-semibold text-[#006C4A]">
          Barchasi ({activities.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Hozircha hech qanday faollik yo'q
          </div>
        ) : (
          activities.map((item, index) => {
            const ui = getActivityUI(item, t);
            let timeStr = '';
            try {
              timeStr = format(new Date(item.timestamp), 'HH:mm');
            } catch(e) {
              timeStr = '';
            }

            return (
              <motion.div
                key={item.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img src={ui.avatarUrl} alt={ui.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${ui.dotColor}`}></span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-[15px]">{ui.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{ui.task}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-900 mt-0.5">{timeStr}</div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium max-w-[200px] truncate
                    ${ui.statusType === 'success' ? 'bg-[#E1F7EE] text-[#006C4A]' : ''}
                    ${ui.statusType === 'info' ? 'bg-blue-50 text-blue-600' : ''}
                    ${ui.statusType === 'pending' ? 'bg-slate-100 text-slate-500' : ''}
                  `}>
                    {ui.icon}
                    <span className="truncate">{ui.statusTag}</span>
                  </div>
                  
                  <button className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all
                    ${ui.btnVariant === 'primary' ? 'bg-[#006C4A] text-white hover:bg-[#00573B]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}>
                    {ui.btnText}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Live Map Banner */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between group cursor-pointer mt-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBFF] text-[#5454E6] flex items-center justify-center">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-[15px]">Guruhlar xaritasi</div>
              <div className="text-xs text-slate-500">Talabalar joylashuvini ko'rish</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RecentActivity;
