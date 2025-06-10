// hooks/useGSAP.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll, initScrollAnimations, cleanupGSAP } from '../utils/gsapSetup';

// Hook for smooth scroll initialization
export const useSmoothScroll = () => {
  useEffect(() => {
    let smoother: any = null;
    
    const initScroll = () => {
      smoother = initSmoothScroll();
      initScrollAnimations();
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScroll);
    } else {
      initScroll();
    }

    return () => {
      cleanupGSAP();
      if (smoother) {
        smoother.kill();
      }
      document.removeEventListener('DOMContentLoaded', initScroll);
    };
  }, []);
};

// Hook for animating elements on mount
export const useGSAPAnimation = (
  animationType: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'text-reveal',
  delay: number = 0,
  duration: number = 1
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let animation: gsap.core.Tween;

    switch (animationType) {
      case 'fadeIn':
        animation = gsap.fromTo(element, 
          { opacity: 0 },
          { 
            opacity: 1, 
            duration, 
            delay, 
            ease: 'power2.out' 
          }
        );
        break;

      case 'slideUp':
        animation = gsap.fromTo(element,
          { opacity: 0, y: 50 },
          { 
            opacity: 1, 
            y: 0, 
            duration, 
            delay, 
            ease: 'power2.out' 
          }
        );
        break;

      case 'slideLeft':
        animation = gsap.fromTo(element,
          { opacity: 0, x: -50 },
          { 
            opacity: 1, 
            x: 0, 
            duration, 
            delay, 
            ease: 'power2.out' 
          }
        );
        break;

      case 'slideRight':
        animation = gsap.fromTo(element,
          { opacity: 0, x: 50 },
          { 
            opacity: 1, 
            x: 0, 
            duration, 
            delay, 
            ease: 'power2.out' 
          }
        );
        break;

      case 'scale':
        animation = gsap.fromTo(element,
          { opacity: 0, scale: 0.8 },
          { 
            opacity: 1, 
            scale: 1, 
            duration, 
            delay, 
            ease: 'back.out(1.7)' 
          }
        );
        break;

      case 'text-reveal':
        const chars = element.textContent?.split('') || [];
        element.innerHTML = chars.map(char => 
          `<span class="char" style="opacity: 0; transform: translateY(50px);">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');

        animation = gsap.to(element.querySelectorAll('.char'), {
          opacity: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.02,
          delay,
          ease: 'power2.out',
        });
        break;

      default:
        animation = gsap.fromTo(element, 
          { opacity: 0 },
          { 
            opacity: 1, 
            duration, 
            delay, 
            ease: 'power2.out' 
          }
        );
    }

    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [animationType, delay, duration]);

  return elementRef;
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  animationType: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale',
  triggerPoint: string = 'top 80%'
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let animation: gsap.core.Tween;

    const createAnimation = () => {
      switch (animationType) {
        case 'fadeIn':
          animation = gsap.fromTo(element, 
            { opacity: 0 },
            { 
              opacity: 1, 
              duration: 1, 
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: triggerPoint,
                toggleActions: 'play none none reverse',
              }
            }
          );
          break;

        case 'slideUp':
          animation = gsap.fromTo(element,
            { opacity: 0, y: 60 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 1, 
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: triggerPoint,
                toggleActions: 'play none none reverse',
              }
            }
          );
          break;

        case 'slideLeft':
          animation = gsap.fromTo(element,
            { opacity: 0, x: -60 },
            { 
              opacity: 1, 
              x: 0, 
              duration: 1, 
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: triggerPoint,
                toggleActions: 'play none none reverse',
              }
            }
          );
          break;

        case 'slideRight':
          animation = gsap.fromTo(element,
            { opacity: 0, x: 60 },
            { 
              opacity: 1, 
              x: 0, 
              duration: 1, 
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: triggerPoint,
                toggleActions: 'play none none reverse',
              }
            }
          );
          break;

        case 'scale':
          animation = gsap.fromTo(element,
            { opacity: 0, scale: 0.8 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 1, 
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: element,
                start: triggerPoint,
                toggleActions: 'play none none reverse',
              }
            }
          );
          break;
      }
    };

    // Create animation when ScrollTrigger is ready
    ScrollTrigger.refresh();
    createAnimation();

    return () => {
      if (animation) {
        animation.kill();
      }
    };
  }, [animationType, triggerPoint]);

  return elementRef;
};

// Hook for page transitions
export const usePageTransition = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = pageRef.current;
    if (!element) return;

    const tl = gsap.timeline();
    
    // Page enter animation
    tl.fromTo(element, 
      { 
        opacity: 0, 
        y: 20 
      },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: 'power2.out' 
      }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return pageRef;
};

// Hook for staggered children animations
export const useStaggerAnimation = (delay: number = 0.1) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children);

    const animation = gsap.fromTo(children,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: delay, 
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    return () => {
      animation.kill();
    };
  }, [delay]);

  return containerRef;
};