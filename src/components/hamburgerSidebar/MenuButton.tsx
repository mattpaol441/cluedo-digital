import React from "react";
import type { LucideIcon } from "lucide-react";

export interface MenuButtonProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
    badge?: number; // Numero per il badge di notifica
}

const MenuButton: React.FC<MenuButtonProps> = ({
    label,
    icon: Icon,
    onClick,
    isActive,
    badge,
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-4 px-4 py-3 
                rounded-lg transition-all duration-200 group relative
                ${isActive
                    ? 'bg-yellow-500/10 text-yellow-400 border-r-2 border-yellow-400 rounded-r-none'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
            `}
        >
            <Icon
                className={`
                    w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-yellow-400' : 'text-slate-400 group-hover:text-white'}`}
            />

            <span className="font-medium tracking-wide text-sm">
                {label}
            </span>

            {/* Badge notifica */}
            {badge !== undefined && badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </button>
    );
};

export default MenuButton;
