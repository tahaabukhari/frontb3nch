'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    radius: number;
    color: string;
    baseAlpha: number;
    alpha: number;
    alphaChange: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
}

const StarBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            const starCount = Math.floor((window.innerWidth * window.innerHeight) / 4000);
            const stars: Star[] = [];
            const colors = ['#ffffff', '#ffffff', '#ffffff', '#A0C4FF', '#FDFD96']; // More white, some blue/yellow

            for (let i = 0; i < starCount; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                stars.push({
                    x,
                    y,
                    radius: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    baseAlpha: Math.random() * 0.5 + 0.3,
                    alpha: Math.random(),
                    alphaChange: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
                    vx: (Math.random() - 0.5) * 0.1, // Very subtle drift
                    vy: (Math.random() - 0.5) * 0.1,
                    baseX: x,
                    baseY: y,
                });
            }
            starsRef.current = stars;
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mouse interaction radius
            const radius = 150;

            starsRef.current.forEach((star) => {
                // Twinkle effect
                star.alpha += star.alphaChange;
                if (star.alpha <= 0.1 || star.alpha >= star.baseAlpha) {
                    star.alphaChange *= -1;
                }

                // Base movement (drift)
                star.baseX += star.vx;
                star.baseY += star.vy;

                // Wrap around screen
                if (star.baseX < 0) star.baseX = canvas.width;
                if (star.baseX > canvas.width) star.baseX = 0;
                if (star.baseY < 0) star.baseY = canvas.height;
                if (star.baseY > canvas.height) star.baseY = 0;

                // Mouse interaction
                let dx = mouseRef.current.x - star.baseX;
                let dy = mouseRef.current.y - star.baseY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                let finalX = star.baseX;
                let finalY = star.baseY;

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (radius - distance) / radius;
                    const moveX = Math.cos(angle) * force * 30; // Move away strength
                    const moveY = Math.sin(angle) * force * 30;

                    finalX -= moveX;
                    finalY -= moveY;
                }

                // Draw Star (Vector-like)
                const spikes = 5;
                const outerRadius = star.radius * 2;
                const innerRadius = star.radius;
                let rot = Math.PI / 2 * 3;
                let x = finalX;
                let y = finalY;
                let step = Math.PI / spikes;

                ctx.beginPath();
                ctx.moveTo(finalX, finalY - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    x = finalX + Math.cos(rot) * outerRadius;
                    y = finalY + Math.sin(rot) * outerRadius;
                    ctx.lineTo(x, y);
                    rot += step;

                    x = finalX + Math.cos(rot) * innerRadius;
                    y = finalY + Math.sin(rot) * innerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                }
                ctx.lineTo(finalX, finalY - outerRadius);
                ctx.closePath();
                ctx.globalAlpha = star.alpha;
                ctx.fillStyle = star.color;
                ctx.fill();
            });
            ctx.globalAlpha = 1; // Reset alpha for other draws if any
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        // Resize observer is safer for layout changes than just window resize
        const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });
        resizeObserver.observe(document.body);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('resize', resizeCanvas); // Keeps immediate response

        resizeCanvas();
        draw();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', resizeCanvas);
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-20]"
        />
    );
};

export default StarBackground;
