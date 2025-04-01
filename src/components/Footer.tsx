import React from 'react';
import { Github, Twitter, Linkedin, Mail, ExternalLink, ChevronUp, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Create Project', href: '/new' },
    { name: 'Contact', href: '/contact' },
    { name: 'Documentation', href: '/docs' },
  ];
  
  const resourceLinks = [
    { name: 'API Reference', href: '/api' },
    { name: 'Templates', href: '/templates' },
    { name: 'Tutorials', href: '/tutorials' },
  ];
  
  const socialLinks = [
    { 
      name: 'GitHub', 
      href: 'https://github.com/CSU-AIML', 
      icon: <Github className="w-5 h-5" />,
      hoverColor: 'hover:text-white'
    },
    { 
      name: 'Twitter', 
      href: 'https://twitter.com', 
      icon: <Twitter className="w-5 h-5" />,
      hoverColor: 'hover:text-blue-400'
    },
    { 
      name: 'LinkedIn', 
      href: 'https://www.linkedin.com/company/cybersecurityumbrella/posts/?feedView=all', 
      icon: <Linkedin className="w-5 h-5" />,
      hoverColor: 'hover:text-blue-600'
    },
    { 
      name: 'Email', 
      href: 'mailto:contact@example.com', 
      icon: <Mail className="w-5 h-5" />,
      hoverColor: 'hover:text-purple-400'
    },
  ];

  return (
    <footer className="w-full mt-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Existing decorative elements remain the same */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      {/* Blob effects */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

      {/* Back to top button */}
      <button 
        onClick={scrollToTop}
        className="fixed right-6 bottom-24 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-xl group animate-pulse z-50"
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-inner shadow-white/10">
                <img 
                  src="/white_logo.png" 
                  alt="NeuraVerse Logo" 
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:via-purple-200 group-hover:to-blue-100">
                NeuraVerse
              </h3>
            </div>
            <p className="text-sm text-gray-400 max-w-xs mb-4">
              Building the future of AI/ML with innovative tools and solutions for researchers and developers.
            </p>
            
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-all duration-300 hover:scale-110 ${link.hoverColor} focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-full p-2`}
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-all duration-200 flex items-center hover:translate-x-1 focus:outline-none focus:text-blue-400"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 transition-all duration-200"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-all duration-200 flex items-center hover:translate-x-1 focus:outline-none focus:text-blue-400"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 transition-all duration-200"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest updates.</p>
            
            <form className="space-y-2">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow hover:shadow-lg hover:shadow-blue-500/20"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 sm:mb-0 flex items-center">
            <span>© {currentYear} NeuraVerse. All rights reserved.</span>
            <span className="flex items-center ml-2">
              Made with <Heart className="w-3 h-3 mx-1 text-red-500" /> by the NeuraVerse Team
            </span>
          </div>
          
          <div className="flex space-x-4 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="/cookies" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;