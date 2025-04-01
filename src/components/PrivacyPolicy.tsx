import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, Lock, Eye, Database, Server, FileText, HelpCircle, Clock, Share, User, Cookie, RefreshCw } from 'lucide-react';
import { motion } from "framer-motion";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [agreeTimestamp, setAgreeTimestamp] = useState<string | null>(null);
  const policyRef = useRef<HTMLDivElement>(null);
  
  // Check if user has already agreed to the policy
  useEffect(() => {
    const storedAgreement = localStorage.getItem('privacyPolicyAgreed');
    if (storedAgreement) {
      setHasAgreed(true);
      setAgreeTimestamp(storedAgreement);
    }
  }, []);
  
  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Monitor scrolling to detect if user has viewed the entire policy
  useEffect(() => {
    const handleScroll = () => {
      if (policyRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = policyRef.current;
        // Check if user has scrolled at least 80% of the content
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
          setHasScrolled(true);
        }
      }
    };
    
    const policyElement = policyRef.current;
    if (policyElement) {
      policyElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (policyElement) {
        policyElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  const handleAgree = () => {
    const timestamp = new Date().toISOString();
    setHasAgreed(true);
    setAgreeTimestamp(timestamp);
    localStorage.setItem('privacyPolicyAgreed', timestamp);
    setShowConfirmation(true);
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white">
      {/* Top navigation */}
      
      
      {/* Main content area */}
      <div className={`flex-grow flex flex-col transition-opacity text-justify duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 p-4 border-b border-white/10">
        <motion.button
            onClick={() => window.location.href = '/contact'}
            className="group flex items-center gap-3 px-4 py-2 rounded-lg mt-4 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 hover:border-blue-600/50 text-gray-300 hover:text-white transition-all duration-300"
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
            <span className="font-medium">Back to contact</span>
          </motion.button>
          <div className="max-w-5xl mx-auto">
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
            </div>
            <p className="text-gray-300 max-w-3xl">
              This Privacy Policy outlines how Cybersecurity Umbrella collects, uses, maintains, and discloses 
              information collected from users of our AIML Project Dashboard. Your privacy and the security of your data 
              are important to us, and we are committed to protecting it.
            </p>
            <div className="mt-4 text-sm text-gray-400">
              Last Updated: March 30, 2025
            </div>
          </div>
        </div>
        
        {/* Content with policy and agreement section */}
        <div className="flex flex-col md:flex-row flex-grow text-justify">
          {/* Left side: scrollable policy content */}
          <div 
            ref={policyRef}
            className="flex-grow md:w-3/4 p-6 md:p-8 overflow-y-auto"
            style={{ maxHeight: 'calc(165vh - 180px)' }}
          >
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-400" />
                  Introduction
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    Cybersecurity Umbrella ("we", "our", or "us") is committed to protecting the privacy of all users ("user", "you", or "your") 
                    of our AIML Project Dashboard platform. This Privacy Policy explains what information we collect, how we use it, and the choices 
                    you have concerning the use of such information.
                  </p>
                  <p>
                    Our AIML Project Dashboard serves as a central platform for employees to access, manage, and collaborate on artificial intelligence 
                    and machine learning projects within the company. By accessing or using our platform, you agree to the terms outlined in this Privacy Policy.
                  </p>
                </div>
              </section>
              
              {/* Information Collection */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Database className="mr-2 h-5 w-5 text-blue-400" />
                  Information We Collect
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    We collect several types of information for various purposes to improve our service and ensure compliance with regulatory requirements:
                  </p>
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Full name and employee ID</li>
                    <li>Work email address and contact information</li>
                    <li>Department and role within the organization</li>
                    <li>Authentication credentials (username, password hash)</li>
                    <li>Profile pictures (optional)</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Usage Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Login and access timestamps</li>
                    <li>IP addresses and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and features used within the dashboard</li>
                    <li>Project access patterns and contribution metrics</li>
                    <li>Session duration and activity logs</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Project-Related Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Project contributions and interactions</li>
                    <li>Comments, feedback, and communication logs</li>
                    <li>File access and modification records</li>
                    <li>Project permission settings and role assignments</li>
                  </ul>
                </div>
              </section>
              
              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Server className="mr-2 h-5 w-5 text-blue-400" />
                  How We Use Your Information
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>We use the collected information for the following purposes:</p>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Operational Purposes</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To provide, maintain, and improve the AIML Project Dashboard</li>
                    <li>To authenticate users and manage access permissions</li>
                    <li>To facilitate collaboration between team members on projects</li>
                    <li>To generate insights about project progress and resource allocation</li>
                    <li>To provide technical support and respond to inquiries</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Security and Compliance</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To protect the security and integrity of our platform</li>
                    <li>To detect and prevent unauthorized access or fraudulent activities</li>
                    <li>To maintain audit trails for compliance with internal policies</li>
                    <li>To comply with legal obligations and regulatory requirements</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Analytics and Improvement</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To analyze usage patterns and optimize the user experience</li>
                    <li>To measure and improve the effectiveness of our platform</li>
                    <li>To develop new features and capabilities based on user feedback</li>
                    <li>To generate anonymized reports on platform usage for management</li>
                  </ul>
                </div>
              </section>
              
              {/* Data Protection */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-blue-400" />
                  Data Protection and Security
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    We implement appropriate technical and organizational measures to protect your information against 
                    unauthorized access, disclosure, alteration, and destruction:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All data transmitted between your device and our servers is encrypted using TLS/SSL</li>
                    <li>Authentication credentials are securely hashed using industry-standard algorithms</li>
                    <li>Access to personal data is strictly limited to authorized personnel</li>
                    <li>Regular security assessments and penetration testing</li>
                    <li>Multi-factor authentication for administrative access</li>
                    <li>Encryption of sensitive data at rest</li>
                    <li>Regular security awareness training for all staff</li>
                    <li>Comprehensive logging and monitoring for security events</li>
                    <li>Incident response procedures that comply with industry best practices</li>
                  </ul>
                  
                  <p className="mt-4">
                    Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure. 
                    While we strive to use commercially acceptable means to protect your information, we cannot guarantee its 
                    absolute security.
                  </p>
                </div>
              </section>
              
              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-400" />
                  Data Retention
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                    unless a longer retention period is required or permitted by law:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Active account information is retained for the duration of your employment</li>
                    <li>Project access logs are retained for 2 years for security and audit purposes</li>
                    <li>Authentication logs are maintained for 1 year for security monitoring</li>
                    <li>Backup data is retained according to our disaster recovery policy</li>
                    <li>When an employee leaves the organization, their personal information is anonymized within 90 days</li>
                  </ul>
                  
                  <p className="mt-4">
                    You may request deletion of your personal information at any time, subject to legal and legitimate 
                    business requirements.
                  </p>
                </div>
              </section>
              
              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Share className="mr-2 h-5 w-5 text-blue-400" />
                  Information Sharing and Disclosure
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    We do not sell, trade, or rent your personal information to third parties. We may share your 
                    information in the following limited circumstances:
                  </p>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Internal Use</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With authorized employees and departments on a need-to-know basis</li>
                    <li>For collaboration on AIML projects as required by your role</li>
                    <li>With management for performance evaluation and resource allocation</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Service Providers</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With trusted third-party service providers who assist us in operating the platform</li>
                    <li>With cloud infrastructure providers that host our application</li>
                    <li>With analytics and monitoring services to improve our platform</li>
                  </ul>
                  <p>All service providers are bound by contractual obligations to keep your information confidential and secure.</p>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Legal Requirements</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To comply with applicable laws, regulations, or legal processes</li>
                    <li>To protect our rights, property, or safety</li>
                    <li>To respond to a legal request or court order</li>
                    <li>During corporate restructuring, merger, or acquisition</li>
                  </ul>
                </div>
              </section>
              
              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-400" />
                  Your Rights and Choices
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    As an employee using the AIML Project Dashboard, you have certain rights regarding your information:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> You can request access to your personal information we maintain</li>
                    <li><strong>Correction:</strong> You can request correction of inaccurate or incomplete information</li>
                    <li><strong>Deletion:</strong> You can request deletion of your information, subject to legal requirements</li>
                    <li><strong>Objection:</strong> You can object to specific processing of your information</li>
                    <li><strong>Restriction:</strong> You can request limitation on how we use your information</li>
                    <li><strong>Portability:</strong> You can request a copy of your information in a structured format</li>
                    <li><strong>Consent withdrawal:</strong> You can withdraw consent for optional features</li>
                  </ul>
                  
                  <p className="mt-4">
                    To exercise any of these rights, please contact our privacy officer at privacy@cybersecurityumbrella.com. 
                    We will respond to your request within 30 days.
                  </p>
                </div>
              </section>
              
              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Cookie className="mr-2 h-5 w-5 text-blue-400" />
                  Cookies and Tracking Technologies
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    Our platform uses cookies and similar tracking technologies to enhance your experience and collect 
                    information about how you use the dashboard:
                  </p>
                  
                  <h3 className="text-xl font-medium text-blue-300 mt-4 mb-2">Types of Cookies We Use</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential cookies:</strong> Required for basic functionality and security</li>
                    <li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
                    <li><strong>Analytics cookies:</strong> Help us understand how you use our platform</li>
                  </ul>
                  
                  <p className="mt-4">
                    You can control cookies through your browser settings. However, disabling certain cookies may 
                    affect the functionality of the dashboard.
                  </p>
                </div>
              </section>
              
              {/* Compliance */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-400" />
                  Compliance with Regulations
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    Our privacy practices are designed to comply with applicable data protection laws and regulations, including:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>General Data Protection Regulation (GDPR):</strong> For employees in the European Union</li>
                    <li><strong>California Consumer Privacy Act (CCPA):</strong> For employees in California</li>
                    <li><strong>Personal Information Protection and Electronic Documents Act (PIPEDA):</strong> For employees in Canada</li>
                    <li><strong>ISO 27001:</strong> Information Security Management standards</li>
                    <li><strong>NIST Privacy Framework:</strong> For managing privacy risks</li>
                    <li><strong>AI Ethics and Governance Frameworks:</strong> For responsible AI development</li>
                  </ul>
                  
                  <p className="mt-4">
                    We regularly review our privacy practices to ensure ongoing compliance with evolving regulations 
                    and industry standards.
                  </p>
                </div>
              </section>
              
              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
                  Changes to This Privacy Policy
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, the platform, 
                    or legal requirements. We will notify you of any material changes by:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Posting a notice on the dashboard</li>
                    <li>Sending an email notification to your work email</li>
                    <li>Requiring re-acknowledgment of the updated policy</li>
                  </ul>
                  
                  <p className="mt-4">
                    The date at the top of this policy indicates when it was last updated. We encourage you to review 
                    this Privacy Policy periodically to stay informed about how we protect your information.
                  </p>
                </div>
              </section>
              
              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-blue-400" />
                  Contact Us
                </h2>
                <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700/50 space-y-4">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your 
                    information, please contact us at:
                  </p>
                  
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 mt-4">
                    <p className="font-medium text-blue-300">Privacy Officer</p>
                    <p>Cybersecurity Umbrella</p>
                    <p>Email: privacy@cybersecurityumbrella.com</p>
                    <p>Phone: +91-709-602-2911</p>
                    <p>Address: Adajan, Surat, Gujarat, India</p>
                  </div>
                  
                  <p className="mt-4">
                    We are committed to addressing your concerns and will respond to any inquiry within 72 hours.
                  </p>
                </div>
              </section>
            </div>
          </div>
          
          {/* Right side: agreement section */}
          <div className="md:w-1/4 bg-gray-900/50 border-t md:border-t-0 md:border-l border-white/10 p-6">
            <div className="sticky top-6 space-y-6">
              <div className="bg-blue-900/30 p-5 rounded-lg border border-blue-700/30">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-400" />
                  Policy Verification
                </h3>
                
                {hasAgreed ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">You have accepted this policy</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Agreed on: <span className="text-blue-300">{formatDate(agreeTimestamp || '')}</span>
                    </p>
                    <p className="text-sm text-gray-300 mt-3">
                      Your agreement to this Privacy Policy has been recorded. You may continue using the platform.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-300 mb-4">
                      Please read through our Privacy Policy to understand how we collect, use, and protect your information.
                    </p>
                    <div className={`mb-6 p-3 rounded-lg ${hasScrolled ? 'bg-green-700/20 text-green-300 border border-green-600/30' : 'bg-yellow-700/20 text-yellow-300 border border-yellow-600/30'}`}>
                      {hasScrolled ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Thank you for reading our policy</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          <span>Please scroll through the entire policy</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAgree}
                      disabled={!hasScrolled}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        hasScrolled
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      I Agree to Privacy Policy
                    </button>
                  </div>
                )}
              </div>
              
              {/* Policy Navigation */}
              <div className="bg-gray-800/30 p-5 rounded-lg border border-gray-700/50 hidden md:block">
                <h3 className="text-lg font-medium text-white mb-3">Policy Sections</h3>
                <nav className="space-y-2">
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Introduction</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Information We Collect</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">How We Use Your Information</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Data Protection and Security</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Data Retention</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Information Sharing</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Your Rights and Choices</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Cookies and Tracking</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Compliance with Regulations</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Changes to This Policy</a>
                  <a href="#" className="block p-2 text-sm text-blue-400 hover:bg-gray-700/30 rounded">Contact Us</a>
                </nav>
              </div>
              
              {/* Additional Help */}
              <div className="bg-gray-800/30 p-5 rounded-lg border border-gray-700/50 hidden md:block">
                <h3 className="text-lg font-medium text-white mb-3">Need Help?</h3>
                <p className="text-sm text-gray-300 mb-4">
                  If you have questions about our privacy practices, please contact our Privacy Officer.
                </p>
                <a 
                  href="mailto:privacy@cybersecurityumbrella.com" 
                  className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded text-center text-sm transition-colors"
                >
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation overlay */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-green-500/30 rounded-lg p-6 max-w-md mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-medium text-white">Privacy Policy Accepted</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Thank you for reading and accepting our Privacy Policy. Your agreement has been recorded and will be stored for compliance purposes.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;