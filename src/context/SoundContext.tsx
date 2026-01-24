'use client';

import { createContext, useContext, useEffect, useRef, useCallback } from 'react';

interface SoundContextType {
    playClick: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function useSoundEffects() {
    const ctx = useContext(SoundContext);
    if (!ctx) {
        throw new Error('useSoundEffects must be used within SoundProvider');
    }
    return ctx;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const clickSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload the click sound
        clickSoundRef.current = new Audio('/sounds/button-click.mp3');
        clickSoundRef.current.volume = 0.4;

        // Global click listener for all interactive elements
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check for various interactive element types
            const isButton = target.tagName === 'BUTTON' || target.closest('button');
            const isLink = target.tagName === 'A' || target.closest('a');
            const hasButtonRole = target.getAttribute('role') === 'button' || target.closest('[role="button"]');
            const isClickable = target.classList.contains('cursor-pointer') || target.closest('.cursor-pointer');

            const isInteractive = isButton || isLink || hasButtonRole || isClickable;

            // Exclude game elements and input fields
            const isInGame = target.closest('[data-no-click-sound]');
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

            if (isInteractive && !isInGame && !isInput && clickSoundRef.current) {
                const sound = clickSoundRef.current.cloneNode() as HTMLAudioElement;
                sound.volume = 0.4;
                sound.play().catch(() => { });
            }
        };

        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    const playClick = useCallback(() => {
        if (clickSoundRef.current) {
            const sound = clickSoundRef.current.cloneNode() as HTMLAudioElement;
            sound.volume = 0.4;
            sound.play().catch(() => { });
        }
    }, []);

    return (
        <SoundContext.Provider value={{ playClick }}>
            {children}
        </SoundContext.Provider>
    );
}
