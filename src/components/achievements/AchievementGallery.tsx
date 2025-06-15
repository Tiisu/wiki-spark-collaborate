import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Search, Filter, Star, Award } from 'lucide-react';
import { AchievementCard } from './AchievementCard';
import { Achievement, achievementApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AchievementGalleryProps {
  className?: string;
}

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({ className = '' }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('earned');
  const { toast } = useToast();

  const categories = [
    'Wikipedia Basics',
    'Content Creation',
    'Sourcing & Citations',
    'Community & Policy',
    'Sister Projects',
    'Learning Milestones',
    'Other'
  ];

  useEffect(() => {
    loadAchievements();
    loadBadgeDefinitions();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await achievementApi.getMyAchievements();
      setAchievements(response.achievements);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    }
  };

  const loadBadgeDefinitions = async () => {
    try {
      const response = await achievementApi.getBadgeDefinitions();
      setAllBadges(response.badges);
    } catch (error) {
      console.error('Failed to load badge definitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    try {
      const response = await achievementApi.checkAchievements();
      if (response.count > 0) {
        toast({
          title: "New Achievements!",
          description: `You've earned ${response.count} new achievement${response.count > 1 ? 's' : ''}!`,
        });
        loadAchievements(); // Reload to show new achievements
      } else {
        toast({
          title: "No New Achievements",
          description: "Keep learning to unlock more badges!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check for new achievements",
        variant: "destructive",
      });
    }
  };

  const getCategoryFromBadgeType = (badgeType: string): string => {
    if (['FIRST_EDIT', 'ACCOUNT_CREATOR', 'SANDBOX_EXPLORER'].includes(badgeType)) {
      return 'Wikipedia Basics';
    }
    if (['ARTICLE_CREATOR', 'CONTENT_CONTRIBUTOR', 'FORMATTING_MASTER', 'TEMPLATE_EXPERT'].includes(badgeType)) {
      return 'Content Creation';
    }
    if (['CITATION_MASTER', 'SOURCE_HUNTER', 'REFERENCE_EXPERT', 'FACT_CHECKER'].includes(badgeType)) {
      return 'Sourcing & Citations';
    }
    if (['POLICY_EXPERT', 'TALK_PAGE_NAVIGATOR', 'CONSENSUS_BUILDER', 'DISPUTE_RESOLVER'].includes(badgeType)) {
      return 'Community & Policy';
    }
    if (['COMMONS_CONTRIBUTOR', 'WIKTIONARY_EDITOR', 'WIKIBOOKS_AUTHOR', 'WIKINEWS_REPORTER'].includes(badgeType)) {
      return 'Sister Projects';
    }
    if (['COURSE_COMPLETER', 'QUIZ_MASTER', 'PERFECT_SCORE', 'SPEED_LEARNER', 'DEDICATED_LEARNER'].includes(badgeType)) {
      return 'Learning Milestones';
    }
    return 'Other';
  };

  const filterAchievements = (achievementsList: Achievement[]) => {
    return achievementsList.filter(achievement => {
      const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const category = getCategoryFromBadgeType(achievement.badgeType);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const earnedAchievements = filterAchievements(achievements);
  
  // Create mock unearned achievements from badge definitions
  const unearnedBadges = allBadges.filter(badge => 
    !achievements.some(achievement => achievement.badgeType === badge.type)
  ).map(badge => ({
    _id: `unearned-${badge.type}`,
    user: '',
    badgeType: badge.type,
    title: badge.title,
    description: badge.description,
    earnedAt: '',
    createdAt: '',
    updatedAt: ''
  }));

  const filteredUnearnedBadges = filterAchievements(unearnedBadges);

  const getStatsForCategory = (category: string) => {
    const categoryAchievements = achievements.filter(a => 
      getCategoryFromBadgeType(a.badgeType) === category
    );
    const totalInCategory = allBadges.filter(b => 
      getCategoryFromBadgeType(b.type) === category
    ).length;
    
    return {
      earned: categoryAchievements.length,
      total: totalInCategory,
      percentage: totalInCategory > 0 ? Math.round((categoryAchievements.length / totalInCategory) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Trophy className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <span>Achievement Gallery</span>
              </CardTitle>
              <CardDescription>
                Track your Wikipedia learning progress and unlock badges
              </CardDescription>
            </div>
            <Button onClick={checkForNewAchievements} variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Check for New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{allBadges.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {allBadges.length > 0 ? Math.round((achievements.length / allBadges.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">
            Earned ({earnedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({filteredUnearnedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map(achievement => (
                <AchievementCard
                  key={achievement._id}
                  achievement={achievement}
                  isEarned={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'No achievements match your filters'
                    : 'No achievements earned yet. Start learning to unlock your first badge!'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {filteredUnearnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnearnedBadges.map(badge => (
                <AchievementCard
                  key={badge._id}
                  achievement={badge}
                  isEarned={false}
                  showProgress={true}
                  progress={0}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {achievements.length === allBadges.length
                    ? 'Congratulations! You\'ve earned all available achievements!'
                    : 'No available achievements match your filters'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => {
              const stats = getStatsForCategory(category);
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>
                      {stats.earned} of {stats.total} achievements earned
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{stats.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.earned} earned • {stats.total - stats.earned} remaining
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
