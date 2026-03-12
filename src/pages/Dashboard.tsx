import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  LayoutDashboard, 
  LogOut, 
  Share2, 
  Check,
  Copy,
  Palette,
  Sparkles,
  Sidebar
} from 'lucide-react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import LinkItem from '../components/LinkItem';
import MobilePreview from '../components/MobilePreview';
import { themes } from '../lib/themes';

interface Link {
  id: string;
  title: string;
  url: string;
  is_visible: boolean;
  position: number;
  clicks: { count: number }[];
}

const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'appearance'>('links');
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [localProfile, setLocalProfile] = useState(profile);

  const fetchLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*, clicks(count)')
        .eq('profile_id', user?.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (err) {
      console.error('Erro ao buscar links:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, fetchLinks]);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const addLink = async () => {
    const newLink = {
      profile_id: user?.id,
      title: '',
      url: '',
      position: links.length,
      is_visible: true
    };

    const { data, error } = await supabase
      .from('links')
      .insert(newLink)
      .select()
      .single();

    if (error) {
      alert('Erro ao criar link');
    } else {
      setLinks([...links, { ...data, clicks: [] }]);
    }
  };

  const updateLink = async (id: string, updates: Partial<Link>) => {
    // Optimistic update
    const oldLinks = [...links];
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));

    const { error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id);

    if (error) {
      setLinks(oldLinks);
      alert('Erro ao atualizar link');
    }
  };

  const deleteLink = async (id: string) => {
    const oldLinks = [...links];
    setLinks(links.filter(l => l.id !== id));

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      setLinks(oldLinks);
      alert('Erro ao excluir link');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions locally
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    setLinks(updatedItems);

    // Persist to Supabase
    const { error } = await supabase
      .from('links')
      .upsert(
        updatedItems.map(item => ({
          id: item.id,
          profile_id: user?.id,
          position: item.position
        }))
      );

    if (error) {
      console.error('Erro ao salvar nova ordem:', error);
      fetchLinks(); // Rollback
    }
  };

  const handleCopyLink = () => {
    const url = `biolinks.com/${profile?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeSelect = async (themeId: string) => {
    // Optimistic UI update
    setLocalProfile(prev => prev ? { ...prev, theme_id: themeId } : null);

    const { error } = await supabase
      .from('profiles')
      .update({ theme_id: themeId })
      .eq('id', user?.id);

    if (error) {
      console.error('Error updating theme:', error);
      setLocalProfile(profile);
      alert('Erro ao atualizar tema');
    } else {
      refreshProfile(); // Sync with context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">Biolinks</span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('links')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'links' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Links
              </button>
              <button 
                onClick={() => setActiveTab('appearance')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'appearance' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Aparência
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">Analytics</button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">Configurações</button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-900">@{profile?.username}</span>
                <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Plano Free</span>
              </div>
              <button 
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Editor Column */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === 'links' ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sidebar size={20} className="text-indigo-600" />
                    Seus Links
                  </h1>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copiado!' : 'Meu link'}
                    </button>
                    <button 
                      onClick={addLink}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Link
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
                    ))}
                  </div>
                ) : links.length > 0 ? (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="links-list">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {links.map((link, index) => (
                            <LinkItem 
                              key={link.id} 
                              link={link} 
                              index={index} 
                              onUpdate={updateLink}
                              onDelete={deleteLink}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <Share2 className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Nenhum link ainda</h3>
                    <p className="mt-1 text-xs text-gray-500 text-balance max-w-xs mx-auto">
                      Adicione seus primeiros links para começar a compartilhar seu perfil.
                    </p>
                    <button 
                      onClick={addLink}
                      className="mt-6 flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all mx-auto"
                    >
                      Criar meu primeiro link
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Palette size={20} className="text-indigo-600" />
                    Aparência
                  </h1>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Escolha um Tema
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.values(themes).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          localProfile?.theme_id === theme.id || (!localProfile?.theme_id && theme.id === 'default')
                            ? 'border-indigo-600 bg-indigo-50/30'
                            : 'border-transparent bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        {/* Theme Visual Preview */}
                        <div className={`w-full h-24 ${theme.background} rounded-lg mb-3 shadow-inner overflow-hidden border border-black/5`}>
                          <div className="p-2 space-y-1">
                            <div className={`h-1 w-6 ${theme.textColor} opacity-20 bg-current rounded-full mx-auto`}></div>
                            <div className={`h-4 w-4 ${theme.avatarBorder} rounded-full bg-current opacity-20 mx-auto mt-1`}></div>
                            <div className="space-y-1 mt-2">
                              <div className={`h-2 w-full ${theme.buttonBg} rounded opacity-80 shadow-sm`}></div>
                              <div className={`h-2 w-full ${theme.buttonBg} rounded opacity-80 shadow-sm`}></div>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${
                          localProfile?.theme_id === theme.id || (!localProfile?.theme_id && theme.id === 'default')
                            ? 'text-indigo-600'
                            : 'text-gray-600'
                        }`}>
                          {theme.name}
                        </span>
                        
                        {(localProfile?.theme_id === theme.id || (!localProfile?.theme_id && theme.id === 'default')) && (
                          <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm opacity-50 cursor-not-allowed">
                  <h2 className="text-sm font-bold text-gray-900 mb-2">Perfil</h2>
                  <p className="text-xs text-gray-500 mb-4">Edite seu nome de exibição e biografia aqui.</p>
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-50 rounded-xl" />
                    <div className="h-20 bg-gray-50 rounded-xl" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-5 relative">
            <MobilePreview profile={localProfile} links={links} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
