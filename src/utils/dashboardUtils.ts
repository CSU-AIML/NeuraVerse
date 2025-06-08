// utils/dashboardUtils.ts

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce, throttle } from 'lodash';
import DOMPurify from 'dompurify';

// ========== SECURITY UTILITIES ==========

export class SecurityManager {
  private static instance: SecurityManager;
  private rateLimiters: Map<string, RateLimiter> = new Map();

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Advanced input sanitization
  sanitizeInput(input: any, options: SanitizationOptions = {}): string {
    if (typeof input !== 'string') {
      return '';
    }

    const {
      maxLength = 1000,
      allowHtml = false,
      stripUrls = false,
      allowedProtocols = ['http:', 'https:']
    } = options;

    let sanitized = input;

    // Remove potentially dangerous patterns
    if (!allowHtml) {
      sanitized = DOMPurify.sanitize(sanitized, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }

    // Strip dangerous protocols
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/file:/gi, '');

    // Handle URL validation
    if (stripUrls) {
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[URL]');
    }

    // Limit length and trim
    return sanitized.trim().slice(0, maxLength);
  }

  // URL validation with security checks
  validateUrl(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { isValid: false, error: 'Invalid protocol' };
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /\.exe$/i,
        /\.bat$/i,
        /\.scr$/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
          return { isValid: false, error: 'Suspicious URL pattern detected' };
        }
      }

      return { isValid: true, sanitizedUrl: parsedUrl.toString() };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  // Get or create rate limiter for specific operation
  getRateLimiter(operation: string, maxCalls: number = 10, timeWindow: number = 60000): RateLimiter {
    const key = `${operation}_${maxCalls}_${timeWindow}`;
    
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, new RateLimiter(maxCalls, timeWindow));
    }

    return this.rateLimiters.get(key)!;
  }

  // Content Security Policy header generation
  generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
}

export class RateLimiter {
  private calls: number[] = [];
  
  constructor(
    private maxCalls: number,
    private timeWindow: number
  ) {}

  canMakeCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(call => now - call < this.timeWindow);
    
    if (this.calls.length >= this.maxCalls) {
      return false;
    }
    
    this.calls.push(now);
    return true;
  }

  getRemainingCalls(): number {
    const now = Date.now();
    const validCalls = this.calls.filter(call => now - call < this.timeWindow);
    return Math.max(0, this.maxCalls - validCalls.length);
  }

  getResetTime(): number {
    if (this.calls.length === 0) return 0;
    return Math.max(0, this.calls[0] + this.timeWindow - Date.now());
  }
}

// ========== PERFORMANCE UTILITIES ==========

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  startMonitoring(): void {
    // Monitor Long Tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              type: 'longtask',
              duration: entry.duration,
              timestamp: entry.startTime,
              details: { name: entry.name }
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task monitoring not supported');
      }

      // Monitor Layout Shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              type: 'layout-shift',
              duration: (entry as any).value,
              timestamp: entry.startTime,
              details: { hadRecentInput: (entry as any).hadRecentInput }
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log warnings for performance issues
    if (metric.type === 'longtask' && metric.duration > 50) {
      console.warn(`Long task detected: ${metric.duration.toFixed(2)}ms`);
    }
    
    if (metric.type === 'layout-shift' && metric.duration > 0.1) {
      console.warn(`Layout shift detected: ${metric.duration.toFixed(4)}`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageMetric(type: string): number {
    const typeMetrics = this.metrics.filter(m => m.type === type);
    if (typeMetrics.length === 0) return 0;
    
    const sum = typeMetrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / typeMetrics.length;
  }

  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// ========== LAZY LOADING UTILITIES ==========

export class ImageCache {
  private cache = new Map<string, CachedImage>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number = 50, maxAge: number = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(url: string): HTMLImageElement | null {
    const cached = this.cache.get(url);
    
    if (!cached) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(url);
      return null;
    }

    // Update access time for LRU
    cached.lastAccessed = Date.now();
    return cached.image;
  }

  set(url: string, image: HTMLImageElement): void {
    // Cleanup old entries if at max size
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(url, {
      image,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
  }

  private cleanup(): void {
    // Remove expired entries first
    const now = Date.now();
    for (const [url, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.maxAge) {
        this.cache.delete(url);
      }
    }

    // If still at max size, remove least recently used
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.3));
      toRemove.forEach(([url]) => this.cache.delete(url));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need hit/miss tracking for accurate rate
    };
  }
}

// ========== SMOOTH SCROLLING UTILITIES ==========

export const EasingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
};

export class SmoothScroller {
  private animationId: number | null = null;

  scrollTo(
    target: HTMLElement | string,
    options: ScrollOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const {
        duration = 800,
        easing = EasingFunctions.easeInOutCubic,
        offset = 0,
        behavior = 'smooth'
      } = options;

      // Cancel any existing animation
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      const targetElement = typeof target === 'string' 
        ? document.querySelector(target) as HTMLElement
        : target;

      if (!targetElement) {
        console.warn('Target element not found');
        resolve();
        return;
      }

      const startPosition = window.pageYOffset;
      const targetPosition = targetElement.getBoundingClientRect().top + startPosition - offset;
      const distance = targetPosition - startPosition;
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const easedProgress = easing(progress);
        const currentPosition = startPosition + (distance * easedProgress);
        
        window.scrollTo(0, currentPosition);
        
        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          this.animationId = null;
          resolve();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    });
  }

  scrollToTop(options: ScrollOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      const {
        duration = 600,
        easing = EasingFunctions.easeOutQuad
      } = options;

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      const startPosition = window.pageYOffset;
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const easedProgress = easing(progress);
        const currentPosition = startPosition * (1 - easedProgress);
        
        window.scrollTo(0, currentPosition);
        
        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          this.animationId = null;
          resolve();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    });
  }

  cancel(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// ========== REACT HOOKS ==========

// Enhanced intersection observer hook
export const useIntersectionObserver = (
  options: IntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    skip = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (skip) return;

    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (triggerOnce && hasTriggered) return;
        
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered, skip]);

  return { elementRef, isIntersecting, hasTriggered };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const monitorRef = useRef<PerformanceMonitor>();
  const renderStartTime = useRef<number>();

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor();
    monitorRef.current.startMonitoring();

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stopMonitoring();
      }
    };
  }, []);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current && monitorRef.current) {
      const renderTime = performance.now() - renderStartTime.current;
      
      monitorRef.current.recordMetric({
        type: 'render',
        duration: renderTime,
        timestamp: Date.now(),
        details: { component: 'dashboard' }
      });

      setMetrics(monitorRef.current.getMetrics());

      if (renderTime > 16) {
        console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, []);

  const getAverageRenderTime = useCallback(() => {
    if (!monitorRef.current) return 0;
    return monitorRef.current.getAverageMetric('render');
  }, []);

  return {
    startRender,
    endRender,
    getAverageRenderTime,
    metrics
  };
};

// Smooth scroll hook
export const useSmoothScroll = () => {
  const scrollerRef = useRef<SmoothScroller>();

  useEffect(() => {
    scrollerRef.current = new SmoothScroller();

    return () => {
      if (scrollerRef.current) {
        scrollerRef.current.cancel();
      }
    };
  }, []);

  const scrollToElement = useCallback((target: HTMLElement | string, options?: ScrollOptions) => {
    if (scrollerRef.current) {
      return scrollerRef.current.scrollTo(target, options);
    }
    return Promise.resolve();
  }, []);

  const scrollToTop = useCallback((options?: ScrollOptions) => {
    if (scrollerRef.current) {
      return scrollerRef.current.scrollToTop(options);
    }
    return Promise.resolve();
  }, []);

  return { scrollToElement, scrollToTop };
};

// Debounced search hook
export const useDebouncedSearch = (
  initialValue: string = '',
  delay: number = 300
) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  const debouncedSetQuery = useMemo(
    () => debounce((query: string) => {
      setDebouncedQuery(SecurityManager.getInstance().sanitizeInput(query));
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetQuery(searchQuery);
    
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [searchQuery, debouncedSetQuery]);

  const setQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    setQuery
  };
};

// Image preloader hook
export const useImagePreloader = () => {
  const cache = useRef(new ImageCache());

  const preloadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cached = cache.current.get(src);
      if (cached) {
        resolve(cached);
        return;
      }

      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        cache.current.set(src, img);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image'));
      };

      img.src = SecurityManager.getInstance().validateUrl(src).sanitizedUrl || '';
    });
  }, []);

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => preloadImage(url).catch(() => null));
    await Promise.allSettled(promises);
  }, [preloadImage]);

  const getCacheStats = useCallback(() => {
    return cache.current.getStats();
  }, []);

  return {
    preloadImage,
    preloadImages,
    getCacheStats
  };
};

// ========== TYPE DEFINITIONS ==========

interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  stripUrls?: boolean;
  allowedProtocols?: string[];
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

interface PerformanceMetric {
  type: string;
  duration: number;
  timestamp: number;
  details?: Record<string, any>;
}

interface CachedImage {
  image: HTMLImageElement;
  timestamp: number;
  lastAccessed: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
}

interface ScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
  behavior?: 'smooth' | 'auto';
}

interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
}

// ========== EXPORTS ==========

export {
  type SanitizationOptions,
  type ValidationResult,
  type PerformanceMetric,
  type CachedImage,
  type CacheStats,
  type ScrollOptions,
  type IntersectionObserverOptions
};