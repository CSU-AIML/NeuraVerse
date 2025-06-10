// utils/gsapSetup.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Smooth scroll setup function
export const initSmoothScroll = () => {
  // Note: ScrollSmoother is a premium plugin
  // If you don't have access, we'll use an alternative approach
  
  try {
    // Premium ScrollSmoother approach
    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.5, // seconds to "catch up" to native scroll position
      effects: true, // look for data-speed and data-lag attributes on elements
      smoothTouch: 0.1, // for mobile devices
      normalizeScroll: true, // prevents momentum scrolling on Safari
    });

    return smoother;
  } catch (error) {
    console.log('ScrollSmoother not available, using alternative smooth scroll');
    
    // Alternative smooth scroll using CSS and ScrollTrigger
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Enhanced smooth scrolling for better control
    let scrollTimeout: NodeJS.Timeout;
    
    const smoothScroll = (e: WheelEvent) => {
      e.preventDefault();
      
      clearTimeout(scrollTimeout);
      
      const delta = e.deltaY;
      const scrollSpeed = 0.8; // Adjust speed
      
      window.scrollBy({
        top: delta * scrollSpeed,
        behavior: 'smooth'
      });
      
      scrollTimeout = setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
      }, 50);
    };
    
    // Apply smooth scroll to wheel events
    window.addEventListener('wheel', smoothScroll, { passive: false });
    
    return null;
  }
};

// Scroll animations setup
export const initScrollAnimations = () => {
  // Batch refresh ScrollTrigger
  ScrollTrigger.batch('.animate-on-scroll', {
    onEnter: (elements) => {
      gsap.fromTo(elements, {
        opacity: 0,
        y: 60,
        scale: 0.95,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.1,
      });
    },
    onLeave: (elements) => {
      gsap.to(elements, {
        opacity: 0.3,
        duration: 0.5,
      });
    },
    onEnterBack: (elements) => {
      gsap.to(elements, {
        opacity: 1,
        duration: 0.5,
      });
    },
  });

  // Parallax effect for elements with data-speed attribute
  gsap.utils.toArray('[data-speed]').forEach((element: any) => {
    const speed = parseFloat(element.getAttribute('data-speed'));
    
    gsap.to(element, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Text reveal animation
  gsap.utils.toArray('.text-reveal').forEach((element: any) => {
    const chars = element.textContent.split('');
    element.innerHTML = chars.map((char: string) => 
      `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');

    gsap.fromTo(element.querySelectorAll('.char'), {
      opacity: 0,
      y: 50,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.05,
      stagger: 0.02,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Scale animation for cards/components
  gsap.utils.toArray('.scale-on-scroll').forEach((element: any) => {
    gsap.fromTo(element, {
      scale: 0.8,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Slide in from different directions
  gsap.utils.toArray('.slide-left').forEach((element: any) => {
    gsap.fromTo(element, {
      x: -100,
      opacity: 0,
    }, {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  gsap.utils.toArray('.slide-right').forEach((element: any) => {
    gsap.fromTo(element, {
      x: 100,
      opacity: 0,
    }, {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Stagger animation for lists
  gsap.utils.toArray('.stagger-children').forEach((parent: any) => {
    const children = parent.children;
    
    gsap.fromTo(children, {
      opacity: 0,
      y: 30,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: parent,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });
};

// Page transition animations
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Loading animation
export const createLoadingAnimation = () => {
  const tl = gsap.timeline();
  
  // Animate loading screen out
  tl.to('.loading-screen', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.inOut',
  })
  .to('.loading-screen', {
    display: 'none',
    duration: 0,
  })
  .from('.main-content > *', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out',
  }, '-=0.3');
  
  return tl;
};

// Cleanup function
export const cleanupGSAP = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.killTweensOf('*');
};