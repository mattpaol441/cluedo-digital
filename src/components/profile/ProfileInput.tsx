import React from "react";

interface ProfileInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    type?: 'text' | 'email' | 'password';
    isEditing: boolean;
}

const ProfileInput: React.FC<ProfileInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    isEditing,
}) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                {label}
            </label>
            
            <input
                type={type}
                value={value}
                disabled={!isEditing}
                onChange={(e) => onChange(e.target.value)}
                className={`
                w-full p-3 rounded-lg font-medium transition-all duration-200
                ${isEditing 
                    ? 'bg-slate-800 text-white border border-slate-600 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500' // Stile Modifica
                    : 'bg-transparent text-slate-300 border border-transparent px-0 cursor-default' // Stile Lettura (sembra testo normale)
                }
                `}
            />
        </div>
  );
};

export default ProfileInput;