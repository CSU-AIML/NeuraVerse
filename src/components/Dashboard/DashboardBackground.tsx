import Waves from '../ui/Waves';

const DashboardBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Fixed waves background */}
      <div className="absolute inset-0">
        <Waves
          lineColor="rgba(255, 255, 255, 0.1)"
          backgroundColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </div>
      
      {/* Subtle overlay gradients - fixed */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(25,100,200,0.08),transparent_70%),radial-gradient(circle_at_80%_70%,rgba(100,50,255,0.05),transparent_50%)]"></div>
      
      {/* Animated subtle glow - fixed in viewport */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
    </div>
  );
};

export default DashboardBackground;