import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useStudentGroupsData } from '@/hooks/useStudentGroupsData';
import EmptyState from '@/components/ui/EmptyState';

export default function StudentGroups() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const {
    data: groups = [],
    isLoading,
  } = useStudentGroupsData(userId) as {
    data: any[] | undefined;
    isLoading: boolean;
  };



  const getGroupColor = (index: number) => {
    const colors = [
      'from-blue-600 to-cyan-600',
      'from-pink-600 to-purple-600',
      'from-yellow-600 to-orange-600',
      'from-green-600 to-emerald-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 z-10 bg-black">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full text-white hover:bg-zinc-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">My Groups</h1>
            </div>
            <Button
              onClick={() => navigate('/join-group')}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Join New Group</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Groups List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No groups found"
            description="You haven't joined any groups yet. Join a group to start learning!"
            actionLabel="Join a Group"
            onAction={() => navigate('/join-group')}
          />
        ) : (
          <div className="grid gap-4">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() =>
                    navigate(`/student-dashboard/groups/${group.id}`)
                  }
                  className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGroupColor(
                        index
                      )} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-2xl font-bold">{group.name.charAt(0)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg truncate pr-2">
                          {group.name}
                        </h3>
                        {group.members_count && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />
                            <span>{group.members_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-zinc-400 line-clamp-1">
                        {group.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="text-zinc-500">
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
