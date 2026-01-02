import React from 'react';

type ProfileSize = 'small' | 'medium' | 'large';

interface ProfileViewProps {
    // User / Character  data
    name: string;
    imageUrl: string;

    //Visual state 
    size?: ProfileSize;  //size of the profile view
    isActive?: boolean;  // inddicates if is the player turn
    isOnline?: boolean;  // indicates if the user is online

    className?: string; //additional CSS classes
}

// Size mapping
const SIZE_MAP: Record<ProfileSize, {container: string; text: string; initial: string}> = {
    small: { container: 'w-10 h-10', text: 'text-sm', initial: 'text-sm' },
    medium: { container: 'w-16 h-16', text: 'text-base', initial: 'text-xl' },
    large: { container: 'w-24 h-24', text: 'text-lg', initial: 'text-2xl' },
};

const ProfileView: React.FC<ProfileViewProps> = ({
    name,
    imageUrl,
    size = 'medium',
    isActive = undefined,
    isOnline = undefined,  //todo use this prop to show online status
    className = '',
}) => {
    const styles = SIZE_MAP[size];

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
      
      {/* Profile Container */}
      <div 
        className={`
          relative flex items-center justify-center 
          bg-gray-700 rounded-full overflow-hidden shrink-0
          border-4 transition-all duration-300 ease-in-out
          ${styles.container}
          ${isActive 
            ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] scale-110' // Active Style
            : 'border-white shadow-md' // Default Style
          }
        `}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          // Fallback: if there is no image, show initials
          <span className={`font-bold text-white ${styles.initial}`}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name Tag */}
      <div 
        className={`
          bg-slate-900/90 text-white font-medium rounded-lg shadow-sm
          border border-slate-600 backdrop-blur-sm whitespace-nowrap
          transition-colors duration-300
          ${styles.text}
          ${isActive ? 'border-yellow-400 text-yellow-100 bg-slate-800' : ''}
        `}
      >
        {name}
      </div>

    </div>
  );
};

export default ProfileView;