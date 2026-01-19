import React, { useRef } from "react";
import { Pencil } from "lucide-react";
import ProfileView from "../ProfileView";

interface AvatarEditorProps {
    name: string;
    avatarUrl?: string;
    onAvatarChange: (newAvatarUrl: string) => void;
    isEditing: boolean;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({
    name,
    avatarUrl,
    onAvatarChange,
    isEditing,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const localUrl = URL.createObjectURL(file);
            onAvatarChange(localUrl);
        }
    };

    return (
        <div className="relative group inline-block">
            {/* ProfileView */}
            <ProfileView 
                name={name} 
                imageUrl={avatarUrl} 
                size="large"       
                layout="vertical"
                variant="simple" 
                isActive={false}
            />

            {/* Pencil Button */}
            {isEditing && (
                <>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-8 right-0 p-2 bg-yellow-500 text-slate-900 rounded-full shadow-lg hover:bg-yellow-400 transition-transform hover:scale-110 border-2 border-slate-900 z-10"
                    title="Cambia Immagine"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                
                {/* Hidden file input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                </>
            )}
        </div>
  );
};

export default AvatarEditor;