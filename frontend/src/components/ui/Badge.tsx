import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className,
    ...props
}) => {
    const variants = {
        default: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
        outline: 'border-slate-700 text-slate-400',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
