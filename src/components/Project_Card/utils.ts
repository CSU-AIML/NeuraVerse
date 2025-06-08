// components/project_card/utils.ts
import {
  Archive,
  CheckCircle,
  Zap,
  Activity,
  Clock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export const getStatusConfig = (status?: string) => {
  const configs = {
    ongoing: {
      color: "emerald",
      icon: Zap,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400"
    },
    completed: {
      color: "blue", 
      icon: CheckCircle,
      bg: "bg-blue-500/10",
      border: "border-blue-500/30", 
      text: "text-blue-400",
      dot: "bg-blue-400"
    },
    archived: {
      color: "gray",
      icon: Archive,
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
      text: "text-gray-400", 
      dot: "bg-gray-400"
    },
    live: {
      color: "purple",
      icon: Activity,
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      dot: "bg-purple-400"
    },
    paused: {
      color: "amber",
      icon: Clock,
      bg: "bg-amber-500/10", 
      border: "border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400"
    },
    planning: {
      color: "orange",
      icon: Calendar,
      bg: "bg-orange-500/10",
      border: "border-orange-500/30", 
      text: "text-orange-400",
      dot: "bg-orange-400"
    }
  };

  return configs[status?.toLowerCase() as keyof typeof configs] || configs.ongoing;
};

export const getPriorityConfig = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return {
        bg: "bg-red-500/15",
        border: "border-red-500/40",
        text: "text-red-400",
        icon: "🔥"
      };
    case "medium":
      return {
        bg: "bg-blue-500/15", 
        border: "border-blue-500/40",
        text: "text-blue-400",
        icon: "⭐"
      };
    case "low":
      return {
        bg: "bg-gray-500/15",
        border: "border-gray-500/40", 
        text: "text-gray-400",
        icon: "📋"
      };
    default:
      return null;
  }
};

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Not specified";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    console.error("Invalid date format:", dateString, e);
    return "Invalid date";
  }
};