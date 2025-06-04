// UserManagement/SecurityInfo.tsx - NEW COMPONENT
import React, { useState } from 'react';
import { Shield, Lock, Key, AlertTriangle, Info, Eye, EyeOff, CheckCircle } from 'lucide-react';

const SecurityInfo: React.FC = () => {
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);

  return (
    <div className="mt-8 space-y-6">
      {/* Password Security Notice */}
      <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-600/20 border border-amber-500/30 rounded-xl">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-300 mb-2">
              🔒 Password Security Policy
            </h3>
            <p className="text-amber-100/90 text-sm leading-relaxed mb-4">
              For security reasons, user passwords are never stored in plain text or displayed to administrators. 
              This follows industry-standard security practices to protect user privacy and prevent unauthorized access.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-amber-800/20 border border-amber-600/20 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-medium text-amber-200 mb-2">
                  <Lock className="w-4 h-4" />
                  What We Do
                </h4>
                <ul className="space-y-1 text-sm text-amber-100/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Passwords are encrypted (hashed)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Use Google OAuth for authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Provide password reset functionality
                  </li>
                </ul>
              </div>
              
              <div className="bg-red-900/20 border border-red-600/20 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-medium text-red-200 mb-2">
                  <EyeOff className="w-4 h-4" />
                  What We Don't Do
                </h4>
                <ul className="space-y-1 text-sm text-red-100/80">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    Never store plain text passwords
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    Never display passwords to admins
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    Never share authentication tokens
                  </li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm transition-colors"
            >
              {showPasswordPolicy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswordPolicy ? 'Hide' : 'Show'} Password Policy Details
            </button>
          </div>
        </div>
        
        {/* Expandable Password Policy */}
        {showPasswordPolicy && (
          <div className="mt-6 pt-6 border-t border-amber-700/30">
            <h4 className="font-medium text-amber-200 mb-3">🔐 Password Security Standards</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium text-amber-300">Encryption</h5>
                <ul className="space-y-1 text-amber-100/80">
                  <li>• bcrypt hashing algorithm</li>
                  <li>• Minimum 12 salt rounds</li>
                  <li>• Unique salt per password</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-amber-300">Requirements</h5>
                <ul className="space-y-1 text-amber-100/80">
                  <li>• Minimum 8 characters</li>
                  <li>• Mixed case letters</li>
                  <li>• Numbers and symbols</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-amber-300">Protection</h5>
                <ul className="space-y-1 text-amber-100/80">
                  <li>• Encrypted in transit (HTTPS)</li>
                  <li>• Encrypted at rest</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Alternatives */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl">
            <Key className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-300 mb-2">
              🛠️ Admin Tools Available
            </h3>
            <p className="text-blue-100/90 text-sm leading-relaxed mb-4">
              Instead of viewing passwords, here are the security tools available to administrators:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-200">User Management</h4>
                <ul className="space-y-2 text-sm text-blue-100/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    View user email addresses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Check email verification status
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Monitor last login times
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Promote/demote user roles
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-blue-200">Security Actions</h4>
                <ul className="space-y-2 text-sm text-blue-100/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Trigger password reset emails
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Remove users from system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    View authentication logs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Manage user permissions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Information */}
      <div className="bg-gradient-to-r from-gray-900/40 to-slate-900/40 border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-600/20 border border-gray-500/30 rounded-xl">
            <Info className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-300 mb-2">
              📋 Compliance & Best Practices
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Our password security approach follows industry standards and compliance requirements:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-300 mb-2">GDPR Compliant</h4>
                <p className="text-gray-400">
                  User data protection and privacy rights are maintained according to GDPR requirements.
                </p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-300 mb-2">OWASP Standards</h4>
                <p className="text-gray-400">
                  Following OWASP top 10 security practices for web application security.
                </p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4">
                <h4 className="font-medium text-gray-300 mb-2">SOC 2 Ready</h4>
                <p className="text-gray-400">
                  Security controls designed to meet SOC 2 Type II audit requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfo;