
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Database, Camera, Clock, Star, Video } from 'lucide-react';

const LearningPaths = () => {
  const paths = [
    {
      title: "Wikipedia Fundamentals",
      description: "Master the basics of editing, sourcing, and following Wikipedia policies.",
      level: "Beginner",
      duration: "2-3 weeks",
      modules: 8,
      videoLessons: 12,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      features: ["Basic editing", "Citation guidelines", "Neutral point of view", "Notability criteria"]
    },
    {
      title: "Advanced Editing & Policy",
      description: "Deep dive into complex editing scenarios and advanced Wikipedia policies.",
      level: "Intermediate",
      duration: "4-5 weeks",
      modules: 12,
      videoLessons: 18,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      features: ["Content disputes", "Deletion processes", "Copyright compliance", "Community guidelines"]
    },
    {
      title: "Wikidata & Commons",
      description: "Learn to contribute to structured data and multimedia repositories.",
      level: "Advanced",
      duration: "3-4 weeks",
      modules: 10,
      videoLessons: 15,
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      features: ["Wikidata editing", "Image guidelines", "File uploads", "Cross-project integration"]
    }
  ];

  return (
    <section id="learning" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Choose Your Learning Path</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Progress through carefully designed curricula that take you from Wikipedia novice to confident contributor.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paths.map((path, index) => {
            const IconComponent = path.icon;
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className={`absolute top-0 left-0 right-0 h-1 ${path.bgColor}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${path.bgColor} mb-4`}>
                      <IconComponent className={`h-6 w-6 ${path.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {path.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                    {path.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {path.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{path.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.modules} modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="h-4 w-4" />
                      <span>{path.videoLessons} videos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {path.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-6">
                    Start Path
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LearningPaths;
