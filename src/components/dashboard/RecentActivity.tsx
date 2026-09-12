import { motion } from 'framer-motion';
import { CheckCircle2, Crosshair, RefreshCw, Activity, Map } from 'lucide-react';
import { ActivityItem } from '@/hooks/useTeacherDashboardData';
import { useTranslation } from 'react-i18next';

interface RecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

// Temporary hardcoded mockup data to match the UI precisely since `activities` prop might not have avatars/statuses
const mockActivities = [
  {
    id: 1,
    name: 'Jasur Aliyev',
    time: '12:35',
    task: 'Chorvoq suv ombori relyefi tahlili',
    statusTag: 'Tasdiqlangan (Chorvoq, 41.62°...)',
    statusType: 'success', // green
    avatarUrl: 'https://i.pravatar.cc/150?u=jasur',
    dotColor: 'bg-[#00A87A]',
    btnText: 'Tekshirish',
    btnVariant: 'primary'
  },
  {
    id: 2,
    name: 'Nilufar Zokirova',
    time: '11:50',
    task: "Botanika bog'i tuproq namunalari",
    statusTag: 'Hudud ichida (50m aniqlik)',
    statusType: 'info', // blue
    avatarUrl: 'https://i.pravatar.cc/150?u=nilufar',
    dotColor: 'bg-blue-500',
    btnText: 'Tekshirish',
    btnVariant: 'primary'
  },
  {
    id: 3,
    name: 'Bekzod Rustamov',
    time: '10:14',
    task: 'Toshkent teleminorasi koordinatasi',
    statusTag: 'Tekshirilmoqda...',
    statusType: 'pending', // gray
    avatarUrl: 'https://i.pravatar.cc/150?u=bekzod',
    dotColor: 'bg-blue-500',
    btnText: 'Kutilmoqda',
    btnVariant: 'disabled'
  }
];

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
            Oxirgi amaliyot javoblari
          </h3>
        </div>
        <button className="text-[13px] font-semibold text-[#006C4A]">
          Barchasi (14)
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {mockActivities.map((item, index) => (
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
                  <img src={item.avatarUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${item.dotColor}`}></span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[15px]">{item.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{item.task}</div>
                </div>
              </div>
              <div className="text-xs font-medium text-slate-900 mt-0.5">{item.time}</div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium max-w-[200px] truncate
                ${item.statusType === 'success' ? 'bg-[#E1F7EE] text-[#006C4A]' : ''}
                ${item.statusType === 'info' ? 'bg-blue-50 text-blue-600' : ''}
                ${item.statusType === 'pending' ? 'bg-slate-100 text-slate-500' : ''}
              `}>
                {item.statusType === 'success' && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                {item.statusType === 'info' && <Crosshair className="w-3.5 h-3.5 flex-shrink-0" />}
                {item.statusType === 'pending' && <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{item.statusTag}</span>
              </div>
              
              <button className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all
                ${item.btnVariant === 'primary' ? 'bg-[#006C4A] text-white hover:bg-[#00573B]' : 'bg-slate-100 text-slate-400'}
              `}>
                {item.btnText}
              </button>
            </div>
          </motion.div>
        ))}

        {/* Live Map Banner */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBFF] text-[#5454E6] flex items-center justify-center">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-[15px]">Guruhlar jonli xaritasi</div>
              <div className="text-xs text-slate-500">Hozirda 24 talaba dala amaliyotida</div>
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
