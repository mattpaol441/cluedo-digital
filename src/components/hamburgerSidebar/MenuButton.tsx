import React from "react";
import type { LucideIcon } from "lucide-react";

interface MenuButtonProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
    label,
    icon: Icon,
    onClick,
    isActive,
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-4 px-4 py-3 
                rounded-lg transition-all duration-200 group
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
        </button>
    );
};

export default MenuButton;