interface ProjectMetricProps {
  value: string;
  label: string;
  trend?: string;
  size?: "small" | "normal" | "large";
}

const ProjectMetric = ({ value, label, trend, size = "normal" }: ProjectMetricProps) => {
  const textSizes = {
    small: "text-2xl",
    normal: "text-3xl", 
    large: "text-4xl"
  };
  
  return (
    <div className="flex flex-col items-center p-3 bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-lg backdrop-blur-sm border border-slate-600/30">
      <div className={`${textSizes[size]} font-bold text-white mb-1`}>{value}</div>
      <div className="text-sm text-slate-300 text-center leading-tight">{label}</div>
      {trend && <div className="text-xs text-emerald-400 mt-1">{trend}</div>}
    </div>
  );
};

export default ProjectMetric;