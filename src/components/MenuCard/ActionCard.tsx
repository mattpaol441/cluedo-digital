import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    disabled = false,
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                /* LAYOUT & DIMENSIONI */
                relative flex flex-col items-center justify-center
                w-full aspect-[4/3] p-6  /* aspect-ratio mantiene la forma rettangolare */
                
                /* STILE BASE */
                bg-slate-800/50 backdrop-blur-sm
                border border-slate-600 rounded-xl
                text-slate-200
                transition-all duration-300 ease-out
                
                /* INTERAZIONE (Hover & Focus) */
                ${!disabled ? `
                    cursor-pointer
                    hover:bg-slate-800
                    hover:border-yellow-500
                    hover:text-yellow-400
                    hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] /* Glow giallo */
                    hover:-translate-y-1 /* Leggero sollevamento */
                    active:scale-95
                ` : 'opacity-50 cursor-not-allowed grayscale'}

                ${className}
            `}
        >
            {/* CENTRAL ICON */}
            <div className="mb-4 p-4 bg-slate-900/50 rounded-full border border-slate-700 transition-colors duration-300 group-hover:border-yellow-500/50">
                <Icon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
            </div>

            {/* TITLE */}
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest">
                {title}
            </h3>

            {/* DESCRIPTION */}
            {description && (
                <p className="mt-2 text-xs text-slate-400 font-medium">
                    {description}
                </p>
            )}

            <div className="absolute top-2 right-2 w-2 h-2 bg-slate-600 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
        </button>
    );
};

export default ActionCard;