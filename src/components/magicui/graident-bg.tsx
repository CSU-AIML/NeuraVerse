import React, { useEffect, useRef, useState } from "react";

const GradientBackground = () => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setCurX((prev) => prev + (tgX - prev) / 20);
      setCurY((prev) => prev + (tgY - prev) / 20);

      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      }
    }, 1000 / 60);

    return () => clearInterval(moveInterval);
  }, [curX, curY, tgX, tgY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-[linear-gradient(40deg,hsl(var(--primary)),hsl(var(--background)))]">
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        className={`gradients-container h-full w-full blur-lg ${isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"}`}
      >
        {/* Using theme colors for gradients */}
        <div className="absolute [background:radial-gradient(circle_at_center,_hsl(var(--chart-1)/0.8)_0,_hsl(var(--chart-1)/0)_50%)_no-repeat] [mix-blend-mode:hard-light] w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] [transform-origin:center_center] animate-blob opacity-100" />
        
        <div className="absolute [background:radial-gradient(circle_at_center,_hsl(var(--chart-2)/0.8)_0,_hsl(var(--chart-2)/0)_50%)_no-repeat] [mix-blend-mode:hard-light] w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] [transform-origin:calc(50%-400px)] animate-blob animation-delay-2000 opacity-100" />
        
        <div className="absolute [background:radial-gradient(circle_at_center,_hsl(var(--chart-3)/0.8)_0,_hsl(var(--chart-3)/0)_50%)_no-repeat] [mix-blend-mode:hard-light] w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] [transform-origin:calc(50%+400px)] animate-blob opacity-100" />
        
        <div className="absolute [background:radial-gradient(circle_at_center,_hsl(var(--chart-4)/0.8)_0,_hsl(var(--chart-4)/0)_50%)_no-repeat] [mix-blend-mode:hard-light] w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] [transform-origin:calc(50%-200px)] animate-blob animation-delay-2000 opacity-70" />
        
        <div className="absolute [background:radial-gradient(circle_at_center,_hsl(var(--chart-5)/0.8)_0,_hsl(var(--chart-5)/0)_50%)_no-repeat] [mix-blend-mode:hard-light] w-[80%] h-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] [transform-origin:calc(50%-800px)_calc(50%+800px)] animate-blob opacity-100" />

        <div
          ref={interactiveRef}
          onMouseMove={handleMouseMove}
          className="absolute [background:radial-gradient(circle_at_center,_hsl(var(--primary)/0.8)_0,_hsl(var(--primary)/0)_50%)_no-repeat] [mix-blend-mode:hard-light] w-full h-full -top-1/2 -left-1/2 opacity-70"
        />
      </div>

      {/* Children content will be rendered here */}
      <div className="relative z-10 h-full w-full">
        {/* Content slot */}
      </div>
    </div>
  );
};

export default GradientBackground;