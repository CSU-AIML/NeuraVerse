import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import emailjs from "emailjs-com";
import { motion } from "motion/react";

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const devFormRef = useRef<HTMLFormElement>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'developer'>('contact');
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [devFormData, setDevFormData] = useState({
    name: "",
    email: "",
    issueType: "",
    description: "",
    priority: "medium"
  });
  
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devErrors, setDevErrors] = useState<Record<string, string>>({});
  
  // Status message state
  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | null;
    message: string | null;
  }>({ type: null, message: null });
  
  // Project leader state
  const [projectLeader, setProjectLeader] = useState({
    name: "",
    email: "",
    loading: true,
    error: false
  });
  
  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Fetch project leader information
  useEffect(() => {
    const fetchProjectLeader = async () => {
      try {
        // In a real application, this would be an API call
        // For demo purposes, we're simulating a fetch with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulated API response
        setProjectLeader({
          name: "Dhruvil Patel",
          email: "halfblood76001@gmail.com",
          loading: false,
          error: false
        });
      } catch (error) {
        console.error("Error fetching project leader:", error);
        setProjectLeader(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      }
    };
    
    if (activeTab === 'developer') {
      fetchProjectLeader();
    }
  }, [activeTab]);
  
  // General contact form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field-specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message is too short (minimum 10 characters)";
    }
    
    // Privacy policy validation
    if (!agreeToPrivacy) {
      newErrors.privacy = "You must agree to the Privacy Policy";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setStatus({ type: "loading", message: "Sending your message..." });
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated delay
  
      // EmailJS credentials
      const serviceId = "service_hawbvoo";
      const templateId = "template_s26qe9i";
      const publicKey = "It0JX4vH58DNrwU1w";
      
      // EmailJS implementation - passing parameters in the format EmailJS expects
      // Note: EmailJS determines the recipient from the template setup, not from the parameters
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        publicKey
      );
  
      setStatus({ 
        type: "success", 
        message: "Message sent successfully! We'll get back to you soon." 
      });
  
      setFormData({ name: "", email: "", subject: "", message: "" });
      setAgreeToPrivacy(false);
  
      setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
  
      setStatus({ 
        type: "error", 
        message: "Failed to send message. Please try again later." 
      });
  
      setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
    }
  };
  
  // Developer form handlers
  const handleDevFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDevFormData({ ...devFormData, [e.target.name]: e.target.value });
    
    // Clear field-specific error when user starts typing
    if (devErrors[e.target.name]) {
      setDevErrors({ ...devErrors, [e.target.name]: "" });
    }
  };
  
  const validateDevForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!devFormData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Email validation
    if (!devFormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(devFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Issue type validation
    if (!devFormData.issueType.trim()) {
      newErrors.issueType = "Issue type is required";
    }
    
    // Description validation
    if (!devFormData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (devFormData.description.trim().length < 20) {
      newErrors.description = "Please provide more details (minimum 20 characters)";
    }
    
    setDevErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleDevFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDevForm()) return;
    
    setStatus({ type: "loading", message: "Submitting your technical issue..." });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated delay
      
      // EmailJS credentials
      const serviceId = "service_hawbvoo";
      const templateId = "template_s26qe9i"; // You might want a different template for dev issues
      const publicKey = "It0JX4vH58DNrwU1w";
      
      // EmailJS implementation for developer contact
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: devFormData.name,
          email: devFormData.email,
          subject: `Technical Issue: ${devFormData.issueType} (${devFormData.priority})`,
          message: devFormData.description,
          to_name: projectLeader.name,
        },
        publicKey
      );
      
      setStatus({ 
        type: "success", 
        message: `Technical issue reported successfully! ${projectLeader.name} has been notified.` 
      });
      
      setDevFormData({
        name: "",
        email: "",
        issueType: "",
        description: "",
        priority: "medium"
      });
      
      setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
    } catch (error) {
      console.error("Error submitting technical issue:", error);
      
      setStatus({ 
        type: "error", 
        message: "Failed to submit technical issue. Please try again later." 
      });
      
      setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
    }
  };

  // FAQ data
  // Replace the faqs array in ContactPage.tsx with this updated version

// FAQ data
  const faqs = [
    {
      question: "Why can't I access the AIML dashboard?",
      answer: "Dashboard access issues are usually related to authentication. Make sure you're using the correct credentials and your account has been activated. If you're still having trouble, try clearing your browser cache, disabling extensions, or using another browser. For persistent issues, contact the IT support team with your employee ID."
    },
    {
      question: "Why are my projects not loading in the dashboard?",
      answer: "Projects may fail to load due to several reasons: insufficient permissions, server connectivity issues, or the project might be archived. Check your project access permissions with your team lead. If you believe you should have access, try refreshing the page or restarting your browser. For large projects, allow extra loading time."
    },
    {
      question: "How do I resolve 'Access Denied' errors when opening projects?",
      answer: "Access denied errors typically indicate permission issues. Each project has specific access controls based on roles. Contact your project manager or department head to request appropriate permissions. Include your employee ID and the specific project name when making the request."
    },
    {
      question: "The dashboard is loading slowly. How can I improve performance?",
      answer: "Dashboard performance can be affected by network connectivity, browser cache, or high server load. Try clearing your browser cache, closing unnecessary tabs and applications, and ensuring you have a stable internet connection. If you're accessing large projects with extensive datasets, some load time is expected. For persistent issues, contact technical support."
    },
    {
      question: "Why am I unable to see all AIML projects in my dashboard?",
      answer: "The visibility of projects depends on your department, role, and assigned permissions. You'll only see projects that you've been granted access to. If you believe a project is missing that you should have access to, contact your team lead or the project owner with the project name and your employee ID."
    },
    {
      question: "How do I report bugs or technical issues with the AIML dashboard?",
      answer: "To report technical issues, use the 'Technical Support' tab in the Contact form. Provide detailed information including steps to reproduce the issue, error messages, screenshots if possible, your browser and operating system, and the date/time the issue occurred. Critical issues should be reported immediately by phone at 0709-602-2911."
    },
    {
      question: "I can't upload files to my project. What should I do?",
      answer: "Upload issues can occur due to file size limitations, format restrictions, or permission settings. Check that your file is under the 100MB limit and in a supported format (.csv, .json, .py, .ipynb, .txt, .pdf). Verify you have 'Edit' or 'Admin' permissions for the project. If problems persist, contact technical support with details about the file and the specific error message you're receiving."
    },
    {
      question: "How do I request access to additional AIML projects?",
      answer: "To request access to additional projects, identify the project name and submit a request through your department head or directly to the project owner. Include your employee ID, role, business justification, and the level of access needed (View, Edit, or Admin). Requests typically take 24-48 hours to process depending on approval workflows."
    },
    {
      question: "The dashboard analytics and visualizations aren't displaying correctly. How can I fix this?",
      answer: "Visualization issues often stem from browser compatibility problems or JavaScript errors. First, try using a modern browser like Chrome or Firefox and ensure it's updated to the latest version. Clear your browser cache and cookies, disable any ad-blockers or privacy extensions that might interfere, and reload the page. If charts still don't render properly, report the issue to technical support with your browser details and screenshots."
    },
    {
      question: "How can I reset my password if I'm locked out of the dashboard?",
      answer: "If you're locked out, click the 'Forgot Password' link on the sign-in page. You'll receive a password reset link at your registered email address. If you don't receive the email, check your spam folder or contact the IT helpdesk at support@cybersecurityumbrella.com. For security reasons, password reset links expire after 24 hours."
    }
  ];

  // Status message component
  const StatusMessage = () => {
    if (!status.message) return null;
    
    return (
      <div 
        className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          status.type === "success" 
            ? "bg-green-500/20 text-green-300 border border-green-500/30" 
            : status.type === "error"
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
        }`}
      >
        {status.type === "loading" && (
          <Loader className="h-5 w-5 animate-spin" />
        )}
        {status.type === "success" && (
          <CheckCircle className="h-5 w-5" />
        )}
        {status.type === "error" && (
          <AlertCircle className="h-5 w-5" />
        )}
        {status.message}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white">
      {/* Top navigation */}
      <div className="w-full p-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <motion.button
            onClick={() => window.location.href = '/dashboard'}
            className="group flex items-center gap-3 px-4 py-2 rounded-lg  bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 hover:border-blue-600/50 text-gray-300 hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowLeft className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            </motion.div>
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>
      </div>
      
      {/* Main content area */}
      <div className={`flex-grow flex flex-col lg:flex-row transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left section with company info and map */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-gray-300 mb-12 max-w-lg">
              We're here to help with any questions you might have about our services, 
              technical support, or billing inquiries. Our team is dedicated to providing 
              you with the assistance you need.
            </p>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Phone Support</h3>
                  <p className="text-gray-400 text-sm">0709-602-2911</p>
                  <p className="text-gray-400 text-xs mt-1">Monday to Friday, 9AM - 6PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Email</h3>
                  <p className="text-gray-400 text-sm">support@cybersecurityumbrella.com</p>
                  <p className="text-gray-400 text-xs mt-1">We respond within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Office Location</h3>
                  <p className="text-gray-400 text-sm">Adajan, Surat, India</p>
                  <p className="text-gray-400 text-xs mt-1">Visitor hours: By appointment only</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Business Hours</h3>
                  <p className="text-gray-400 text-sm">Monday-Friday: 9AM - 6PM</p>
                  <p className="text-gray-400 text-xs mt-1">Weekend: Technical support available 10AM - 4PM</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced map with actual Google Maps embed */}
          <div className="mt-auto rounded-lg overflow-hidden border border-white/10 shadow-xl h-80 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.969089419518!2d72.8016654!3d21.1944846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04d8549c98b67%3A0x627def41b225fb93!2sCybersecurity%20Umbrella!5e0!3m2!1sen!2sus!4v1711743173231!5m2!1sen!2sus" 
              className="w-full h-full" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            {/* Custom overlay with company info and directions button */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-medium text-white text-lg">Cybersecurity Umbrella HQ</h3>
                    <p className="text-gray-300 text-sm">Adajan, Surat, Gujarat, India</p>
                  </div>
                  <a 
                    href="https://www.google.com/maps/place/Cybersecurity+Umbrella/@21.1944846,72.8016654,17z/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium transition-all duration-300 flex items-center gap-1 pointer-events-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
                    </svg>
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
            
            {/* Map control buttons overlay */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-lg overflow-hidden">
                <button className="p-2 hover:bg-gray-100 transition-colors" title="Zoom In">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <hr className="border-gray-200 m-0" />
                <button className="p-2 hover:bg-gray-100 transition-colors" title="Zoom Out">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
              </div>
              
              <button className="bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors" title="View Fullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Social media links */}
          <div className="mt-6 flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Right section with form/FAQ tabs */}
        <div className="lg:w-1/2 p-8 lg:p-12 bg-black/30 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === 'contact'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Contact Form
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === 'developer'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Technical Support
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === 'faq'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              FAQ
            </button>
          </div>
          
          {/* General Contact form */}
          {activeTab === 'contact' && (
            <div className="transition-all duration-500">
              <StatusMessage />
              
              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-sm text-gray-300 mb-1 ml-1">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                        errors.name ? "border-red-500" : "border-gray-700"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="email" className="text-sm text-gray-300 mb-1 ml-1">Your Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                        errors.email ? "border-red-500" : "border-gray-700"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="subject" className="text-sm text-gray-300 mb-1 ml-1">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                      errors.subject ? "border-red-500" : "border-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  >
                    <option value="">Select a topic</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing Question">Billing Question</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Security Concern">Security Concern</option>
                    <option value="Partnership Opportunity">Partnership Opportunity</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.subject && <p className="text-red-400 text-xs mt-1 ml-1">{errors.subject}</p>}
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="message" className="text-sm text-gray-300 mb-1 ml-1">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Please describe your inquiry in detail..."
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={500}
                    className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                      errors.message ? "border-red-500" : "border-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1 ml-1">{errors.message}</p>}
                  <div className="flex justify-end">
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.message.length} / 500 characters
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="privacy"
                    type="checkbox"
                    checked={agreeToPrivacy}
                    onChange={() => setAgreeToPrivacy(!agreeToPrivacy)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="privacy" className="ml-2 text-sm text-gray-300">
                    I agree to the <a href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {errors.privacy && <p className="text-red-400 text-xs ml-6">{errors.privacy}</p>}
                
                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg transition-all duration-300 font-medium flex items-center justify-center disabled:opacity-70 group"
                >
                  {status.type === "loading" ? (
                    <>
                      <Loader className="animate-spin mr-2 h-5 w-5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* Developer/Technical Support Form */}
          {activeTab === 'developer' && (
            <div className="transition-all duration-500">
              <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-500/20 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-purple-300 font-medium mb-1">Technical Support Request</h3>
                  <p className="text-gray-300 text-sm">
                    Use this form to report technical issues, bugs, or errors directly to our development team.
                    {projectLeader.loading ? (
                      <span className="inline-flex items-center ml-1">
                        <span className="animate-pulse">Loading project leader info...</span>
                      </span>
                    ) : projectLeader.error ? (
                      <span className="text-red-400 ml-1">Unable to load project leader information.</span>
                    ) : (
                      <span className="ml-1">Your request will be sent to <span className="text-purple-300 font-medium">{projectLeader.name}</span>, the project lead.</span>
                    )}
                  </p>
                </div>
              </div>
              
              <StatusMessage />
              
              <form ref={devFormRef} onSubmit={handleDevFormSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label htmlFor="dev-name" className="text-sm text-gray-300 mb-1 ml-1">Your Name</label>
                    <input
                      id="dev-name"
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={devFormData.name}
                      onChange={handleDevFormChange}
                      className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                        devErrors.name ? "border-red-500" : "border-gray-700"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                    />
                    {devErrors.name && <p className="text-red-400 text-xs mt-1 ml-1">{devErrors.name}</p>}
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="dev-email" className="text-sm text-gray-300 mb-1 ml-1">Your Email</label>
                    <input
                      id="dev-email"
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      value={devFormData.email}
                      onChange={handleDevFormChange}
                      className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                        devErrors.email ? "border-red-500" : "border-gray-700"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                    />
                    {devErrors.email && <p className="text-red-400 text-xs mt-1 ml-1">{devErrors.email}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col">
                    <label htmlFor="issueType" className="text-sm text-gray-300 mb-1 ml-1">Issue Type</label>
                    <div className="relative">
                      <select
                        id="issueType"
                        name="issueType"
                        value={devFormData.issueType}
                        onChange={handleDevFormChange}
                        className={`p-3 rounded-lg bg-gray-800/60 text-white border appearance-none w-full pr-10 ${
                          devErrors.issueType ? "border-red-500" : "border-gray-700"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      >
                        <option value="" disabled>Select issue type</option>
                        <option value="Bug" className="bg-gray-800">Bug</option>
                        <option value="Feature Malfunction" className="bg-gray-800">Feature Malfunction</option>
                        <option value="UI/UX Problem" className="bg-gray-800">UI/UX Problem</option>
                        <option value="Performance Issue" className="bg-gray-800">Performance Issue</option>
                        <option value="Security Vulnerability" className="bg-gray-800">Security Vulnerability</option>
                        <option value="API Problem" className="bg-gray-800">API Problem</option>
                        <option value="Documentation Error" className="bg-gray-800">Documentation Error</option>
                        <option value="Other" className="bg-gray-800">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {devErrors.issueType && (
                      <p className="text-red-400 text-xs mt-1 ml-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {devErrors.issueType}
                      </p>
                    )}
                    {!devErrors.issueType && devFormData.issueType && (
                      <p className="text-green-400 text-xs mt-1 ml-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Issue type selected
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="priority" className="text-sm text-gray-300 mb-1 ml-1">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={devFormData.priority}
                      onChange={handleDevFormChange}
                      className="p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="description" className="text-sm text-gray-300 mb-1 ml-1">Detailed Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Please describe the issue in detail. Include steps to reproduce, expected behavior, and actual behavior..."
                    value={devFormData.description}
                    onChange={handleDevFormChange}
                    maxLength={1000}
                    className={`p-3 rounded-lg bg-gray-800/60 text-white border ${
                      devErrors.description ? "border-red-500" : "border-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none`}
                  />
                  {devErrors.description && <p className="text-red-400 text-xs mt-1 ml-1">{devErrors.description}</p>}
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {devFormData.description.length < 20 ? 
                        <span className="text-yellow-400">Please provide at least 20 characters</span> : 
                        <span className="text-green-400">✓ Description looks good</span>
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      {devFormData.description.length} / 1000 characters
                    </p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={status.type === "loading" || projectLeader.loading}
                  className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300 font-medium flex items-center justify-center disabled:opacity-70 group"
                >
                  {status.type === "loading" ? (
                    <>
                      <Loader className="animate-spin mr-2 h-5 w-5" />
                      Submitting...
                    </>
                  ) : projectLeader.loading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-5 w-5" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Submit Technical Issue
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    For urgent issues requiring immediate attention, please contact us directly at <br/>
                    <a href="mailto:urgent@cybersecurityumbrella.com" className="text-purple-400 hover:underline">urgent@cybersecurityumbrella.com</a> or call <a href="tel:+917096022911" className="text-purple-400 hover:underline">+91 7096022911</a>
                  </p>
                </div>
              </form>
            </div>
          )}
          
          {/* FAQ section */}
          {activeTab === 'faq' && (
            <div className="space-y-6 transition-all duration-500">
              <p className="text-gray-300 mb-6">
                Find answers to commonly asked questions below. If you can't find what you're looking for, 
                please use our contact form to get in touch with us.
              </p>
              
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-700/50 rounded-lg overflow-hidden">
                  <details className="group">
                    <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-all">
                      <h3 className="font-medium text-white">{faq.question}</h3>
                      <span className="text-blue-400 transition-transform transform group-open:rotate-180">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="p-4 bg-gray-800/10 text-gray-300 text-sm">
                      {faq.answer}
                    </div>
                  </details>
                </div>
              ))}
              
              <div className="mt-8 text-center">
                <p className="text-gray-400 mb-4">Still have questions?</p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 py-2 px-4 rounded-lg transition-all duration-300 font-medium"
                >
                  Contact Us
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  
)};  

export default ContactPage;