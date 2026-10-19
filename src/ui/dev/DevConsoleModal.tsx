/**
 * Lokam Mini — Dev Console Modal
 * Technical developer console completely separated from the in-game HUD.
 * Provides live architectural diagnostics, service inspection, asset registry queries,
 * graphics quality controls, and full Atmospheric Sky, Sun/Moon, and Weather developer controls.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Cpu,
  Package,
  MapPin,
  Sliders,
  Terminal,
  Sun,
  CloudRain,
  Droplets,
  Zap,
  Moon,
  Wind,
  Eye,
  Play,
  Pause,
  FastForward,
} from 'lucide-react';
import type { LokamGame } from '../../app/game/LokamGame';
import type { FramePerformanceStats } from '../../performance/types';
import type { GraphicsPreset } from '../../core/config/GlobalSettings';
import type { SkyState } from '../../world/sky/SkyService';
import { WEATHER_ORDER, type WeatherName } from '../../world/sky/weather';

interface DevConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: LokamGame | null;
  perfStats: FramePerformanceStats | null;
}

export const DevConsoleModal: React.FC<DevConsoleModalProps> = ({
  isOpen,
  onClose,
  game,
  perfStats,
}) => {
  const [activeTab, setActiveTab] = useState<
    'sky' | 'metrics' | 'services' | 'assets' | 'locations'
  >('sky');

  const [skyState, setSkyState] = useState<SkyState | null>(null);

  const services = game?.services;
  const skyService = services?.sky;
  const settings = services?.settings;
  const currentPreset = settings?.graphics.preset || 'high';
  const assetCount = services?.assets.getRegisteredIds().length ?? 0;
  const activeLocation = services?.locations.getActiveLocation();

  useEffect(() => {
    if (!skyService) return;
    const unsubscribe = skyService.subscribe((state) => {
      setSkyState({ ...state });
    });
    return unsubscribe;
  }, [skyService]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: GraphicsPreset) => {
    settings?.setGraphicsPreset(preset);
  };

  const formatHour = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.floor((h - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayH.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period} (${h.toFixed(1)}h)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none font-mono">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200 text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider">LOKAM_MINI // DEV_DIAGNOSTICS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
              v0.2.0-sky
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-2 pt-1 gap-1 text-[11px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('sky')}
            className={`px-3 py-1.5 rounded-t font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sky'
                ? 'bg-slate-950 text-amber-300 border-t border-l border-r border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Sky & Weather
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-t font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-slate-950 text-emerald-400 border-t border-l border-r border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-t font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'bg-slate-950 text-emerald-400 border-t border-l border-r border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3 py-1.5 rounded-t font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-slate-950 text-emerald-400 border-t border-l border-r border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Assets ({assetCount})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-1.5 rounded-t font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-slate-950 text-emerald-400 border-t border-l border-r border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Locations
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB: SKY & WEATHER CONTROLS */}
          {activeTab === 'sky' && skyState && (
            <div className="space-y-4">
              {/* 1. Time of Day & Speed */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Time of Day & Solar Celestial Position</span>
                  </div>
                  <span className="text-amber-300 font-bold bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    {formatHour(skyState.hour)}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.05"
                  value={skyState.hour}
                  onChange={(e) => skyService?.setHour(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                {/* Quick Time Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '🌅 Dawn', hour: 5.6 },
                    { label: '☀️ Morning', hour: 8.5 },
                    { label: '🌞 High Noon', hour: 12.0 },
                    { label: '🌇 Golden Hour', hour: 17.2 },
                    { label: '🌆 Sunset', hour: 18.5 },
                    { label: '🌙 Twilight', hour: 19.8 },
                    { label: '🌌 Midnight', hour: 0.0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => skyService?.setHour(p.hour)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 font-medium transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Time Flow Speed Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px]">Time Progression Speed:</span>
                  <div className="flex gap-1.5">
                    {[
                      { label: 'Pause', speed: 0, icon: <Pause className="w-3 h-3" /> },
                      { label: '1x (Real)', speed: 1, icon: <Play className="w-3 h-3" /> },
                      { label: '60x (1m/s)', speed: 60, icon: <FastForward className="w-3 h-3" /> },
                      { label: '300x (Rapid)', speed: 300, icon: <FastForward className="w-3 h-3" /> },
                      { label: '1200x (Cycle)', speed: 1200, icon: <FastForward className="w-3 h-3" /> },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => skyService?.setTimeSpeed(s.speed)}
                        className={`px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors ${
                          skyState.timeSpeed === s.speed
                            ? 'bg-amber-500 text-black shadow'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                        }`}
                      >
                        {s.icon}
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Astronomy Telemetry Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-850">
                    <span className="text-slate-500 block">Sun Elevation</span>
                    <span className="text-amber-400 font-bold">{skyState.astro.sunElev.toFixed(1)}°</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-850">
                    <span className="text-slate-500 block">Moon Elevation</span>
                    <span className="text-sky-300 font-bold">{skyState.astro.moonElev.toFixed(1)}°</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-850">
                    <span className="text-slate-500 block">Moon Phase</span>
                    <span className="text-indigo-300 font-bold">{skyState.astro.phaseName}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-850">
                    <span className="text-slate-500 block">Moon Illumination</span>
                    <span className="text-emerald-400 font-bold">
                      {(skyState.astro.moonIllum * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Weather Presets */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <CloudRain className="w-4 h-4 text-sky-400" />
                    <span>Atmospheric Weather Presets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skyState.autoForecast}
                        onChange={(e) => skyService?.setAutoForecast(e.target.checked)}
                        className="accent-sky-400"
                      />
                      <span>Auto Forecast Cycle</span>
                    </label>
                  </div>
                </div>

                {/* Weather Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEATHER_ORDER.map((wName) => {
                    const isSelected = skyState.weatherName === wName;
                    return (
                      <button
                        key={wName}
                        onClick={() => skyService?.setWeatherPreset(wName)}
                        className={`py-2 px-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/80 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                            : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-[11px]">{wName}</span>
                          {isSelected && <span className="text-sky-400 text-[9px] font-bold">ACTIVE</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Fine-Tuning Parameter Sliders */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Atmospheric & Optical Sliders</span>
                  </div>
                  <button
                    onClick={() => skyService?.triggerLightningStrike()}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    ⚡ Trigger Lightning Strike
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-1">
                  {/* Cloud Cover */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Cloud Cover</span>
                      <span className="text-white font-bold">{skyState.params.cover.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.params.cover}
                      onChange={(e) => skyService?.setWeatherParam('cover', parseFloat(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {/* Cloud Speed */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Cloud Drift Speed</span>
                      <span className="text-white font-bold">{skyState.params.cloudSpeed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2.5"
                      step="0.05"
                      value={skyState.params.cloudSpeed}
                      onChange={(e) =>
                        skyService?.setWeatherParam('cloudSpeed', parseFloat(e.target.value))
                      }
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {/* Aerosol Haze */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Atmospheric Haze</span>
                      <span className="text-white font-bold">{skyState.params.haze.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.params.haze}
                      onChange={(e) => skyService?.setWeatherParam('haze', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Sea Fog */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Sea Fog Density</span>
                      <span className="text-white font-bold">{skyState.params.fog.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.params.fog}
                      onChange={(e) => skyService?.setWeatherParam('fog', parseFloat(e.target.value))}
                      className="w-full accent-slate-300 cursor-pointer"
                    />
                  </div>

                  {/* Rain Intensity */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Rain Intensity</span>
                      <span className="text-white font-bold">{skyState.params.rain.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.params.rain}
                      onChange={(e) => skyService?.setWeatherParam('rain', parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Storm Cloud Deck */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Storm Cloud Darkening</span>
                      <span className="text-white font-bold">{skyState.params.storm.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.params.storm}
                      onChange={(e) => skyService?.setWeatherParam('storm', parseFloat(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                  {/* Lightning Strike Rate */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Lightning Strike Rate</span>
                      <span className="text-white font-bold">{skyState.params.lightning.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.params.lightning}
                      onChange={(e) =>
                        skyService?.setWeatherParam('lightning', parseFloat(e.target.value))
                      }
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Wind Direction */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Wind Direction</span>
                      <span className="text-white font-bold">{skyState.params.windDir.toFixed(0)}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={skyState.params.windDir}
                      onChange={(e) => skyService?.setWeatherParam('windDir', parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* Direct Sun Radiance */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Sun Intensity Multiplier</span>
                      <span className="text-white font-bold">{skyState.params.sunI.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={skyState.params.sunI}
                      onChange={(e) => skyService?.setWeatherParam('sunI', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Stars Brightness */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Starfield & Milky Way Glow</span>
                      <span className="text-white font-bold">{skyState.params.stars.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={skyState.params.stars}
                      onChange={(e) => skyService?.setWeatherParam('stars', parseFloat(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Realistic 3D Atmospheric Rain FX (RainFX) */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span>Realistic 3D Atmospheric Rain (RainFX)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skyState.rain.enabled}
                      onChange={(e) => skyService?.setRainControl('enabled', e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span>Rain FX Active</span>
                  </label>
                </div>

                {/* Quick Rain Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      skyService?.setRainControl('enabled', true);
                      skyService?.setRainControl('intensity', 0.35);
                      skyService?.setWeatherParam('wind', 0.25);
                    }}
                    className="py-1.5 px-2 rounded bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] text-slate-200 text-left transition-all cursor-pointer"
                  >
                    🌦️ Light Drizzle
                  </button>
                  <button
                    onClick={() => {
                      skyService?.setRainControl('enabled', true);
                      skyService?.setRainControl('intensity', 0.75);
                      skyService?.setWeatherParam('wind', 0.55);
                    }}
                    className="py-1.5 px-2 rounded bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] text-slate-200 text-left transition-all cursor-pointer"
                  >
                    🌧️ Monsoon Rain
                  </button>
                  <button
                    onClick={() => {
                      skyService?.setRainControl('enabled', true);
                      skyService?.setRainControl('intensity', 1.0);
                      skyService?.setWeatherParam('wind', 0.9);
                      skyService?.setWeatherParam('storm', 0.85);
                    }}
                    className="py-1.5 px-2 rounded bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] text-slate-200 text-left transition-all cursor-pointer"
                  >
                    ⛈️ Tropical Squall
                  </button>
                  <button
                    onClick={() => {
                      skyService?.setRainControl('intensity', 0);
                    }}
                    className="py-1.5 px-2 rounded bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 text-left transition-all cursor-pointer"
                  >
                    ☀️ Clear & Dry
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-1">
                  {/* Rain Intensity Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Precipitation Intensity</span>
                      <span className="text-cyan-300 font-bold">
                        {(skyState.rain.intensity * 100).toFixed(0)}%
                        {skyState.rain.intensity === 0
                          ? ' (Dry)'
                          : skyState.rain.intensity < 0.4
                          ? ' (Drizzle)'
                          : skyState.rain.intensity < 0.8
                          ? ' (Steady)'
                          : ' (Torrential)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={skyState.rain.intensity}
                      onChange={(e) =>
                        skyService?.setRainControl('intensity', parseFloat(e.target.value))
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Fall Speed */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Fall Speed</span>
                      <span className="text-white font-bold">{skyState.rain.speed.toFixed(1)} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="24"
                      step="0.5"
                      value={skyState.rain.speed}
                      onChange={(e) =>
                        skyService?.setRainControl('speed', parseFloat(e.target.value))
                      }
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* Wind Velocity Drift */}
                  <div className="sm:col-span-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Wind Velocity Drift</span>
                      <span className="text-amber-300 font-bold">
                        {(skyState.params.wind * 100).toFixed(0)}% @ {skyState.params.windDir.toFixed(0)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={skyState.params.wind}
                      onChange={(e) => skyService?.setWeatherParam('wind', parseFloat(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Toggles Row: Ground Splashes */}
                <div className="flex items-center gap-6 pt-1 text-[11px] border-t border-slate-800/80">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={skyState.rain.splashes}
                      onChange={(e) => skyService?.setRainControl('splashes', e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span>Perspective Ground Ripples & Splashes</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Telemetry & Quality */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">FPS</div>
                  <div className="text-lg font-bold text-emerald-400">{perfStats?.fps ?? 60}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Frame Time</div>
                  <div className="text-lg font-bold text-sky-400">{perfStats?.frameTimeMs ?? 16} ms</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Draw Calls</div>
                  <div className="text-lg font-bold text-amber-400">{perfStats?.drawCalls ?? 0}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Triangles</div>
                  <div className="text-lg font-bold text-purple-400">{perfStats?.triangles ?? 0}</div>
                </div>
              </div>

              {/* Graphics Presets */}
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Global Quality Tier:
                  </span>
                  <span className="text-emerald-400 font-bold uppercase">{currentPreset}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as GraphicsPreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePresetSelect(p)}
                      className={`py-1.5 px-2 rounded uppercase text-center font-bold transition-all cursor-pointer ${
                        currentPreset === p
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Services */}
          {activeTab === 'services' && (
            <div className="space-y-2">
              <div className="text-slate-400 text-[11px]">
                Registered Singletons in <span className="text-emerald-400">ServiceRegistry</span>:
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="py-1">SERVICE KEY</th>
                    <th className="py-1">ROLE</th>
                    <th className="py-1 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {[
                    { key: 'sky', role: 'Atmospheric Sky, Sun, Moon & Weather System', status: 'ONLINE' },
                    { key: 'eventBus', role: 'Typed publish/subscribe bus', status: 'ONLINE' },
                    { key: 'settings', role: 'Graphics & Audio configuration', status: 'ONLINE' },
                    { key: 'assets', role: 'AssetRegistry & Request Deduplication', status: 'ONLINE' },
                    { key: 'materials', role: 'Shared Material Families', status: 'ONLINE' },
                    { key: 'locations', role: 'Independent Location Loader', status: 'ONLINE' },
                    { key: 'audio', role: 'Multi-channel Audio Router', status: 'ONLINE' },
                    { key: 'input', role: 'Decoupled Touch/Keyboard Provider', status: 'ONLINE' },
                  ].map((s) => (
                    <tr key={s.key}>
                      <td className="py-1.5 font-bold text-sky-400">{s.key}</td>
                      <td className="py-1.5 text-slate-400">{s.role}</td>
                      <td className="py-1.5 text-right text-emerald-400 font-bold">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Asset Registry */}
          {activeTab === 'assets' && (
            <div className="space-y-2">
              <div className="text-slate-400 text-[11px]">
                Active Manifest Entries (<span className="text-indigo-400">Stable IDs</span>):
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {services?.assets.getRegisteredIds().map((id) => (
                  <div
                    key={id}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300"
                  >
                    <span className="font-mono text-emerald-300">{id}</span>
                    <span className="text-[10px] text-slate-500 uppercase">shared</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Locations */}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{activeLocation?.name ?? 'None'}</span>
                  <span className="text-emerald-400 text-[10px] font-bold">LOADED</span>
                </div>
                <div className="text-slate-400 text-[11px]">ID: {activeLocation?.id}</div>
                <div className="text-slate-400 text-[11px]">
                  Config Bounds: X: [{activeLocation?.config.bounds.minX},{' '}
                  {activeLocation?.config.bounds.maxX}], Z: [{activeLocation?.config.bounds.minZ},{' '}
                  {activeLocation?.config.bounds.maxZ}]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
          <span>Decoupled Developer Controls</span>
          <span className="text-emerald-400">OK</span>
        </div>
      </div>
    </div>
  );
};
