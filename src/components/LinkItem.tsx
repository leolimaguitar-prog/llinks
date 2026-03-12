import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, ExternalLink, BarChart2, Eye, EyeOff, Save, X } from 'lucide-react';

interface Link {
  id: string;
  title: string;
  url: string;
  is_visible: boolean;
  position: number;
  clicks?: { count: number }[];
}

interface LinkItemProps {
  link: Link;
  index: number;
  onUpdate: (id: string, updates: Partial<Link>) => void;
  onDelete: (id: string) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ link, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const clickCount = link.clicks?.[0]?.count || 0;

  const handleSave = () => {
    onUpdate(link.id, { title: editTitle, url: editUrl });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={link.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-2xl border ${
            snapshot.isDragging ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-100 scale-[1.02]' : 'border-gray-100 shadow-sm'
          } p-4 mb-4 transition-all duration-200 group`}
        >
          <div className="flex gap-4">
            {/* Drag Handle */}
            <div 
              {...provided.dragHandleProps}
              className="mt-1 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-3">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título do link"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://exemplo.com"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Save className="h-3 w-3" /> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div 
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer group/title"
                    >
                      <h3 className="text-sm font-bold text-gray-900 group-hover/title:text-indigo-600 transition-colors">
                        {link.title || 'Novo Link'}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-[250px]">
                        {link.url || 'Adicione uma URL'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate(link.id, { is_visible: !link.is_visible })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          link.is_visible ? 'text-gray-400 hover:bg-gray-50' : 'text-indigo-600 bg-indigo-50'
                        }`}
                        title={link.is_visible ? "Ocultar link" : "Mostrar link"}
                      >
                        {link.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este link?')) {
                            onDelete(link.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-50 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <BarChart2 className="h-3.5 w-3.5" />
                      <span>{clickCount} cliques</span>
                    </div>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-indigo-600 ml-auto"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default LinkItem;
