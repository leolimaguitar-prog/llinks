import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ExternalLink, Flame } from 'lucide-react';

import { themes } from '../lib/themes';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  theme_id: string | null;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          return;
        }

        setProfile(profileData);

        // Fetch links
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('profile_id', profileData.id)
          .eq('is_visible', true)
          .order('position', { ascending: true });

        if (linksError) throw linksError;
        setLinks(linksData || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const handleLinkClick = async (linkId: string, url: string) => {
    // Register click without blocking
    supabase
      .from('clicks')
      .insert({ link_id: linkId })
      .then(({ error }) => {
        if (error) console.error('Error recording click:', error);
      });

    // Open URL
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentTheme = themes[profile?.theme_id || 'default'] || themes.default;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Usuário não encontrado</h1>
          <p className="text-slate-600 mb-6">O perfil que você está procurando não existe ou foi removido.</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Criar meu Biolink
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.textColor} selection:bg-indigo-100 transition-colors duration-500`}>
      <main className="max-w-xl mx-auto px-4 pt-16 pb-24 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || profile.username}
                className={`relative w-24 h-24 rounded-full object-cover border-4 ${currentTheme.avatarBorder}`}
              />
            ) : (
              <div className={`relative w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 ${currentTheme.avatarBorder}`}>
                {profile?.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className={`mt-4 text-2xl font-bold tracking-tight`}>
            {profile?.full_name || `@${profile?.username}`}
          </h1>
          {profile?.bio && (
            <p className={`mt-2 font-medium leading-relaxed max-w-xs mx-auto opacity-80`}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {links.length > 0 ? (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className={`group relative w-full flex items-center p-4 ${currentTheme.buttonBg} ${currentTheme.buttonText} ${currentTheme.buttonBorder} border ${currentTheme.cardStyle} transition-all duration-300 text-left active:scale-[0.98]`}
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-black/5 text-current opacity-80 group-hover:opacity-100 transition-colors">
                  {link.icon ? (
                    <i className={link.icon}></i>
                  ) : (
                    <ExternalLink size={20} />
                  )}
                </div>
                
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold transition-colors">
                    {link.title}
                  </h3>
                </div>

                <div className="mr-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-current opacity-60">
                  <ExternalLink size={16} />
                </div>
              </button>
            ))
          ) : (
            <div className={`text-center py-12 opacity-50`}>
              Nenhum link disponível no momento.
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <div className="mt-16 flex justify-center">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} backdrop-blur-sm border ${currentTheme.buttonBorder} shadow-sm hover:shadow-md transition text-sm font-semibold opacity-80 hover:opacity-100`}
          >
            <Flame size={16} className="text-orange-500" />
            Criar meu Biolink agora
          </Link>
        </div>
      </main>
    </div>
  );
}
