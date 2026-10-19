/**
 * Lokam Mini — Architecture Inspector UI
 * Displays real-time architecture health, registered services, active location status,
 * graphics quality tier selector, and asset registry entries.
 */

import React, { useState, useEffect } from 'react';
import type { LokamGame } from '../../app/game/LokamGame';
import type { GraphicsPreset } from '../../core/config/GlobalSettings';
import type { FramePerformanceStats } from '../../performance/types';
import {
  Layers,
  Cpu,
  MapPin,
  Package,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Compass,
} from 'lucide-react';

interface ArchitectureInspectorProps {
  game: LokamGame | null;
  perfStats: FramePerformanceStats | null;
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({ game, perfStats }) => {
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'assets' | 'locations'>('overview');
  const [currentPreset, setCurrentPreset] = useState<GraphicsPreset>('high');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!game) return;
    const settings = game.services.settings;
    setCurrentPreset(settings.graphics.preset);
    setIsMobile(settings.current.isMobile);

    const unbind = settings.subscribe((state) => {
      setCurrentPreset(state.graphics.preset);
    });

    return () => {
      unbind();
    };
  }, [game]);

  const handlePresetChange = (preset: GraphicsPreset) => {
    if (game) {
      game.services.settings.setGraphicsPreset(preset);
    }
  };

  const activeLocation = game?.services.locations.getActiveLocation();
  const assetCount = game?.services.assets.getRegisteredIds().length ?? 0;

  return (
    <div className="absolute top-4 left-4 z-40 max-w-sm sm:max-w-md w-full bg-slate-900/90 text-slate-100 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden font-sans text-xs sm:text-sm transition-all">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="font-semibold tracking-wide text-white text-sm">
            LOKAM MINI <span className="text-emerald-400 text-xs font-normal ml-1">Architecture Core</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[11px] font-mono border border-emerald-800">
            {perfStats ? `${perfStats.fps} FPS` : '60 FPS'}
          </span>
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-colors"
            title={minimized ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="p-4 space-y-4">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 px-2 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Core
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-1.5 px-2 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'services' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Services
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`py-1.5 px-2 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'assets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Assets
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-1.5 px-2 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                activeTab === 'locations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Locations
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-400 text-[11px]">Active Location</div>
                  <div className="font-medium text-emerald-300 mt-0.5 truncate">
                    {activeLocation ? activeLocation.name : 'Initializing...'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-400 text-[11px]">Device Target</div>
                  <div className="font-medium text-sky-300 mt-0.5">
                    {isMobile ? 'Mobile Web' : 'Desktop Browser'}
                  </div>
                </div>
              </div>

              {/* Quality Preset Switcher */}
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-xs flex items-center gap-1.5 font-medium">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Global Graphics Quality:
                  </span>
                  <span className="capitalize text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    {currentPreset}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as GraphicsPreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePresetChange(p)}
                      className={`py-1 px-2 rounded text-xs capitalize transition-all font-medium ${
                        currentPreset === p
                          ? 'bg-indigo-500 text-white shadow-sm font-semibold'
                          : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rendering Stats */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
                <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                  <div className="text-slate-400">Draw Calls</div>
                  <div className="text-white font-semibold mt-0.5">{perfStats?.drawCalls ?? 0}</div>
                </div>
                <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                  <div className="text-slate-400">Triangles</div>
                  <div className="text-white font-semibold mt-0.5">{perfStats?.triangles ?? 0}</div>
                </div>
                <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                  <div className="text-slate-400">Frame Time</div>
                  <div className="text-white font-semibold mt-0.5">
                    {perfStats ? `${perfStats.frameTimeMs}ms` : '16ms'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Registered Services */}
          {activeTab === 'services' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                Decoupled services registered in <code className="text-indigo-300">ServiceRegistry</code>:
              </p>
              <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden bg-slate-950/40">
                {[
                  { name: 'eventBus', role: 'Typed Cross-Module Event Bus', status: 'Active' },
                  { name: 'settings', role: 'Global Quality & Controls', status: 'Active' },
                  { name: 'assets', role: 'AssetRegistry & Deduplicated Cache', status: 'Active' },
                  { name: 'materials', role: 'Shared Material Families', status: 'Active' },
                  { name: 'locations', role: 'Location Package Switcher', status: 'Active' },
                  { name: 'audio', role: 'Multi-Channel Audio Routing', status: 'Active' },
                  { name: 'input', role: 'Decoupled Virtual/Key Input', status: 'Active' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div>
                      <div className="font-mono text-indigo-300 font-medium">{s.name}</div>
                      <div className="text-slate-400 text-[11px]">{s.role}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-900">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Asset Registry */}
          {activeTab === 'assets' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Central Asset IDs (Stable Keys):</span>
                <span className="font-mono text-indigo-300">{assetCount} Registered</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {game?.services.assets.getRegisteredIds().map((id) => (
                  <div
                    key={id}
                    className="p-1.5 rounded bg-slate-950/50 border border-slate-800 flex items-center justify-between text-slate-300"
                  >
                    <span className="truncate">{id}</span>
                    <span className="text-[10px] text-slate-500">shared</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Locations */}
          {activeTab === 'locations' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                Independent Location Packages:
              </p>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    Fort Kochi Coastal Isle
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Package: <code className="text-slate-300">src/locations/kochi-island/</code>
                </div>
                <div className="text-[11px] text-slate-400">
                  Spawn Points: 4 (Jetty Promenade, Heritage Square, Auto Stand, Ferry Berth)
                </div>
                <div className="text-[11px] text-slate-400">
                  Interactive Triggers: 4 (Chinese Fishing Nets, Teak Bench, Tea Stall, Ferry Fast Travel)
                </div>
              </div>
            </div>
          )}

          {/* Footer note for AI sessions and developers */}
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Lokam Mini Architecture v0.1</span>
            <span className="text-slate-400">Ready for Subsystems</span>
          </div>
        </div>
      )}
    </div>
  );
};
