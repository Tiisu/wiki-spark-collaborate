
import React from 'react';
import { BookOpen, Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">WikiWalkthrough</span>
            </div>
            <p className="text-slate-300 text-sm">
              Empowering global knowledge creation through structured learning and community collaboration.
            </p>
            <div className="flex space-x-4">
              <Twitter className="h-5 w-5 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Mail className="h-5 w-5 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Learning</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Beginner Path</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Advanced Editing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Wikidata & Commons</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Assessment Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Forums</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentorship</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Edit-a-thons</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Translation Sprints</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Guidelines Library</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tool Collection</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Events Calendar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2025 WikiWalkthrough. Made with <Heart className="h-4 w-4 text-red-500 inline mx-1" /> for free knowledge.
          </p>
          <div className="flex space-x-6 text-sm text-slate-400 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Code of Conduct</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
