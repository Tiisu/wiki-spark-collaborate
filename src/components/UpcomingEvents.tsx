
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, ArrowRight } from 'lucide-react';

const UpcomingEvents = () => {
  const events = [
    {
      title: "Global Edit-a-Thon: Climate Change",
      description: "Join contributors worldwide to improve climate-related articles.",
      date: "June 15, 2025",
      time: "14:00 UTC",
      participants: 250,
      type: "Virtual",
      category: "Edit-a-thon"
    },
    {
      title: "Beginner's Workshop: Your First Edit",
      description: "Live guided session for newcomers to make their first Wikipedia contribution.",
      date: "June 18, 2025",
      time: "18:00 UTC",
      participants: 45,
      type: "Virtual",
      category: "Workshop"
    },
    {
      title: "Advanced Policy Deep Dive",
      description: "Expert discussion on complex Wikipedia policies and edge cases.",
      date: "June 22, 2025",
      time: "16:00 UTC",
      participants: 80,
      type: "Virtual",
      category: "Masterclass"
    }
  ];

  return (
    <section id="events" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Upcoming Events</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join live workshops, edit-a-thons, and community gatherings to accelerate your learning and connect with fellow contributors.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {events.map((event, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 group border-slate-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {event.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {event.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{event.participants} registered</span>
                  </div>
                </div>
                
                <Button className="w-full bg-slate-800 hover:bg-slate-700 group">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="outline" size="lg" className="border-slate-300 hover:bg-slate-50">
            View All Events <Calendar className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
