"use client"
import React, { createContext, useContext, useRef, useEffect } from 'react';

interface AudioContextProps {
  children: React.ReactNode;
}

interface AudioContextValue {
  audioContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<AudioContextProps> = ({ children }) => {
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = document.createElement('audio');
    // Set audio properties...

    if (audioContainerRef.current) {
      audioContainerRef.current.appendChild(audio);
    }

    return () => {
      if (audioContainerRef.current) {
        audioContainerRef.current.removeChild(audio);
      }
    };
  }, []);

  const contextValue: AudioContextValue = { audioContainerRef };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
