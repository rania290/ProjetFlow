import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
    duration?: number;
    delay?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    suffix = '',
    prefix = '',
    label,
    duration = 2,
    delay = 0,
}) => {
    const count = useMotionValue(0);
    const springCount = useSpring(count, { duration: duration * 1000, bounce: 0 });
    const rounded = useTransform(springCount, (latest) => {
        if (value >= 1000) {
            return `${prefix}${Math.round(latest / 1000)}k${suffix}`;
        }
        return `${prefix}${Math.round(latest)}${suffix}`;
    });
    const [isInView, setIsInView] = React.useState(false);

    React.useEffect(() => {
        if (isInView) {
            const timeout = setTimeout(() => {
                count.set(value);
            }, delay * 1000);
            return () => clearTimeout(timeout);
        }
    }, [isInView, value, count, delay]);

    return (
        <motion.div
            onViewportEnter={() => setIsInView(true)}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center group"
        >
            <motion.span className="block text-4xl md:text-6xl font-black font-display gradient-text-static tracking-tight">
                {rounded}
            </motion.span>
            <span className="block mt-3 text-sm md:text-base text-slate-400 font-medium">{label}</span>
        </motion.div>
    );
};
