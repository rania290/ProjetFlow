import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverGlow?: boolean;
    delay?: number;
    interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hoverGlow = true,
    delay = 0,
    interactive = true,
}) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || !interactive) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            onMouseMove={handleMouseMove}
            className={`glass-card relative rounded-3xl overflow-hidden group ${className}`}
        >
            {/* Interactive spotlight effect */}
            {interactive && hoverGlow && (
                <div
                    className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(92,124,250,0.08), transparent 60%)`,
                        inset: 0,
                    }}
                />
            )}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};
