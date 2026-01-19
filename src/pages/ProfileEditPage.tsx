import React, { useState, useEffect } from "react";
import { Save, Edit2 } from 'lucide-react';

// Redux Imports
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/index';
import { updateProfile, updateAvatar } from '../store/slices/userSlice';

// Components
import AvatarEditor from '../components/profile/AvatarEditor';
import ProfileInput from '../components/profile/ProfileInput';
import HamburgerSidebar from '../components/hamburgerSidebar/HamburgerSidebar'; // Per la navigazione

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  
  // Read current state from Redux
  const user = useSelector((state: RootState) => state.user);

  // 2. Local State for Form (Controlled Inputs)
  // Initialize with redux data
  const [formData, setFormData] = useState({
    name: user.displayName,
    email: user.email,
    password: '', // Password starts empty for visual security
  });

  // 3. Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // Sync: If the user in the store changes (e.g., initial load), update the local form data
  useEffect(() => {
    setFormData(prev => ({ ...prev, name: user.displayName, email: user.email }));
  }, [user]);

  // Handler: Save Changes
  const handleSave = () => {
    // Here we would dispatch the Redux action
    dispatch(updateProfile({
      displayName: formData.name,
      email: formData.email,
      // the password would be handled separately  (Firebase)
    }));
    
    setIsEditing(false);
    alert("Profilo aggiornato con successo!");
  };

  // Handler: Cancel Editing
  const handleCancel = () => {
    setFormData({ name: user.displayName, email: user.email, password: '' });
    setIsEditing(false);
  };

  // Handler generic input change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar Navigation */}
      <HamburgerSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Background */}
        <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-slate-800 to-slate-950 -z-10" />

        {/* --- PROFILE CARD --- */}
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 flex flex-col gap-8 animate-fade-in-up">
          
          {/* Header Card */}
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-white">Profilo Utente</h2>
             {/* Status Badge */}
             <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 uppercase">
                {user.isOnline ? 'Online' : 'Offline'}
             </span>
          </div>

          {/* 1. AVATAR SECTION */}
          <div className="flex justify-center py-4 border-b border-slate-800">
            <AvatarEditor 
              name={formData.name} // Use form data for live preview while typing
              avatarUrl={user.avatarUrl}
              isEditing={isEditing}
              onAvatarChange={(url) => dispatch(updateAvatar(url))}
            />
          </div>

          {/* 2. DATA FORM SECTION */}
          <div className="space-y-4">
            <ProfileInput 
              label="Username" 
              value={formData.name} 
              onChange={(v) => handleChange('name', v)}
              isEditing={isEditing}
            />
            
            <ProfileInput 
              label="Email" 
              value={formData.email} 
              onChange={(v) => handleChange('email', v)}
              type="email"
              isEditing={isEditing}
            />

            {/* Password: If not editing, show fixed dots */}
            <ProfileInput 
              label="Password" 
              value={isEditing ? formData.password : '••••••••••••'} 
              onChange={(v) => handleChange('password', v)}
              type="password"
              isEditing={isEditing}
            />
          </div>

          {/* 3. ACTION BUTTON (Edit / Save) */}
          <div className="pt-4 flex gap-4">
            {isEditing ? (
              // Mode: Saving
              <>
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                >
                  <Save className="w-5 h-5" />
                  Salva Modifiche
                </button>
              </>
            ) : (
              // View Mode: Edit
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 border border-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 hover:border-yellow-500 hover:text-yellow-400 transition-all group"
              >
                <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Modifica Profilo
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;