import React from 'react';
import { ExternalLink, User } from 'lucide-react';

import { themes } from '../lib/themes';

interface Link {
  id: string;
  title: string;
  url: string;
  is_visible: boolean;
}

interface Profile {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  theme_id?: string | null;
}

interface MobilePreviewProps {
  profile: Profile | null;
  links: Link[];
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ profile, links }) => {
  const visibleLinks = links.filter(l => l.is_visible);
  const currentTheme = themes[profile?.theme_id || 'default'] || themes.default;

  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full sticky top-8">
      {/* Device Mockup */}
      <div className="relative w-[300px] h-[600px] bg-black rounded-[50px] border-[8px] border-gray-900 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>

        {/* Screen Content */}
        <div className={`h-full ${currentTheme.background} ${currentTheme.textColor} overflow-y-auto custom-scrollbar pt-12 px-6 pb-12 relative transition-colors duration-500`}>
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className={`w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 ${currentTheme.avatarBorder} transition-all`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">@{profile?.username || 'user'}</h3>
              <p className="text-xs opacity-70 line-clamp-2">{profile?.bio || 'Sua bio aparecerá aqui'}</p>
            </div>
          </div>

          <div className="space-y-3">
            {visibleLinks.length > 0 ? (
              visibleLinks.map((link) => (
                <div
                  key={link.id}
                  className={`w-full ${currentTheme.buttonBg} ${currentTheme.buttonText} ${currentTheme.buttonBorder} border p-3 ${currentTheme.cardStyle} flex items-center justify-center relative active:scale-95 transition-all outline-none`}
                >
                  <span className="text-sm font-semibold truncate px-4">{link.title || 'Link sem título'}</span>
                  <ExternalLink className="h-3 w-3 opacity-30 absolute right-3" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className={`w-12 h-12 ${currentTheme.buttonBg} rounded-xl shadow-sm border border-dashed ${currentTheme.buttonBorder} flex items-center justify-center mb-3`}>
                  <ExternalLink className="h-5 w-5 opacity-30" />
                </div>
                <p className="text-xs opacity-40">Adicione links para vê-los aqui</p>
              </div>
            )}
          </div>

          {/* Biolinks Branding */}
          <div className="mt-10 mb-4 text-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${currentTheme.buttonBg} ${currentTheme.buttonText} border ${currentTheme.buttonBorder} px-3 py-1 rounded-full opacity-60 shadow-sm`}>
              Biolinks
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-xs font-medium text-gray-400">Seu link público será:</p>
          <code className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            biolinks.com/{profile?.username}
          </code>
        </div>
    </div>
  );
};

export default MobilePreview;
