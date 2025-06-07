import Loader from '../loader';

const DashboardLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-gray-950/90 backdrop-blur-sm flex items-center justify-center">
      <div className="animate-pulse">
        <Loader />
      </div>
    </div>
  );
};

export default DashboardLoader;