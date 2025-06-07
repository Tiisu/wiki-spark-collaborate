import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Award, 
  Star, 
  Trophy, 
  Medal, 
  Target,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Lock,
  CheckCircle,
  Calendar
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSkeleton from '@/components/ui/loading-skeleton';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'community' | 'milestone' | 'special';
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface AchievementStats {
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  recentAchievements: Achievement[];
  nextAchievements: Achievement[];
}

const Achievements = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first Wikipedia lesson',
          category: 'learning',
          type: 'bronze',
          icon: '🎯',
          isUnlocked: true,
          unlockedAt: '2024-01-15T10:30:00Z',
          points: 50,
          rarity: 'common'
        },
        {
          id: '2',
          title: 'Editor in Training',
          description: 'Make your first Wikipedia edit',
          category: 'learning',
          type: 'bronze',
          icon: '✏️',
          isUnlocked: true,
          unlockedAt: '2024-01-16T14:20:00Z',
          points: 100,
          rarity: 'common'
        },
        {
          id: '3',
          title: 'Knowledge Seeker',
          description: 'Complete 5 courses',
          category: 'learning',
          type: 'silver',
          icon: '📚',
          isUnlocked: false,
          progress: 2,
          maxProgress: 5,
          points: 250,
          rarity: 'uncommon'
        },
        {
          id: '4',
          title: 'Community Helper',
          description: 'Help 10 other learners in discussions',
          category: 'community',
          type: 'silver',
          icon: '🤝',
          isUnlocked: false,
          progress: 3,
          maxProgress: 10,
          points: 200,
          rarity: 'uncommon'
        },
        {
          id: '5',
          title: 'Week Warrior',
          description: 'Study for 7 consecutive days',
          category: 'milestone',
          type: 'gold',
          icon: '🔥',
          isUnlocked: true,
          unlockedAt: '2024-01-20T09:15:00Z',
          points: 500,
          rarity: 'rare'
        },
        {
          id: '6',
          title: 'Wikipedia Master',
          description: 'Complete the Wikipedia Editor Mastery path',
          category: 'milestone',
          type: 'platinum',
          icon: '👑',
          isUnlocked: false,
          progress: 2,
          maxProgress: 6,
          points: 1000,
          rarity: 'legendary'
        },
        {
          id: '7',
          title: 'Speed Learner',
          description: 'Complete a course in under 2 hours',
          category: 'special',
          type: 'gold',
          icon: '⚡',
          isUnlocked: false,
          points: 300,
          rarity: 'rare'
        }
      ];

      const stats: AchievementStats = {
        totalPoints: mockAchievements
          .filter(a => a.isUnlocked)
          .reduce((sum, a) => sum + a.points, 0),
        unlockedCount: mockAchievements.filter(a => a.isUnlocked).length,
        totalCount: mockAchievements.length,
        recentAchievements: mockAchievements
          .filter(a => a.isUnlocked && a.unlockedAt)
          .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
          .slice(0, 3),
        nextAchievements: mockAchievements
          .filter(a => !a.isUnlocked && a.progress !== undefined)
          .sort((a, b) => (b.progress! / b.maxProgress!) - (a.progress! / a.maxProgress!))
          .slice(0, 3)
      };

      return { achievements: mockAchievements, stats };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <LoadingSkeleton variant="card" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    );
  }

  const { achievements, stats } = achievementsData || { achievements: [], stats: {} as AchievementStats };

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600';
      case 'uncommon':
        return 'text-green-600';
      case 'rare':
        return 'text-blue-600';
      case 'legendary':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Points</CardTitle>
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">Achievement points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unlocked</CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.unlockedCount}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalCount} achievements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {Math.round((stats.unlockedCount / stats.totalCount) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Recent</CardTitle>
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.recentAchievements.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="all" className="text-xs py-2">All</TabsTrigger>
          <TabsTrigger value="learning" className="text-xs py-2">Learning</TabsTrigger>
          <TabsTrigger value="community" className="text-xs py-2">Community</TabsTrigger>
          <TabsTrigger value="milestone" className="text-xs py-2">Milestone</TabsTrigger>
          <TabsTrigger value="special" className="text-xs py-2">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4">
          {/* Recent Achievements */}
          {activeCategory === 'all' && stats.recentAchievements.length > 0 && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Achievements
                </CardTitle>
                <CardDescription className="text-sm">Your latest unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  {stats.recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{achievement.title}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getTypeColor(achievement.type)} variant="outline">
                          {achievement.type}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(achievement.unlockedAt!)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`transition-all duration-200 ${
                  achievement.isUnlocked
                    ? 'bg-gradient-to-br from-card to-green-50 dark:to-green-900/20 border-green-200 dark:border-green-800'
                    : 'opacity-75'
                }`}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl ${achievement.isUnlocked ? '' : 'grayscale'}`}>
                        {achievement.isUnlocked ? achievement.icon : '🔒'}
                      </div>
                      <div>
                        <CardTitle className="text-base">{achievement.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                  {/* Progress for locked achievements */}
                  {!achievement.isUnlocked && achievement.progress !== undefined && achievement.maxProgress && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Achievement Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(achievement.type)} variant="outline">
                        {achievement.type}
                      </Badge>
                      <span className={`text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{achievement.points}</span>
                    </div>
                  </div>

                  {/* Unlock Date */}
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {achievement.isUnlocked ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No achievements found</h3>
                <p className="text-gray-500">
                  {activeCategory === 'all' 
                    ? 'Start learning to unlock your first achievement!'
                    : `No ${activeCategory} achievements available yet.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Achievements;
