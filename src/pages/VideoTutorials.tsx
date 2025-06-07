import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VideoTutorialCard } from '@/components/course/VideoTutorialCard';
import { VideoPlayer } from '@/components/ui/video-player';
import Header from '@/components/Header';
import { 
  Search, 
  Filter, 
  Video,
  Play,
  Clock,
  Users,
  BookOpen,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  instructor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  totalViews: number;
  isCompleted?: boolean;
  progress?: number;
  tags: string[];
  createdAt: string;
}

const VideoTutorials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ['video-tutorials', searchTerm, categoryFilter, difficultyFilter, sortBy],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockTutorials: VideoTutorial[] = [
        {
          id: '1',
          title: 'Wikipedia Editing Basics: Your First Edit',
          description: 'Learn how to make your very first edit on Wikipedia. This comprehensive tutorial covers account creation, basic editing interface, and making simple text changes.',
          thumbnail: '/api/placeholder/400/225',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 15,
          instructor: 'Dr. Sarah Johnson',
          difficulty: 'Beginner',
          category: 'Editing',
          rating: 4.8,
          totalViews: 12500,
          isCompleted: true,
          progress: 100,
          tags: ['editing', 'basics', 'first-edit', 'tutorial'],
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Advanced Citation Techniques',
          description: 'Master the art of proper citations in Wikipedia. Learn about different citation styles, reliable sources, and how to format references correctly.',
          thumbnail: '/api/placeholder/400/225',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration: 25,
          instructor: 'Prof. Michael Chen',
          difficulty: 'Advanced',
          category: 'Research',
          rating: 4.9,
          totalViews: 8300,
          isCompleted: false,
          progress: 60,
          tags: ['citations', 'references', 'sources', 'advanced'],
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          title: 'Understanding Wikipedia Policies',
          description: 'A comprehensive overview of Wikipedia\'s core policies including neutrality, verifiability, and no original research.',
          thumbnail: '/api/placeholder/400/225',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 30,
          instructor: 'Admin Lisa Rodriguez',
          difficulty: 'Intermediate',
          category: 'Policies',
          rating: 4.7,
          totalViews: 15600,
          tags: ['policies', 'guidelines', 'neutrality', 'verifiability'],
          createdAt: '2024-01-20'
        },
        {
          id: '4',
          title: 'Creating Your First Wikipedia Article',
          description: 'Step-by-step guide to creating a new Wikipedia article from scratch, including research, drafting, and submission process.',
          thumbnail: '/api/placeholder/400/225',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration: 45,
          instructor: 'Dr. Sarah Johnson',
          difficulty: 'Intermediate',
          category: 'Article Creation',
          rating: 4.6,
          totalViews: 9800,
          tags: ['article-creation', 'writing', 'research', 'drafts'],
          createdAt: '2024-01-12'
        },
        {
          id: '5',
          title: 'Wikidata Integration for Beginners',
          description: 'Learn how to use Wikidata to enhance Wikipedia articles with structured data and improve information consistency.',
          thumbnail: '/api/placeholder/400/225',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          duration: 20,
          instructor: 'Data Expert Alex Kim',
          difficulty: 'Beginner',
          category: 'Wikidata',
          rating: 4.5,
          totalViews: 6700,
          tags: ['wikidata', 'structured-data', 'integration', 'beginner'],
          createdAt: '2024-01-18'
        },
        {
          id: '6',
          title: 'Handling Content Disputes',
          description: 'Learn effective strategies for resolving content disputes and working collaboratively with other Wikipedia editors.',
          thumbnail: '/api/placeholder/400/225',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          duration: 35,
          instructor: 'Mediator John Smith',
          difficulty: 'Advanced',
          category: 'Community',
          rating: 4.8,
          totalViews: 5400,
          tags: ['disputes', 'collaboration', 'mediation', 'community'],
          createdAt: '2024-01-08'
        }
      ];

      // Apply filters
      let filteredTutorials = mockTutorials;

      if (searchTerm) {
        filteredTutorials = filteredTutorials.filter(tutorial =>
          tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tutorial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (categoryFilter !== 'all') {
        filteredTutorials = filteredTutorials.filter(tutorial => 
          tutorial.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }

      if (difficultyFilter !== 'all') {
        filteredTutorials = filteredTutorials.filter(tutorial => 
          tutorial.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
        );
      }

      // Apply sorting
      filteredTutorials.sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'popular':
            return b.totalViews - a.totalViews;
          case 'rating':
            return b.rating - a.rating;
          case 'duration':
            return a.duration - b.duration;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      return filteredTutorials;
    },
  });

  const handlePlayVideo = (tutorial: VideoTutorial) => {
    setSelectedVideo(tutorial);
    setIsPlayerOpen(true);
  };

  const categories = ['Editing', 'Research', 'Policies', 'Article Creation', 'Wikidata', 'Community'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const totalDuration = tutorials?.reduce((sum, tutorial) => sum + tutorial.duration, 0) || 0;
  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Video Tutorials
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Master Wikipedia editing with our comprehensive video tutorial library. 
            Learn at your own pace with expert-led content.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Video className="h-4 w-4" />
              <span>{tutorials?.length || 0} tutorials</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTotalDuration(totalDuration)} total content</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Expert instructors</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Find Your Perfect Tutorial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tutorials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty.toLowerCase()}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="duration">Shortest First</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setDifficultyFilter('all');
                  setSortBy('recent');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tutorials Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-video rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tutorials && tutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <VideoTutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                onPlay={handlePlayVideo}
                showProgress={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tutorials found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all tutorials.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setDifficultyFilter('all');
              }}>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All Tutorials
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Video Player Modal */}
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="max-w-4xl w-full p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl">{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              {selectedVideo && (
                <VideoPlayer
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="aspect-video w-full mb-4"
                  autoPlay={true}
                />
              )}
              {selectedVideo && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{selectedVideo.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Instructor: {selectedVideo.instructor}</span>
                    <span>Duration: {selectedVideo.duration}m</span>
                    <span>Difficulty: {selectedVideo.difficulty}</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VideoTutorials;
