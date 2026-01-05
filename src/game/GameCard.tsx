import React from "react";

import type { Card, CardType } from "@cluedo-digital/shared";

type CardSize = "SMALL" | "MEDIUM" | "LARGE";

interface GameCardProps {
    card: Card;
    image?: string;
    size?: CardSize;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

// Type mapping for card type
const TYPE_STYLES: Record<CardType, string> = {
    SUSPECT: "border-blue-500 bg-blue-50 text-blue-900",
    WEAPON: "border-red-500 bg-red-50 text-red-900",
    ROOM: "border-amber-500 bg-amber-50 text-amber-900",
};

// Size mapping for card size
const SIZE_STYLES: Record<CardSize, { container: string; title: string }> = {
    SMALL: { container: "w-20 h-28", title: "text-[10px] py-1" },
    MEDIUM: { container: "w-32 h-44", title: "text-xs py-2" },
    LARGE: { container: "w-48 h-64", title: "text-base py-3" },
};

const GameCard: React.FC<GameCardProps> = ({
    card,
    image,
    size = "MEDIUM",
    isSelected = false,
    onClick,
    className = "",
}) => {
    const finalImage = card.image || image || "";

    const typeStyle = TYPE_STYLES[card.type];
    const sizeStyle = SIZE_STYLES[size];

    return (
        <div
            onClick={onClick}
            className={`
                /* Base Layout */
                relative flex flex-col items-center justify-between
                rounded-lg border-2 shadow-md overflow-hidden select-none
                transition-all duration-200 ease-out
                
                /* Dimension */
                ${sizeStyle.container}
                
                /* Colors by Type */
                ${typeStyle}

                /* Interactive State */
                ${onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl' : 'cursor-default'}

                /* Selected State */
                ${isSelected ? 'ring-4 ring-yellow-400 scale-105 z-10' : ''}

                /* Custom Classes */
                ${className}
            `}
            role="button"
            aria-label={`Carta ${card.name}`}
        >
            {/* --- 1. IMAGE  --- */}
            <div className="flex-1 w-full p-0 flex items-center justify-center overflow-hidden bg-white/60">
                {finalImage ? (
                    <img 
                        src={finalImage} 
                        alt={card.name} 
                        className="w-full h-full object-contain drop-shadow-sm" 
                    />
                ) : (
                    // Fallback if no image is provided
                    <div className="flex flex-col items-center justify-center opacity-30 font-bold">
                        <span className="text-4xl">{card.name.charAt(0)}</span>
                        <span className="text-[10px] uppercase mt-1">{card.type}</span>
                    </div>
                )}
            </div>

            {/* --- 2. TEXT AREA--- */}
            <div className={`
                w-full text-center font-bold uppercase tracking-wide border-t 
                bg-white/90 backdrop-blur-sm
                ${typeStyle.replace('bg-', 'border-')} /* Colored top border */
                ${sizeStyle.title}
            `}>
                <span className="line-clamp-2 px-1 leading-tight">
                    {card.name}
                </span>
            </div>
        </div>
    );
};

export default React.memo(GameCard);