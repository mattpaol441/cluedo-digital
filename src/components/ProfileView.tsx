import React from 'react';

type ProfileSize = 'small' | 'medium' | 'large';
type ProfileLayout = 'horizontal' | 'vertical';
type ProfileVariant = 'game' | 'simple';

interface ProfileViewProps {
    // User / Character  data
    name: string;
    imageUrl?: string;

    //Visual state 
    size?: ProfileSize;  //size of the profile view
    isActive?: boolean;  // inddicates if is the player turn
    isOnline?: boolean;  // indicates if the user is online

    layout?: ProfileLayout; //layout orientation
    variant?: ProfileVariant; //visual variant
    className?: string; //additional CSS classes

    onClick?: () => void; //click handler (eg. to open profile details)
}

// Size mapping
const SIZE_MAP: Record<ProfileSize, {container: string; text: string; initial: string; status: string}> = {
    small: { container: 'w-10 h-10', text: 'text-sm', initial: 'text-sm', status: 'w-2 h-2' },
    medium: { container: 'w-16 h-16', text: 'text-base', initial: 'text-xl', status: 'w-3 h-3' },
    large: { container: 'w-24 h-24', text: 'text-lg', initial: 'text-2xl', status: 'w-4 h-4' },
};

const ProfileView: React.FC<ProfileViewProps> = ({
    name,
    imageUrl,
    size = 'medium',
    isActive = undefined,
    isOnline = undefined,  //todo use this prop to show online status
    layout = 'vertical',
    variant = 'game',
    className = '',
    onClick = undefined,
}) => {
    const styles = SIZE_MAP[size];
    const isHorizontal = layout === 'horizontal';
    const isSimpleVariant = variant === 'simple';

    return (
        <div 
          onClick={onClick}
          className={`flex gap-3 
                ${isHorizontal ? 'flex-row' : 'flex-col'} 
                items-center justify-center
                ${onClick ? 'cursor-pointer hover:opacity-90' : ''}
                ${className}
              `}
        >
      
          {/* Profile Container */}
          <div className='relative shrink-0'>
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

                {/* Online Status Indicator */}
                {isOnline !== undefined && (
                  <span
                    className={`
                                absolute bottom-0 right-0 
                                rounded-full border-2 border-slate-900
                                ${styles.status}
                                ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
                            `}
                            title={isOnline ? "Online" : "Offline"}
                        />
                    )}
          </div>
          <div 
                    className={`
                        font-medium transition-colors duration-300 whitespace-nowrap
                        ${styles.text}
                        
                        /* STILE VARIANT: GAME (Badge scuro) vs SIMPLE (Testo pulito) */
                        ${!isSimpleVariant 
                            ? `bg-slate-900/90 text-white rounded-lg border border-slate-600 backdrop-blur-sm shadow-sm
                              ${isActive ? 'border-yellow-400 text-yellow-100 bg-slate-800' : ''}`
                            : `text-white ${isActive ? 'text-yellow-400 font-bold' : ''}`
                        }
                    `}
                >
                    {name}
                </div>
        </div>
      
  );
};

export default ProfileView;