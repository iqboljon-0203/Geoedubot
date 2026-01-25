import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Plus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useStudentGroupsData } from '@/hooks/useStudentGroupsData';
import EmptyState from '@/components/ui/EmptyState';
import { useTranslation } from 'react-i18next';

export default function StudentGroups() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: groups = [],
    isLoading,
  } = useStudentGroupsData(userId) as {
    data: any[] | undefined;
    isLoading: boolean;
  };

  const getGroupColor = (index: number) => {
    const colors = [
      'from-primary to-cyan-600',
      'from-pink-600 to-purple-600',
      'from-yellow-600 to-orange-600',
      'from-green-600 to-emerald-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div 
      className="p-0"
      role="main"
      aria-labelledby="groups-title"
    >
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
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
              <h1 id="groups-title" className="text-xl font-bold">{t('dashboard.my_groups.title')}</h1>
            </div>
            <Button
              onClick={() => navigate('/join-group')}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-5 h-5 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{t('dashboard.my_groups.join_new')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Groups List */}
        {isLoading ? (
          <div className="text-center py-16" role="status" aria-label={t('common.loading')}>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : groups.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 sm:py-12"
          >
            <div className="w-full max-w-md bg-card rounded-[2rem] shadow-xl border border-border p-8 sm:p-10 text-center relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary/10 via-purple-500/10 to-blue-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-border shadow-sm">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('dashboard.my_groups.no_groups_title', "Guruhlar topilmadi")}</h3>
                <p className="text-muted-foreground mb-8 text-balance">
                  {t('dashboard.my_groups.no_groups_desc', "Siz hali hech qanday guruhga a'zo emassiz. O'qituvchingizdan guruh kodini so'rang.")}
                </p>
                <Button 
                  onClick={() => navigate('/student-dashboard/join')}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold shadow-lg shadow-primary/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('dashboard.quick_actions.join_group', "Guruhga Qo'shilish")}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4" role="list">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                role="listitem"
              >
                <Card
                  onClick={() =>
                    navigate(`/student-dashboard/groups/${group.id}`)
                  }
                  className="bg-card border-border p-4 cursor-pointer hover:bg-accent transition-colors focus-within:ring-2 focus-within:ring-primary"
                  role="button"
                  tabIndex={0}
                  aria-label={group.name}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/student-dashboard/groups/${group.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGroupColor(
                        index
                      )} flex items-center justify-center flex-shrink-0`}
                      aria-hidden="true"
                    >
                      <span className="text-2xl font-bold text-white">{group.name.charAt(0)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg truncate pr-2">
                          {group.name}
                        </h3>
                        {group.members_count && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" aria-hidden="true" />
                            <span>{group.members_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {group.description || t('groups.description')}
                      </p>
                    </div>

                    <div className="text-muted-foreground" aria-hidden="true">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
