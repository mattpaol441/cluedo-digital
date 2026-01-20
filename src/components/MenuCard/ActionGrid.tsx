import React from "react";

interface ActionGridProps {
    children: React.ReactNode;
    className?: string;
}

const ActionGrid: React.FC<ActionGridProps> = ({ children, className = '' }) => {
    return (
        <div
        className={`
                /* LAYOUT GRIGLIA */
                grid 
                grid-cols-1       /* Mobile: una colonna (uno sotto l'altro) */
                sm:grid-cols-2    /* Desktop: due colonne (rettangolo perfetto) */
                
                /* SPAZIATURA */
                gap-6 
                w-full max-w-4xl  /* Larghezza massima per non allargarli troppo su schermi giganti */
                mx-auto           /* Centrato orizzontalmente */
                
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default ActionGrid;