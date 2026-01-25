import React from "react";
import type { LucideIcon } from "lucide-react";
import MenuButton from "./MenuButton";

export interface MenuItemData {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
}

interface MenuSectionProps {
    title?: string;
    items: MenuItemData[];
    onNavigate: (path: string) => void;
    currentPath?: string;
    badgeCount?: number; // Numero per il badge
    badgeItemId?: string; // ID dell'item che deve mostrare il badge
}

const MenuSection: React.FC<MenuSectionProps> = ({
    title,
    items,
    onNavigate,
    currentPath,
    badgeCount = 0,
    badgeItemId,
}) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {title && (
                <h4 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">
                    {title}
                </h4>
            )}

            {items.map((item) => (
                <MenuButton
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => onNavigate(item.path)}
                    isActive={currentPath === item.path}
                    badge={item.id === badgeItemId ? badgeCount : undefined}
                />
            ))}
        </div>
    );
};

export default MenuSection;
