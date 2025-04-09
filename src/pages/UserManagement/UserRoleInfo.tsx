// pages/UserManagement/UserRoleInfo.tsx
import React from 'react';
import { User, Shield, Check, X, UserCog, Info } from 'lucide-react';

const UserRoleInfo: React.FC = () => {
  return (
    <div className="mt-8 p-6 bg-gray-900/60 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-white">About User Roles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="flex items-center text-blue-400 font-medium">
            <User className="h-5 w-5 mr-2" />
            Standard Users
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
              <span>Can browse and use existing projects</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
              <span>Can access project documentation</span>
            </li>
            <li className="flex items-start">
              <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
              <span>Cannot create or modify projects</span>
            </li>
            <li className="flex items-start">
              <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
              <span>Cannot manage other users</span>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="flex items-center text-purple-400 font-medium">
            <Shield className="h-5 w-5 mr-2" />
            Admin Users
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Can create new projects</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Can edit and delete existing projects</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Can promote regular users to admin role</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Full access to all system features</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* User management actions section */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h3 className="text-lg font-medium mb-4 text-white">User Management Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="flex items-center text-blue-400 font-medium">
              <UserCog className="h-5 w-5 mr-2" />
              Promote User
            </h4>
            <p className="text-sm text-gray-300">
              Grants administrative privileges to a standard user, allowing them to manage projects and other users.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center text-orange-400 font-medium">
              <User className="h-5 w-5 mr-2" />
              Demote Admin
            </h4>
            <p className="text-sm text-gray-300">
              Removes administrative privileges, converting an admin back to a standard user with limited access.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center text-red-400 font-medium">
              <X className="h-5 w-5 mr-2" />
              Remove User
            </h4>
            <p className="text-sm text-gray-300">
              Permanently removes a user from the system. This action cannot be undone and will delete all user data.
            </p>
          </div>
        </div>
      </div>
      
      {/* Google Authentication section */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h3 className="text-lg font-medium mb-4 text-white">Google Authentication</h3>
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            The system now uses Google Authentication for secure sign-in. Users authenticate with their Google accounts, and their profile information is synchronized automatically. Admin privileges are assigned based on email address or can be manually set using the promote/demote actions.
          </p>
          <div className="mt-3 flex items-center">
            <Info className="h-5 w-5 text-blue-400 mr-2" />
            <p className="text-sm text-blue-300">
              Certain email addresses are automatically granted admin status for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleInfo;