import React, { useState, useEffect } from 'react';
import { Track, Theme, PlaybackState, Folder } from '../types';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX,
  Maximize2, ListMusic, Music, ToggleLeft, ToggleRight, Sliders, Cpu, 
  Palette, Clock, Sparkles, AlertCircle, RefreshCw, AudioLines, Home, Search, Compass, Plus,
  Disc, Laptop2, Folder as FolderIcon, FolderPlus, ChevronRight, Edit3, Trash2, ArrowLeft, Move, Edit
} from 'lucide-react';
import Visualizer from './Visualizer';

interface SpotifyModeProps {
  playlist: Track[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  playbackState: PlaybackState;
  activePlayer: 'A' | 'B';
  analyser: AnalyserNode | null;
  onSelectTrack: (index: number) => void;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (time: number) => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSetGaplessEnabled: (enabled: boolean) => void;
  onSetCrossfadeDuration: (duration: number) => void;
  themes: Theme[];
  activeTheme: Theme;
  onSelectTheme: (themeId: string) => void;
  onTogglePlaylist: () => void;
  onSwitchMode: () => void;
  folders: Folder[];
  onCreateFolder: (name: string, parentId: string | null) => string;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveTrackToFolder: (trackId: string, destFolderId: string | null) => void;
  onAddFolderBatch?: (files: File[]) => void;
}

export default function SpotifyMode({
  playlist,
  currentTrackIndex,
  currentTrack,
  playbackState,
  activePlayer,
  analyser,
  onSelectTrack,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onSetVolume,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onSetGaplessEnabled,
  onSetCrossfadeDuration,
  themes,
  activeTheme,
  onSelectTheme,
  onTogglePlaylist,
  onSwitchMode,
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveTrackToFolder,
  onAddFolderBatch,
}: SpotifyModeProps) {
  const [localSeekTime, setLocalSeekTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Folders UI state
  const [isFolderMode, setIsFolderMode] = useState<boolean>(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderNameInput, setEditFolderNameInput] = useState<string>('');
  const [showCreateFolderInline, setShowCreateFolderInline] = useState<boolean>(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState<string>('');
  const spotifyFolderInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Time format helper
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getEffectiveTime = () => {
    return localSeekTime !== null ? localSeekTime : playbackState.currentTime;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSeekTime(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    if (localSeekTime !== null) {
      onSeek(localSeekTime);
      setLocalSeekTime(null);
    }
  };

  const getBreadcrumbs = () => {
    const list = [];
    let activeId = currentFolderId;
    while (activeId !== null) {
      const folder = folders.find(f => f.id === activeId);
      if (!folder) break;
      list.unshift(folder);
      activeId = folder.parentId;
    }
    return list;
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderNameInput.trim()) return;
    onCreateFolder(newFolderNameInput, currentFolderId);
    setNewFolderNameInput('');
    setShowCreateFolderInline(false);
  };

  const handleSaveRenameFolder = (id: string) => {
    if (!editFolderNameInput.trim()) return;
    onRenameFolder(id, editFolderNameInput);
    setEditingFolderId(null);
    setEditFolderNameInput('');
  };

  // Standard elegant colors inspired by Spotify Green (#1db954)
  const isDefaultTheme = activeTheme.id === 'cyber-neon';
  const accentColor = isDefaultTheme ? '#1db954' : activeTheme.primary;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#000000] text-zinc-100 font-sans select-none overflow-hidden" id="spotify-root">
      
      {/* 1. SECURE LEFT SIDEBAR PANEL (Spotify Layout standard) */}
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col p-2 space-y-2 select-none overflow-y-auto custom-scrollbar h-[calc(100vh-80px)] md:h-[calc(100vh-80px)]" id="spotify-sidebar">
        
        {/* Navigation block */}
        <div className="bg-[#121214] rounded-xl p-4 flex flex-col space-y-3.5 select-none" id="sidebar-nav">
          <div className="flex items-center gap-2 select-none">
            <span className="p-1.5 rounded-full bg-[#1db954] text-black">
              <AudioLines size={16} className="text-black" />
            </span>
            <span className="font-sans font-black text-sm tracking-wider text-white uppercase select-none">
              Spotify<span className="text-[#1db954]">Wave</span>
            </span>
          </div>

          <nav className="flex flex-col space-y-2 mt-2 text-zinc-300 font-medium text-xs">
            <button 
              onClick={() => setIsFolderMode(false)}
              className={`flex items-center gap-3 py-2 px-2.5 rounded-lg text-left font-semibold transition-all duration-155 cursor-pointer ${
                !isFolderMode 
                  ? 'bg-zinc-800 text-white' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Home size={16} className={!isFolderMode ? 'text-[#1db954] font-bold' : 'text-zinc-500'} />
              <span>Catalog List</span>
            </button>
            <button 
              onClick={() => { setIsFolderMode(true); setCurrentFolderId(null); }}
              className={`flex items-center gap-3 py-2 px-2.5 rounded-lg text-left font-semibold transition-all duration-155 cursor-pointer ${
                isFolderMode 
                  ? 'bg-zinc-800 text-white' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <FolderIcon size={16} style={isFolderMode ? { color: accentColor } : { color: '#71717a' }} />
              <span>Folders Browser</span>
              <span className="text-[10px] ml-auto px-1.5 py-0.2 rounded bg-zinc-950 text-zinc-400 font-mono">
                {folders.length}
              </span>
            </button>
            <button 
              onClick={onTogglePlaylist}
              className="flex items-center gap-3 py-2 px-2.5 bg-transparent hover:text-white transition-colors text-left font-semibold text-zinc-400 cursor-pointer"
            >
              <LibraryIcon />
              <span>Drawer Filter</span>
              <span className="text-[10px] ml-auto px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {playlist.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Dynamic theme, speed controllers, and specs dashboard */}
        <div className="bg-[#121214] rounded-xl flex-1 p-4 flex flex-col justify-between gap-5 overflow-y-auto custom-scrollbar" id="sidebar-themes-engine">
          
          {/* Custom Theme Selector Accordion */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] tracking-wider uppercase select-none">
              <Palette size={12} style={{ color: accentColor }} />
              <span>Fluid Skin Themes</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {themes.slice(0, 5).map(t => {
                const isActive = t.id === activeTheme.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`cursor-pointer text-[10.5px] font-semibold py-2 px-2.5 rounded-lg transition-all duration-150 text-left flex items-center gap-2 truncate ${
                      isActive 
                        ? 'bg-zinc-800 text-white' 
                        : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                    style={isActive ? { borderLeft: `3px solid ${accentColor}` } : {}}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.primary }} />
                    <span className="truncate">{t.name.replace('NEONWAVE ', '').replace('Matrix ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* gapless specs parameters */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] tracking-wider uppercase select-none">
              <Sliders size={12} style={{ color: activeTheme.secondary }} />
              <span>Gapless Parameters</span>
            </div>

            <div className="flex flex-col gap-1.5 bg-zinc-950/50 rounded-lg p-2.5 border border-white/5">
              <div className="flex justify-between items-center select-none text-[10px] text-zinc-400 font-medium">
                <span>Gapless Mixing</span>
                <button
                  onClick={() => onSetGaplessEnabled(!playbackState.gaplessEnabled)}
                  className="cursor-pointer text-zinc-400 hover:text-white transition-opacity duration-150"
                  title="Toggle crossfades"
                >
                  {playbackState.gaplessEnabled ? (
                    <ToggleRight size={20} style={{ color: accentColor }} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                </button>
              </div>

              {playbackState.gaplessEnabled && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[9.5px]">
                    <span className="text-zinc-400 select-none">Crossfade:</span>
                    <span className="font-mono font-bold" style={{ color: activeTheme.accent }}>
                      {playbackState.crossfadeDuration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={playbackState.crossfadeDuration}
                    onChange={(e) => onSetCrossfadeDuration(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer outline-none"
                    style={{ accentColor: accentColor }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Telemetries specs */}
          <div className="flex flex-col gap-1.5 border-t border-zinc-850 pt-3 mt-auto select-none">
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold tracking-wider uppercase">
              <Cpu size={10} />
              <span>AUDIO SIGNAL PIPELINE</span>
            </div>

            <div className="bg-zinc-950/40 rounded-lg p-2 flex flex-col gap-1 font-mono text-[9px] text-zinc-400">
              <div className="flex justify-between leading-tight">
                <span>BITRATE</span>
                <span style={{ color: activeTheme.accent }}>{currentTrack?.bitrate || '320 kbps'}</span>
              </div>
              <div className="flex justify-between leading-tight">
                <span>FREQUENCIES</span>
                <span>{currentTrack?.sampleRate || '44.1 kHz'}</span>
              </div>
              <div className="flex justify-between leading-tight">
                <span>ENCODING</span>
                <span className="text-white bg-zinc-850 px-1 py-0.1 rounded text-[8px] font-bold">
                  {currentTrack?.format || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* 2. RIGHT MAIN PANEL (charcoal modular box matching Spotify) */}
      <main className="flex-1 flex flex-col m-2 ml-0 rounded-xl overflow-hidden shadow-2xl relative bg-[#121212] bg-linear-to-b from-[#18181c] to-[#121212] h-[calc(100vh-96px)]" id="spotify-main">
        
        {/* Main top header */}
        <div className="flex items-center justify-between p-4 bg-transparent border-b border-white/5 select-none z-10" id="main-header">
          <div className="flex flex-col select-none">
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">OFFLINE DISCOGRAPHY</span>
            <p className="text-xs text-zinc-300 font-semibold mt-0.5">Welcome to your local private music stream</p>
          </div>

          {/* UTC Clock widget in high fidelity format */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5 font-mono text-[11px] text-zinc-300 select-none shadow-md">
            <Clock size={12} style={{ color: accentColor }} />
            <span>{currentTime || '07:36 UTC'}</span>
          </div>
        </div>

        {/* Center scrolling main sheet */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 select-none z-10" id="main-content-scroll">
          
          {/* Main Hero Track Banner styled elegantly like Spotify playlists banner */}
          <div 
            className="rounded-xl p-6 border flex flex-col lg:flex-row gap-6 items-center relative overflow-hidden flex-shrink-0 transition-all duration-300 shadow-xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(20,20,25,0.95) 0%, ${accentColor}10 100%)`, 
              borderColor: 'rgba(255,255,255,0.04)' 
            }}
            id="hero-banner"
          >
            {/* Soft backdrop glow halo */}
            <span 
              className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full blur-[110px] pointer-events-none opacity-25"
              style={{ background: accentColor }}
            />
            
            {/* Active Album wrapper with high-fidelity badges */}
            <div className="relative w-36 h-36 rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center border shadow-2xl flex-shrink-0 border-white/10">
              {currentTrack?.coverUrl === 'synthwave' ? (
                <div className="w-full h-full bg-linear-to-tr from-[#121212] via-[#000000] to-zinc-900 flex items-center justify-center border">
                  <Disc size={44} className="text-[#1db954] animate-spin-slow" />
                </div>
              ) : currentTrack?.coverUrl ? (
                <img 
                  src={currentTrack.coverUrl} 
                  alt={currentTrack.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <Music size={40} className="text-zinc-600 animate-pulse" />
                </div>
              )}
              
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-[#1db954] text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-md">
                PCM AUDIO
              </div>
            </div>

            {/* Song details & Realtime visualizer bar chart */}
            <div className="flex-grow flex flex-col justify-between min-w-0 self-stretch gap-4 text-center lg:text-left" id="hero-meta-block">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-[#1db954] uppercase font-bold">
                  Now playing on host
                </span>
                <h1 className="text-2xl font-black font-sans tracking-tight text-white truncate drop-shadow-md">
                  {currentTrack?.title || 'Unknown Title'}
                </h1>
                <p className="text-sm font-semibold truncate" style={{ color: accentColor }}>
                  {currentTrack?.artist || 'Unknown Artist'} &bull; <span className="text-zinc-400 font-normal">{currentTrack?.album || 'Local Library'}</span>
                </p>
              </div>

              {/* Mounted inline mini analyzer visualizer */}
              <div className="w-full h-20">
                <Visualizer 
                  analyser={analyser} 
                  theme={activeTheme} 
                  isPlaying={playbackState.isPlaying} 
                />
              </div>
            </div>

          </div>

          {/* View Toggles & Explorer Panel */}
          <div className="space-y-4" id="tracks-table-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3 select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFolderMode(false)}
                  className={`py-1 px-3 rounded-full text-[11px] font-bold font-sans tracking-wide transition-all ${
                    !isFolderMode 
                      ? 'bg-zinc-100 text-black shadow-md' 
                      : 'text-zinc-400 hover:text-white bg-zinc-900/60'
                  }`}
                >
                  🎵 Linear List
                </button>
                <button
                  onClick={() => {
                    setIsFolderMode(true);
                    setCurrentFolderId(null);
                  }}
                  className={`py-1 px-3 rounded-full text-[11px] font-bold font-sans tracking-wide transition-all flex items-center gap-1 ${
                    isFolderMode 
                      ? 'bg-white text-black shadow-md' 
                      : 'text-zinc-400 hover:text-white bg-zinc-900/60'
                  }`}
                  style={isFolderMode ? { backgroundColor: accentColor, color: '#000' } : {}}
                >
                  <FolderIcon size={11} />
                  <span>Dir Explorer</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {isFolderMode ? 'Hierarchical Organization' : 'Flat Compilation catalog'}
                </span>
              </div>
            </div>

            {/* FOLDER EXPLORER MODE RENDERING */}
            {isFolderMode ? (
              <div className="space-y-4" id="folders-explorer-wrap">
                {/* 1. Breadcrumbs Navigator & Create form */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/50 p-2.5 rounded-lg border border-white/5 select-none" id="folders-navigation-header">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400" id="folder-breadcrumbs">
                    <button 
                      onClick={() => setCurrentFolderId(null)}
                      className="hover:text-white flex items-center gap-1"
                    >
                      <Home size={11} className="text-[#1db954]" />
                      <span className="font-bold">Root</span>
                    </button>
                    {getBreadcrumbs().map((b, i) => (
                      <React.Fragment key={b.id}>
                        <span className="text-zinc-650 font-mono">/</span>
                        <button 
                          onClick={() => setCurrentFolderId(b.id)}
                          className="hover:text-white truncate max-w-[120px] text-zinc-300 font-medium"
                        >
                          {b.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {showCreateFolderInline ? (
                      <form onSubmit={handleCreateFolder} className="flex items-center gap-1.5">
                        <input 
                          type="text" 
                          value={newFolderNameInput} 
                          onChange={(e) => setNewFolderNameInput(e.target.value)} 
                          placeholder="Subfolder name..." 
                          className="bg-zinc-900 border border-zinc-800 text-[10.5px] px-2 py-0.5 text-white rounded outline-none focus:border-emerald-500 w-32"
                          autoFocus 
                        />
                        <button type="submit" className="bg-[#1db954] hover:bg-[#1ed760] font-sans font-bold text-black text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors">
                          Create
                        </button>
                        <button type="button" onClick={() => setShowCreateFolderInline(false)} className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors">
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button 
                          onClick={() => setShowCreateFolderInline(true)}
                          className="bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-[10px] px-2.5 py-1 border border-zinc-800 rounded flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FolderPlus size={10} className="text-[#1db954]" />
                          <span>Create Subfolder</span>
                        </button>

                        {onAddFolderBatch && (
                          <button 
                            type="button"
                            onClick={() => spotifyFolderInputRef.current?.click()}
                            className="bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-[10px] px-2.5 py-1 border border-zinc-800 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            title="Import an entire local directory to recreate its structured nested folder pathways in the app"
                          >
                            <Plus size={10} className="text-[#1db954]" />
                            <span>Upload Folder 📂</span>
                            <input 
                              type="file" 
                              ref={spotifyFolderInputRef}
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const filesArray = Array.from(e.target.files) as File[];
                                  onAddFolderBatch(filesArray);
                                }
                              }}
                              className="hidden"
                              {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Folders grid rendering */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" id="folders-grid">
                  {/* Safe Backwards pointer */}
                  {currentFolderId !== null && (
                    <div 
                      onClick={() => {
                        const curFolder = folders.find(f => f.id === currentFolderId);
                        setCurrentFolderId(curFolder ? curFolder.parentId : null);
                      }}
                      className="bg-zinc-950/40 hover:bg-zinc-900 border border-white/5 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-white transition-colors">
                        <ArrowLeft size={14} />
                      </div>
                      <div>
                        <h4 className="text-zinc-400 text-xs font-bold font-sans">..</h4>
                        <p className="text-[9.5px] text-zinc-500 font-semibold font-sans">Parent Directory</p>
                      </div>
                    </div>
                  )}

                  {folders.filter(f => f.parentId === currentFolderId).map(folder => (
                    <div 
                      key={folder.id} 
                      className="bg-[#121214]/80 hover:bg-zinc-900 border border-white/[0.02] hover:border-white/5 transition-all rounded-xl p-3 flex items-center justify-between gap-3 shadow-md group relative"
                    >
                      {/* Folder card Details */}
                      <div 
                        onClick={() => {
                          setCurrentFolderId(folder.id);
                          setEditingFolderId(null);
                        }}
                        className="flex items-center gap-3 select-none flex-grow min-w-0 cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-zinc-950 text-zinc-500 group-hover:text-[#1db954] transition-all">
                          <FolderIcon size={18} style={{ color: accentColor }} />
                        </div>
                        <div className="min-w-0 flex-grow">
                          {editingFolderId === folder.id ? (
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <input 
                                type="text"
                                value={editFolderNameInput}
                                onChange={e => setEditFolderNameInput(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 rounded px-1 py-0.5 text-[10px] font-sans text-white focus:outline-none w-20"
                                onKeyDown={e => e.key === 'Enter' && handleSaveRenameFolder(folder.id)}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <h4 className="text-zinc-200 text-xs font-bold leading-tight group-hover:text-white truncate font-sans">
                                {folder.name}
                              </h4>
                              <p className="text-[9.5px] text-zinc-500 font-medium font-mono mt-0.5">
                                {folder.trackIds.length} tracks
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Folder controls details (Edit, Delete) inline on hover */}
                      <div className="flex items-center gap-1 pl-1 bg-gradient-to-l from-[#121214] to-transparent shrink-0">
                        {editingFolderId === folder.id ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSaveRenameFolder(folder.id); }}
                            className="p-1 text-emerald-500 hover:text-emerald-400 text-[10px]"
                          >
                            ✔
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFolderId(folder.id);
                              setEditFolderNameInput(folder.name);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity text-[10px] cursor-pointer"
                            title="Rename"
                          >
                            <Edit3 size={11} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete folder "${folder.name}"? Tracks inside will return to Root Library.`)) {
                              onDeleteFolder(folder.id);
                            }
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity text-[10px] cursor-pointer"
                          title="Delete folder"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. Folder Tracks List compilation */}
                <div className="space-y-2 mt-4" id="folder-tracks-list">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 select-none">
                    Tracks in physical path
                  </div>
                  
                  {(() => {
                    const assignedTrackIds = new Set(folders.flatMap(f => f.trackIds));
                    const currentFolderTracks = currentFolderId === null 
                      ? playlist.filter(track => !assignedTrackIds.has(track.id))
                      : playlist.filter(track => {
                          const curFold = folders.find(f => f.id === currentFolderId);
                          return curFold?.trackIds.includes(track.id);
                        });

                    if (currentFolderTracks.length === 0) {
                      return (
                        <div className="bg-zinc-950/20 rounded-xl p-10 border border-dashed border-zinc-900 text-center select-none">
                          <FolderIcon size={24} className="mx-auto text-zinc-700 mb-2" />
                          <h5 className="text-zinc-500 text-xs font-semibold font-sans">No tracks in this directory path</h5>
                          <p className="text-[10px] text-zinc-650 font-medium font-sans mt-1">
                            Relocate any track below to this folder using the "Move to Folder" row select box.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto w-full" id="tracks-table-wrap">
                        <table className="w-full text-left border-collapse table-auto text-xs">
                          <thead>
                            <tr className="border-b text-zinc-500 font-bold uppercase text-[9px] select-none border-zinc-900">
                              <th className="py-2 px-3 w-10 text-center bg-transparent">#</th>
                              <th className="py-2 px-3 select-none">Title</th>
                              <th className="py-2 px-3 select-none">Classified Folder</th>
                              <th className="py-2 px-3 select-none hidden sm:table-cell">Metadata Details</th>
                              <th className="py-2 px-3 text-right bg-transparent w-16"><Clock size={11} className="inline mr-1" /></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/40 font-medium">
                            {currentFolderTracks.map((track, folderIndex) => {
                              const originalIdx = playlist.findIndex(t => t.id === track.id);
                              const isActive = originalIdx === currentTrackIndex;
                              return (
                                <tr
                                  key={track.id}
                                  onClick={() => onSelectTrack(originalIdx)}
                                  className={`group cursor-pointer hover:bg-white/[0.04] transition-colors duration-155 rounded-lg ${
                                    isActive ? 'bg-[#2a2a2e]/20' : ''
                                  }`}
                                >
                                  {/* Play indicator idx */}
                                  <td className="py-2.5 px-3 text-center text-zinc-500 font-mono">
                                    {isActive && playbackState.isPlaying ? (
                                      <span className="text-[#1db954] text-xs font-black animate-pulse">●</span>
                                    ) : (
                                      <span className="group-hover:hidden text-zinc-500 text-xs">{folderIndex + 1}</span>
                                    )}
                                    <Play size={10} className="hidden group-hover:inline mx-auto text-white fill-white" style={isActive ? { color: accentColor } : {}} />
                                  </td>

                                  {/* Card Meta details */}
                                  <td className="py-2.5 px-3 font-semibold min-w-[140px]">
                                    <div className="flex items-center gap-2.5">
                                      <div className="relative w-7 h-7 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow m-0">
                                        {track.coverUrl === 'synthwave' ? (
                                          <div className="w-full h-full bg-linear-to-tr from-zinc-950 to-black flex items-center justify-center">
                                            <Music size={10} className="text-zinc-650" />
                                          </div>
                                        ) : track.coverUrl ? (
                                          <img src={track.coverUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                                        ) : (
                                          <Music size={10} className="text-zinc-650" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate text-xs leading-normal" style={{ color: isActive ? accentColor : '#e4e4e7' }}>
                                          {track.title}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 font-medium truncate leading-normal">
                                          {track.artist}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Target Relocate selector box */}
                                  <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                                    <select
                                      value={currentFolderId || 'root'}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        onMoveTrackToFolder(track.id, val === 'root' ? null : val);
                                      }}
                                      className="bg-zinc-950 text-[10px] font-sans font-semibold border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded px-2 py-0.5 focus:outline-none cursor-pointer outline-none"
                                    >
                                      <option value="root">📁 Root / Unassigned</option>
                                      {folders.map(f => (
                                        <option key={f.id} value={f.id}>📁 {f.name}</option>
                                      ))}
                                    </select>
                                  </td>

                                  {/* Encoding size specs */}
                                  <td className="py-2.5 px-3 text-zinc-500 font-mono text-[9.5px] hidden sm:table-cell select-none">
                                    <span className="px-1.5 py-0.2 rounded text-[8px] bg-zinc-900 text-zinc-350 font-bold mr-1.5">
                                      {track.format}
                                    </span>
                                    <span className="text-zinc-500">{track.bitrate || '320kbps'}</span>
                                  </td>

                                  {/* Track details length */}
                                  <td className="py-2.5 px-3 text-right font-mono text-zinc-500 text-[10px]">
                                    {formatTime(track.duration)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* STANDARD FLAT compilation list (Original view) */
              <div className="overflow-x-auto w-full font-sans" id="tracks-table-wrap">
                <table className="w-full text-left border-collapse table-auto text-xs">
                  <thead>
                    <tr className="border-b text-zinc-500 font-bold uppercase text-[9px] select-none border-zinc-900">
                      <th className="py-2 px-3 w-10 text-center bg-transparent">#</th>
                      <th className="py-2 px-3 select-none">Title</th>
                      <th className="py-2 px-3 select-none">Relocate to Folder</th>
                      <th className="py-2 px-3 select-none hidden sm:table-cell">Metadata details</th>
                      <th className="py-2 px-3 text-right bg-transparent w-16"><Clock size={11} className="inline mr-1" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/40 font-medium">
                    {playlist.map((track, index) => {
                      const isActive = index === currentTrackIndex;
                      return (
                        <tr
                          key={track.id}
                          onClick={() => onSelectTrack(index)}
                          className={`group cursor-pointer hover:bg-white/[0.04] transition-colors duration-155 rounded-lg ${
                            isActive ? 'bg-[#2a2a2e]/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-zinc-500 font-mono">
                            {isActive && playbackState.isPlaying ? (
                              <span className="text-[#1db954] text-xs font-black animate-pulse">●</span>
                            ) : (
                              <span className="group-hover:hidden text-zinc-500 text-xs">{index + 1}</span>
                            )}
                            <Play size={10} className="hidden group-hover:inline mx-auto text-white fill-white" style={isActive ? { color: accentColor } : {}} />
                          </td>

                          <td className="py-2.5 px-3 font-semibold min-w-[140px]">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-7 h-7 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow m-0">
                                {track.coverUrl === 'synthwave' ? (
                                  <div className="w-full h-full bg-linear-to-tr from-zinc-950 to-black flex items-center justify-center">
                                    <Music size={10} className="text-zinc-650" />
                                  </div>
                                ) : track.coverUrl ? (
                                  <img src={track.coverUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                                ) : (
                                  <Music size={10} className="text-zinc-650" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs leading-normal" style={{ color: isActive ? accentColor : '#e4e4e7' }}>
                                  {track.title}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-medium truncate leading-normal">
                                  {track.artist}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Quick relocate folder select */}
                          <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                            <select
                              value={folders.find(f => f.trackIds.includes(track.id))?.id || 'root'}
                              onChange={(e) => {
                                const val = e.target.value;
                                onMoveTrackToFolder(track.id, val === 'root' ? null : val);
                              }}
                              className="bg-zinc-950 text-[10px] font-sans font-semibold border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded px-2 py-0.5 focus:outline-none cursor-pointer outline-none"
                            >
                              <option value="root">📁 Root / Unassigned</option>
                              {folders.map(f => (
                                <option key={f.id} value={f.id}>📁 {f.name}</option>
                              ))}
                            </select>
                          </td>

                          <td className="py-2.5 px-3 text-zinc-500 font-mono text-[9.5px] hidden sm:table-cell select-none">
                            <span className="px-1.5 py-0.2 rounded text-[8px] bg-zinc-900 text-zinc-350 font-bold mr-1.5">
                              {track.format}
                            </span>
                            <span className="text-zinc-500">{track.bitrate || '320kbps'}</span>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono text-zinc-500 text-[10px]">
                            {formatTime(track.duration)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 3. DOCK CONTROL PANEL (Clean high contrast exact Spotify player deck) */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-zinc-900 z-30 flex items-center justify-between px-4" id="spotify-footer-bar">
        
        {/* Left segment detail information */}
        <div className="flex items-center gap-3 w-1/4 min-w-[150px] max-w-[300px]" id="dock-left-meta">
          {currentTrack && (
            <>
              <div className="w-10 h-10 rounded overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 shadow-md">
                {currentTrack.coverUrl === 'synthwave' ? (
                  <div className="w-full h-full bg-linear-to-tr from-zinc-900 to-black flex items-center justify-center">
                    <Music size={14} className="text-[#1db954]" />
                  </div>
                ) : currentTrack.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Music size={14} className="text-zinc-650" />
                )}
              </div>
              <div className="min-w-0 select-none leading-none">
                <p 
                  className="text-xs font-bold truncate cursor-pointer hover:underline text-white" 
                  style={{ color: accentColor }}
                  onClick={onSwitchMode}
                  title="Click to view full sleeve"
                >
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-zinc-400 truncate mt-1">
                  {currentTrack.artist}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Center player mechanics seeking bar */}
        <div className="flex flex-col gap-1.5 items-center justify-center flex-1 max-w-xl" id="dock-center-mechanics">
          
          {/* Audio controller icons buttons suite */}
          <div className="flex items-center gap-5">
            <button
              onClick={onToggleShuffle}
              className="cursor-pointer text-zinc-400 hover:text-white transition-all hover:scale-105"
              style={playbackState.isShuffle ? { color: '#1db954' } : {}}
              title="Shuffle"
            >
              <Shuffle size={14} />
            </button>
            <button
              onClick={onPlayPrev}
              className="cursor-pointer text-zinc-400 hover:text-white transition-all hover:scale-105"
              title="Prev"
            >
              <SkipBack size={16} />
            </button>
            
            {/* Round Play/Pause Green circle button */}
            <button
              onClick={onTogglePlay}
              className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-106 active:scale-95 transition-all"
              style={{ backgroundColor: '#1db954' }}
              title={playbackState.isPlaying ? 'Pause' : 'Play'}
            >
              {playbackState.isPlaying ? <Pause size={15} className="fill-black text-black" /> : <Play size={15} className="fill-black text-black ml-0.5" />}
            </button>

            <button
              onClick={onPlayNext}
              className="cursor-pointer text-zinc-400 hover:text-white transition-all hover:scale-105"
              title="Next"
            >
              <SkipForward size={16} />
            </button>
            <button
              onClick={onToggleRepeat}
              className="cursor-pointer text-zinc-400 hover:text-white transition-all hover:scale-105 relative"
              style={playbackState.isRepeat !== 'none' ? { color: '#1db954' } : {}}
              title={`Repeat: ${playbackState.isRepeat}`}
            >
              <Repeat size={14} />
              {playbackState.isRepeat === 'one' && (
                <span className="absolute -top-1 -right-1.5 text-[6px] px-0.5 bg-[#1db954] text-black font-extrabold rounded">1</span>
              )}
            </button>
          </div>

          {/* Dynamic grey line progress timeline that turns green on active */}
          <div className="flex items-center gap-2.5 w-full text-[10.5px] font-mono text-zinc-400 select-none leading-none">
            <span className="w-8 text-right">{formatTime(getEffectiveTime())}</span>
            <div className="flex-1 relative flex items-center group">
              <input
                type="range"
                min="0"
                max={playbackState.duration || 100}
                value={getEffectiveTime()}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer group-hover:h-1.5 transition-all outline-none"
                style={{ accentColor: '#1db954' }}
              />
            </div>
            <span className="w-8 text-left">{formatTime(playbackState.duration)}</span>
          </div>
        </div>

        {/* Right segment volume sliders & full widescreen controls */}
        <div className="flex items-center justify-end gap-4 w-1/4 min-w-[120px]" id="dock-right-utility">
          
          <div className="flex items-center gap-2 group/volume">
            <button onClick={onToggleMute} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" title="Mute">
              {playbackState.isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={playbackState.isMuted ? 0 : playbackState.volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer outline-none group-hover/volume:w-20 transition-all"
              style={{ accentColor: '#1db954' }}
            />
          </div>

          <button
            onClick={onSwitchMode}
            className="cursor-pointer text-zinc-400 hover:text-white p-1 rounded-md transition-all hover:bg-white/5 active:scale-95"
            title="Widescreen Jacket focus mode"
          >
            <Maximize2 size={14} />
          </button>

          <button
            onClick={onTogglePlaylist}
            className="cursor-pointer text-zinc-400 hover:text-white p-1 rounded-md transition-all hover:bg-white/5 relative active:scale-95"
            title="Toggle list drawer"
          >
            <ListMusic size={14} />
            {playlist.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
            )}
          </button>
        </div>
      </footer>

    </div>
  );
}

/* Custom simple icons defined to bypass dependencies barrier */
function LibraryIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-library w-4 h-4 text-zinc-455"
    >
      <path d="m16 6 4 14" />
      <path d="M12 6v14" />
      <path d="M8 8v12" />
      <path d="M4 4v16" />
    </svg>
  );
}
