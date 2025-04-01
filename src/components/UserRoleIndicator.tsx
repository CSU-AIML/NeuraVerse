import { Shield } from 'lucide-react';
import { Button } from './ui/button';

interface UserRoleIndicatorProps {
  user: any;
}

const UserRoleIndicator = ({ user }: UserRoleIndicatorProps) => {
  return (
    <div className="relative group z-50">
      <Button
        variant="secondary"
        className={`
          group relative overflow-hidden backdrop-blur-xl shadow-lg 
          border-orange-500/30 bg-orange-600/40 hover:bg-orange-500/60 hover:border-orange-400/50 hover:shadow-orange-500/30 
          text-white 
          transform hover:scale-105 hover:-translate-y-0.5 
          transition-all duration-300 
          before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-20 before:transition-opacity
          flex items-center justify-between gap-3 px-4 py-2 min-w-[155px] h-9.9`}
      >
        <Shield className="w-5 h-5 text-orange-300" />
        <div className="flex flex-col items-end w-full mb-5 mr-2">
          <span className="font-medium transition-all duration-300 ease-in-out 
            group-hover:opacity-0 group-hover:translate-y-[-10px] absolute">
            Administrator
          </span>
          <span className="font-medium transition-all duration-300 ease-in-out 
            opacity-0 translate-y-[10px] group-hover:opacity-100 group-hover:translate-y-0 absolute">
            {user?.email?.split('@')[0] || 'Admin'}
          </span>
        </div>
      </Button>
    </div>
  );
};

export default UserRoleIndicator;