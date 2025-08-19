/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, X, Pencil, Check } from 'lucide-react';
import { URLGroup } from '../types';

interface KnowledgeBaseManagerProps {
  urls: string[];
  onAddUrl: (url: string) => void;
  onRemoveUrl: (url: string) => void;
  maxUrls?: number;
  urlGroups: URLGroup[];
  activeUrlGroupId: string;
  onSetGroupId: (id: string) => void;
  onCloseSidebar?: () => void;
  onAddUrlGroup: (name: string) => void;
  onRemoveUrlGroup: (id: string) => void;
  onRenameUrlGroup: (id: string, newName: string) => void;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ 
  urls, 
  onAddUrl, 
  onRemoveUrl, 
  maxUrls = 20,
  urlGroups,
  activeUrlGroupId,
  onSetGroupId,
  onCloseSidebar,
  onAddUrlGroup,
  onRemoveUrlGroup,
  onRenameUrlGroup,
}) => {
  const [currentUrlInput, setCurrentUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');

  const activeGroup = urlGroups.find(g => g.id === activeUrlGroupId);
  const isCurrentGroupEditable = activeGroup?.isEditable ?? false;

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddUrl = () => {
    if (!currentUrlInput.trim()) {
      setError('URL cannot be empty.');
      return;
    }
    if (!isValidUrl(currentUrlInput)) {
      setError('Invalid URL format. Please include http:// or https://');
      return;
    }
    if (urls.length >= maxUrls) {
      setError(`You can add a maximum of ${maxUrls} URLs to the current group.`);
      return;
    }
    if (urls.includes(currentUrlInput)) {
      setError('This URL has already been added to the current group.');
      return;
    }
    onAddUrl(currentUrlInput);
    setCurrentUrlInput('');
    setError(null);
  };
  
  const handleStartCreate = () => { setIsCreating(true); setGroupNameInput(''); };
  const handleCancelCreate = () => { setIsCreating(false); setGroupNameInput(''); };
  const handleConfirmCreate = () => { onAddUrlGroup(groupNameInput); handleCancelCreate(); };

  const handleStartRename = () => { if (!activeGroup) return; setIsRenaming(true); setGroupNameInput(activeGroup.name); };
  const handleCancelRename = () => { setIsRenaming(false); setGroupNameInput(''); };
  const handleConfirmRename = () => { onRenameUrlGroup(activeUrlGroupId, groupNameInput); handleCancelRename(); };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to delete the group "${activeGroup?.name}"? This action cannot be undone.`)) {
      onRemoveUrlGroup(activeUrlGroupId);
    }
  };

  const activeGroupName = activeGroup?.name || "Unknown Group";

  return (
    <div className="p-4 bg-[#1E1E1E] shadow-md rounded-xl h-full flex flex-col border border-[rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-[#E2E2E2]">Knowledge Base</h2>
        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="p-1 text-[#A8ABB4] hover:text-white rounded-md hover:bg-white/10 transition-colors md:hidden"
            aria-label="Close knowledge base"
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      <div className="mb-3">
        <label htmlFor="url-group-select-kb" className="block text-sm font-medium text-[#A8ABB4] mb-1">
          Active URL Group
        </label>
        <div className="flex items-center gap-2">
          {isCreating || isRenaming ? (
            <>
              <input
                type="text"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                placeholder={isCreating ? "New group name..." : "Rename group..."}
                className="flex-grow h-8 py-1 px-2.5 border border-[rgba(255,255,255,0.1)] bg-[#2C2C2C] text-[#E2E2E2] placeholder-[#777777] rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-shadow text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (isCreating ? handleConfirmCreate() : handleConfirmRename())}
                autoFocus
              />
              <button onClick={isCreating ? handleConfirmCreate : handleConfirmRename} className="h-8 w-8 p-1.5 bg-white/[.12] hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0" aria-label="Save"><Check size={16} /></button>
              <button onClick={isCreating ? handleCancelCreate : handleCancelRename} className="h-8 w-8 p-1.5 bg-white/[.08] hover:bg-white/15 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0" aria-label="Cancel"><X size={16} /></button>
            </>
          ) : (
            <>
              <div className="relative flex-grow">
                <select
                  id="url-group-select-kb"
                  value={activeUrlGroupId}
                  onChange={(e) => onSetGroupId(e.target.value)}
                  className="w-full h-8 py-1 pl-3 pr-8 appearance-none border border-[rgba(255,255,255,0.1)] bg-[#2C2C2C] text-[#E2E2E2] rounded-md focus:ring-1 focus:ring-white/20 focus:border-white/20 text-sm"
                >
                  {urlGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8ABB4] pointer-events-none" aria-hidden="true" />
              </div>
              <div className="flex items-center">
                <button onClick={handleStartCreate} className="h-8 w-8 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors" aria-label="New group"><Plus size={16} /></button>
                <button onClick={handleStartRename} disabled={!isCurrentGroupEditable} className="h-8 w-8 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:text-white/30 disabled:hover:bg-transparent" aria-label="Rename group"><Pencil size={16} /></button>
                <button onClick={handleRemove} disabled={!isCurrentGroupEditable || urlGroups.length <= 1} className="h-8 w-8 p-1.5 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:text-white/30 disabled:hover:bg-transparent" aria-label="Delete group"><Trash2 size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>


      <div className="flex items-center gap-2 mb-3">
        <input
          type="url"
          value={currentUrlInput}
          onChange={(e) => setCurrentUrlInput(e.target.value)}
          placeholder="https://docs.example.com"
          className="flex-grow h-8 py-1 px-2.5 border border-[rgba(255,255,255,0.1)] bg-[#2C2C2C] text-[#E2E2E2] placeholder-[#777777] rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-shadow text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
        />
        <button
          onClick={handleAddUrl}
          disabled={urls.length >= maxUrls}
          className="h-8 w-8 p-1.5 bg-white/[.12] hover:bg-white/20 text-white rounded-lg transition-colors disabled:bg-[#4A4A4A] disabled:text-[#777777] flex items-center justify-center flex-shrink-0"
          aria-label="Add URL"
        >
          <Plus size={16} />
        </button>
      </div>
      {error && <p className="text-xs text-[#f87171] mb-2">{error}</p>}
      {urls.length >= maxUrls && <p className="text-xs text-[#fbbf24] mb-2">Maximum {maxUrls} URLs reached for this group.</p>}
      
      <div className="flex-grow overflow-y-auto space-y-2 chat-container">
        {urls.length === 0 && (
          <p className="text-[#777777] text-center py-3 text-sm">Add documentation URLs to the group "{activeGroupName}" to start querying.</p>
        )}
        {urls.map((url) => (
          <div key={url} className="flex items-center justify-between p-2.5 bg-[#2C2C2C] border border-[rgba(255,255,255,0.05)] rounded-lg hover:shadow-sm transition-shadow">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#79B8FF] hover:underline truncate" title={url}>
              {url}
            </a>
            <button 
              onClick={() => onRemoveUrl(url)}
              className="p-1 text-[#A8ABB4] hover:text-[#f87171] rounded-md hover:bg-[rgba(255,0,0,0.1)] transition-colors flex-shrink-0 ml-2"
              aria-label={`Remove ${url}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;