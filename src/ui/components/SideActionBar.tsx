/**
 * Lokam Mini — Side Action Bar
 * Sleek, transparent liquid-glass vertical action bar with PROPER ICONS and NO TEXT.
 * Houses Core Diagnostics, Services, Assets, Locations, Graphics Quality, and Respawn.
 */

import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Package,
  MapPin,
  Sliders,
  RotateCcw,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { LokamGame } from '../../app/game/LokamGame';
import type { FramePerformanceStats } from '../../performance/types';
import type { GraphicsPreset } from '../../core/config/GlobalSettings';

interface SideActionBarProps {
  game: LokamGame | null;
  perfStats: FramePerformanceStats | null;
}

type SideBarTab = 'core' | 'services' | 'assets' | 'locations' | 'graphics' | null;

export const SideActionBar: React.FC<SideActionBarProps> = ({ game, perfStats }) => {
  const [activeTab, setActiveTab] = useState<SideBarTab>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const services = game?.services;
  const settings = services?.settings;
  const currentPreset = settings?.graphics.preset || 'high';
  const assetCount = services?.assets.getRegisteredIds().length ?? 0;
  const activeLocation = services?.locations.getActiveLocation();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2000);
  };

  const handleToggleTab = (tab: SideBarTab) => {
    setActiveTab((curr) => (curr === tab ? null : tab));
  };

  const handlePresetSelect = (preset: GraphicsPreset) => {
    settings?.setGraphicsPreset(preset);
    showToast(`Graphics set to ${preset.toUpperCase()}`);
  };

  const handleRespawn = () => {
    services?.eventBus.emit('player:teleported', { position: [0, 0.5, 12] });
    showToast('Respawned at Waterfront Promenade');
  };

  return (
    <div className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-40 flex items-center select-none pointer-events-auto font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute left-16 -top-8 px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 text-white text-[11px] font-medium backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-left-2 duration-150 whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Main Vertical Side Action Bar Capsule */}
      <div className="relative flex items-center">
        {!collapsed ? (
          <div className="flex flex-col items-center rounded-2xl bg-slate-950/45 hover:bg-slate-950/55 backdrop-blur-xl border border-white/30 shadow-[0_12px_36px_rgba(0,0,0,0.4)] p-1.5 transition-all">
            {/* 1. Core / Performance Telemetry */}
            <button
              onClick={() => handleToggleTab('core')}
              title="Core Diagnostics & FPS"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                activeTab === 'core'
                  ? 'bg-amber-400/30 text-amber-300 border border-amber-300/40 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <Activity className="w-5 h-5 drop-shadow-sm stroke-[2]" />
            </button>

            {/* Hairline Divider 1 */}
            <div className="w-6 h-[1px] my-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* 2. Services Registry */}
            <button
              onClick={() => handleToggleTab('services')}
              title="IoC Service Registry"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                activeTab === 'services'
                  ? 'bg-sky-400/30 text-sky-300 border border-sky-300/40 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <Cpu className="w-5 h-5 drop-shadow-sm stroke-[2]" />
            </button>

            {/* Hairline Divider 2 */}
            <div className="w-6 h-[1px] my-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* 3. Asset Registry */}
            <button
              onClick={() => handleToggleTab('assets')}
              title="Asset Manifest Registry"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                activeTab === 'assets'
                  ? 'bg-emerald-400/30 text-emerald-300 border border-emerald-300/40 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <Package className="w-5 h-5 drop-shadow-sm stroke-[2]" />
            </button>

            {/* Hairline Divider 3 */}
            <div className="w-6 h-[1px] my-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* 4. Location Packages */}
            <button
              onClick={() => handleToggleTab('locations')}
              title="Location World Packages"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                activeTab === 'locations'
                  ? 'bg-rose-400/30 text-rose-300 border border-rose-300/40 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <MapPin className="w-5 h-5 drop-shadow-sm stroke-[2]" />
            </button>

            {/* Hairline Divider 4 */}
            <div className="w-6 h-[1px] my-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* 5. Graphics Quality Sliders */}
            <button
              onClick={() => handleToggleTab('graphics')}
              title="Graphics Quality Controls"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                activeTab === 'graphics'
                  ? 'bg-purple-400/30 text-purple-300 border border-purple-300/40 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <Sliders className="w-5 h-5 drop-shadow-sm stroke-[2]" />
            </button>

            {/* Hairline Divider 5 */}
            <div className="w-6 h-[1px] my-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* 6. Quick Respawn Reset */}
            <button
              onClick={handleRespawn}
              title="Respawn / Reset Pier Camera"
              className="w-10 h-10 rounded-xl text-white/85 hover:text-amber-300 hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all cursor-pointer focus:outline-none"
            >
              <RotateCcw className="w-5 h-5 drop-shadow-sm stroke-[2]" />
            </button>

            {/* Hairline Divider 6 */}
            <div className="w-6 h-[1px] my-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* Collapse Bar Toggle */}
            <button
              onClick={() => setCollapsed(true)}
              title="Hide Side Action Bar"
              className="w-7 h-5 rounded-md hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Minimized Handle */
          <button
            onClick={() => setCollapsed(false)}
            title="Expand Side Action Bar"
            className="w-6 h-12 rounded-r-xl bg-slate-950/50 hover:bg-slate-950/70 border-t border-r border-b border-white/30 backdrop-blur-xl text-white/80 hover:text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Flyout Inspector Panel (Opens to the right of the action bar) */}
        {activeTab && !collapsed && (
          <div className="ml-3 w-72 sm:w-80 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-white/25 shadow-[0_16px_40px_rgba(0,0,0,0.5)] p-4 text-white animate-in fade-in slide-in-from-left-3 duration-150">
            {/* Flyout Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center space-x-2">
                {activeTab === 'core' && <Activity className="w-4.5 h-4.5 text-amber-400" />}
                {activeTab === 'services' && <Cpu className="w-4.5 h-4.5 text-sky-400" />}
                {activeTab === 'assets' && <Package className="w-4.5 h-4.5 text-emerald-400" />}
                {activeTab === 'locations' && <MapPin className="w-4.5 h-4.5 text-rose-400" />}
                {activeTab === 'graphics' && <Sliders className="w-4.5 h-4.5 text-purple-400" />}
                <span className="font-bold text-xs uppercase tracking-wider text-slate-100">
                  {activeTab === 'core' && 'Core Diagnostics'}
                  {activeTab === 'services' && 'Service Registry'}
                  {activeTab === 'assets' && `Assets (${assetCount})`}
                  {activeTab === 'locations' && 'Location Packages'}
                  {activeTab === 'graphics' && 'Graphics Quality'}
                </span>
              </div>
              <button
                onClick={() => setActiveTab(null)}
                className="w-6 h-6 rounded-full hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Flyout Body Content */}
            <div className="mt-3 text-xs space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Tab 1: Core */}
              {activeTab === 'core' && (
                <div className="space-y-3 font-mono">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase">FPS</div>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">
                        {perfStats?.fps ?? 60}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase">Frame Time</div>
                      <div className="text-base font-bold text-sky-300 mt-0.5">
                        {perfStats?.frameTimeMs ?? 16.6}ms
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase">Draw Calls</div>
                      <div className="text-base font-bold text-amber-300 mt-0.5">
                        {perfStats?.drawCalls ?? 0}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase">Triangles</div>
                      <div className="text-base font-bold text-purple-300 mt-0.5">
                        {perfStats?.triangles ?? 0}
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-sans">
                    <div className="text-slate-400 text-[10px]">Active Location:</div>
                    <div className="font-semibold text-emerald-300 mt-0.5">
                      {activeLocation?.name ?? 'Fort Kochi Coastal Isle'}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Services */}
              {activeTab === 'services' && (
                <div className="space-y-1.5">
                  {[
                    { key: 'eventBus', label: 'Cross-module event dispatcher' },
                    { key: 'settings', label: 'Audio & graphics preferences' },
                    { key: 'assets', label: 'Deduplicated asset cache' },
                    { key: 'materials', label: 'Shared material families' },
                    { key: 'locations', label: 'Package loader & switcher' },
                    { key: 'audio', label: 'Multi-channel audio mixer' },
                    { key: 'input', label: 'Touch & keyboard provider' },
                  ].map((s) => (
                    <div
                      key={s.key}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-sky-300 text-[11px]">{s.key}</div>
                        <div className="text-[10px] text-slate-400">{s.label}</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        ONLINE
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Assets */}
              {activeTab === 'assets' && (
                <div className="space-y-1 font-mono text-[10.5px]">
                  {services?.assets.getRegisteredIds().map((id) => (
                    <div
                      key={id}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-slate-200"
                    >
                      <span className="truncate pr-2">{id}</span>
                      <span className="text-[9px] text-emerald-400 uppercase">shared</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Locations */}
              {activeTab === 'locations' && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">
                        {activeLocation?.name ?? 'Fort Kochi Isle'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Colonial heritage streets, Chinese fishing nets, coastal jetty promenade.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 5: Graphics Quality */}
              {activeTab === 'graphics' && (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-slate-300">Select rendering preset:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['low', 'medium', 'high'] as GraphicsPreset[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePresetSelect(p)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          currentPreset === p
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {currentPreset === p && <Check className="w-3 h-3 stroke-[3]" />}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
