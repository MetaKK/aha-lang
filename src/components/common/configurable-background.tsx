"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundConfig } from '@/config/backgrounds';

interface ConfigurableBackgroundProps {
  config: BackgroundConfig;
  children: React.ReactNode;
  className?: string;
}

export function ConfigurableBackground({ 
  config, 
  children, 
  className = '' 
}: ConfigurableBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 处理视频加载
  useEffect(() => {
    if (config.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedData = () => {
        setIsLoaded(true);
      };

      const handleError = () => {
        console.warn('Video failed to load, falling back to poster');
        setIsLoaded(true);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };
    } else {
      setIsLoaded(true);
    }
  }, [config.type]);

  // 渲染背景内容
  const renderBackground = () => {
    switch (config.type) {
      case 'image':
        return (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${config.src})`,
              filter: `
                blur(${config.blur || 0}px) 
                brightness(${config.brightness || 1}) 
                contrast(${config.contrast || 1})
              `,
            }}
          />
        );

      case 'video':
        return (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={config.poster}
              style={{
                filter: `
                  blur(${config.blur || 0}px) 
                  brightness(${config.brightness || 1}) 
                  contrast(${config.contrast || 1})
                `,
              }}
            >
              <source src={config.src} type="video/mp4" />
            </video>
            {!isLoaded && config.poster && (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${config.poster})`,
                  filter: `
                    blur(${config.blur || 0}px) 
                    brightness(${config.brightness || 1}) 
                    contrast(${config.contrast || 1})
                  `,
                }}
              />
            )}
          </>
        );

      case 'gradient':
        return (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: config.gradient?.via
                ? `linear-gradient(to bottom right, ${config.gradient.from}, ${config.gradient.via}, ${config.gradient.to})`
                : `linear-gradient(to bottom right, ${config.gradient?.from}, ${config.gradient?.to})`,
            }}
          />
        );

      default:
        return null;
    }
  };

  // 动画配置
  const getAnimationProps = () => {
    if (!config.animation || config.animation.type === 'none') {
      return {};
    }

    const baseProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: {
        duration: config.animation.duration || 1,
        delay: config.animation.delay || 0,
      },
    };

    switch (config.animation.type) {
      case 'fade':
        return baseProps;
      
      case 'slide':
        return {
          ...baseProps,
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        };
      
      case 'parallax':
        return {
          ...baseProps,
          animate: {
            opacity: 1,
            y: [0, -20, 0],
          },
          transition: {
            duration: config.animation.duration || 20,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        };
      
      default:
        return baseProps;
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 背景层 */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        {...getAnimationProps()}
      >
        {renderBackground()}
      </motion.div>

      {/* 遮罩层 */}
      {config.overlay && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: config.overlay.color,
            opacity: config.overlay.opacity,
          }}
        />
      )}

      {/* 内容层 */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
