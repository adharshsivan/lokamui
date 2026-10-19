/**
 * Lokam Mini — Master Game HUD
 * Neatly coordinates all mobile landscape HUD components:
 * Top-left profile, top-right currency/menu & minimap, bottom-left joystick,
 * bottom-center action dock, and bottom-right action buttons.
 * Features fluid cubic-bezier animations when switching between gameplay HUD, Camera Mode,
 * and the 8-station Radial Radio Wheel.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { LokamGame } from '../../app/game/LokamGame';
import { PlayerProfileBadge } from './PlayerProfileBadge';
import { Minimap } from './Minimap';
import { VirtualJoystick } from './VirtualJoystick';
import { BottomActionTray } from './BottomActionTray';
import { FistButton } from './FistButton';
import { JumpButton } from './JumpButton';
import { BagButton } from './BagButton';
import { InteractionPrompt } from './InteractionPrompt';
import { GameSettingsModal } from './GameSettingsModal';
import { WebControlsPlaceholder } from './WebControlsPlaceholder';
import { CameraModeOverlay } from './CameraModeOverlay';
import { RadioWheelOverlay, STATIONS, StationItem } from './RadioWheelOverlay';
import { RadioStationsModal, CATALOG_STATIONS } from './RadioStationsModal';
import { radioAudioService } from '../../services/radio/RadioAudioService';
import { ChatModal } from './ChatModal';
import { ActivityDockPopup, ActivityPopupType, ActivityItem } from './ActivityDockPopup';
import { InventoryModal } from './InventoryModal';
import { FriendsModal } from './FriendsModal';

interface GameHUDProps {
  game: LokamGame | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({ game }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [radioWheelOpen, setRadioWheelOpen] = useState(false);
  const [stationsModalOpen, setStationsModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [dockPopup, setDockPopup] = useState<ActivityPopupType | null>(null);
  const [lastDockPopupType, setLastDockPopupType] = useState<ActivityPopupType>('games');
  const [activeGesture, setActiveGesture] = useState<ActivityItem | null>(null);
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [activeStationId, setActiveStationId] = useState('sooriyan_fm');
  const [hudToast, setHudToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setHudToast({ id: Date.now(), text });
    toastTimeoutRef.current = setTimeout(() => {
      setHudToast(null);
    }, 2800);
  };

  // Synchronize Camera Mode with FPV Camera Controller
  useEffect(() => {
    game?.getEngine().cameraController.setFPVMode(cameraMode);
  }, [cameraMode, game]);

  useEffect(() => {
    return () => {
      if (gestureTimerRef.current) {
        clearTimeout(gestureTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (dockPopup) {
      setLastDockPopupType(dockPopup);
    }
  }, [dockPopup]);
  const [wheelStationIds, setWheelStationIds] = useState<string[]>(() => STATIONS.map((s) => s.id));

  // Sync state with Radio Audio Service
  useEffect(() => {
    const unsubscribe = radioAudioService.subscribe((state) => {
      setActiveStationId(state.activeStationId);
    });
    return unsubscribe;
  }, []);

  const inputService = game?.services.input;
  const activeLocation = game?.services.locations.getActiveLocation();
  const locationName = activeLocation?.name || 'Aazhi Waterfront';

  // Compute custom wheel stations with 8 radial 45° sectors and streaming URLs
  const customWheelStations: StationItem[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, index) => {
      const id = wheelStationIds[index];
      // Slot 0 (the top power slot) when off or undefined is the master power switch NO STATION / OFF
      if (index === 0 && (!id || id === 'off')) {
        return {
          id: 'off',
          name: 'NO STATION',
          freq: 'OFF',
          angleDeg: 0,
          iconType: 'power',
          colorHex: '#ffffff',
          streamUrl: '',
          isEmpty: true,
        };
      }

      // Any other unconfigured or empty slot shows as EMPTY SLOT with the empty icon
      if (!id || id === 'off' || id.startsWith('empty_')) {
        return {
          id: `empty_${index}`,
          name: 'EMPTY SLOT',
          freq: 'EMPTY',
          angleDeg: index * 45,
          iconType: 'empty',
          colorHex: '#ffffff',
          streamUrl: '',
          isEmpty: true,
        };
      }
      const catalogItem = CATALOG_STATIONS.find((c) => c.id === id);
      const defaultItem = STATIONS.find((s) => s.id === id);
      return {
        id,
        name: catalogItem?.name || defaultItem?.name || id.toUpperCase(),
        freq: catalogItem?.freq || defaultItem?.freq || 'FM',
        angleDeg: index * 45,
        iconType: catalogItem?.iconType || defaultItem?.iconType || 'radio',
        colorHex: catalogItem?.colorHex || defaultItem?.colorHex || '#ffffff',
        streamUrl: catalogItem?.streamUrl || defaultItem?.streamUrl || '',
        language: (catalogItem?.language?.toLowerCase() as 'malayalam' | 'tamil' | 'english') || defaultItem?.language,
      };
    });
  }, [wheelStationIds]);

  const currentPlayingStation =
    CATALOG_STATIONS.find((s) => s.id === activeStationId) ||
    STATIONS.find((s) => s.id === activeStationId);

  const handleActionTrigger = (actionName: string) => {
    if (actionName === 'camera') {
      setCameraMode(true);
      setDockPopup(null);
      showToast('📷 Photo Mode Activated');
    } else if (actionName === 'radio') {
      setRadioWheelOpen((prev) => !prev);
      setDockPopup(null);
      showToast('📻 Radio Stations Wheel');
    } else if (actionName === 'chat') {
      setChatOpen((prev) => !prev);
      setDockPopup(null);
      showToast('💬 In-Game World Chat');
    } else if (actionName === 'games') {
      setDockPopup((prev) => (prev === 'games' ? null : 'games'));
      showToast('🎮 Island Mini-Games');
    } else if (actionName === 'city') {
      setDockPopup((prev) => (prev === 'city' ? null : 'city'));
      showToast('🏛️ Fort Kochi City & Destinations');
    } else if (actionName === 'gestures' || actionName === 'gesture') {
      setDockPopup((prev) => (prev === 'gestures' ? null : 'gestures'));
      showToast('👋 Gestures & Emotes');
    } else if (actionName === 'friends') {
      setFriendsOpen((prev) => !prev);
      setDockPopup(null);
      showToast('👥 Friends & Island Party');
    } else if (actionName === 'bag' || actionName === 'backpack') {
      setInventoryOpen((prev) => !prev);
      setDockPopup(null);
      showToast('🎒 Island Backpack');
    } else if (actionName === 'mic') {
      showToast('🎙️ Voice Chat: Fort Kochi Proximity Channel Active');
    }
  };

  const handleMiniGameSelect = (item: ActivityItem) => {
    const coords: Record<string, [number, number, number]> = {
      cycling_race: [0, 0.4, 25],
      fishing: [-5, 0.4, -25],
      delivery_run: [3, 0.4, -10],
      boat_race: [-6, 0.4, 40],
      parkour: [2, 0.4, 5],
    };
    const target = coords[item.id] || [0, 0.4, 10];
    game?.services.eventBus.emit('player:teleported', { position: target });
    showToast(`Activity: ${item.title.replace('\n', ' ')} Started!`);
  };

  const handleCityPlaceSelect = (item: ActivityItem) => {
    const coords: Record<string, [number, number, number]> = {
      sarvam_theater: [4, 0.4, 30],
      heritage_museum: [-3, 0.4, -20],
      aazhi_stadium: [0, 0.4, 50],
      cafe_rooftop: [4, 0.4, -5],
      paradise_mall: [-2, 0.4, 15],
    };
    const target = coords[item.id] || [0, 0.4, 10];
    game?.services.eventBus.emit('player:teleported', { position: target });
    showToast(`Visiting: ${item.title.replace('\n', ' ')}`);
  };

  const handleInteraction = (id: string) => {
    game?.services.eventBus.emit('interaction:started', {
      interactionId: id,
      type: 'ride',
    });
  };

  return (
    <>
      {/* ── STANDARD GAMEPLAY HUD LAYER ── */}
      <div
        className="absolute inset-0 z-30 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 pt-[max(12px,env(safe-area-inset-top))] pb-[max(12px,env(safe-area-inset-bottom))] pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] overflow-hidden"
      >
        {/* ── TOP HUD LAYER (Slides Up on Camera Mode) ── */}
        <div
          className={`flex items-start justify-between w-full transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            cameraMode ? '-translate-y-6 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Top-Left: Circular Radar Minimap */}
          <div className="flex flex-col items-start">
            <Minimap
              game={game}
              inputService={inputService}
              locationTitle={locationName}
            />
          </div>

          {/* Top-Right: Player Profile Avatar (Opens Game Settings Menu) */}
          <div className="flex items-center pointer-events-auto">
            <PlayerProfileBadge onClick={() => setSettingsOpen(true)} />
          </div>
        </div>

        {/* ── MIDDLE GROUND: Contextual In-World Prompt ── */}
        <div
          className={`transition-all duration-300 ${
            cameraMode ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <InteractionPrompt
            prompt={{
              id: 'kerala_roadster_bike_01',
              label: 'Ride',
              type: 'ride',
              screenPosition: { x: 53, y: 52 },
            }}
            onInteract={handleInteraction}
          />
        </div>

        {/* ── BOTTOM HUD LAYER ── */}
        <div className="flex items-end justify-between w-full">
          {/* Bottom-Left: Virtual Joystick D-Pad (Remains accessible in FPV Camera Mode with soft opacity) */}
          <div
            className={`flex flex-col items-start space-y-2 pointer-events-auto transition-opacity duration-300 ${
              cameraMode ? 'opacity-50 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <VirtualJoystick inputService={inputService} size={146} />
            {/* Subtle indicator for desktop users */}
            <WebControlsPlaceholder showHint={false} />
          </div>

          {/* Bottom-Center: Collapsible Utility Dock (Slides Down on Camera Mode) */}
          <div
            className={`relative mb-1 z-50 flex flex-col items-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              cameraMode ? 'translate-y-12 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
            }`}
          >
            {/* Minimal Activity, Gestures & City Dock Popup (Matches Standard Monochrome HUD) */}
            <ActivityDockPopup
              type={dockPopup || lastDockPopupType}
              isOpen={Boolean(dockPopup)}
              onClose={() => setDockPopup(null)}
              onSelectItem={(item) => {
                const currentType = dockPopup || lastDockPopupType;
                if (currentType === 'gestures') {
                  setActiveGesture(item);
                  if (gestureTimerRef.current) {
                    clearTimeout(gestureTimerRef.current);
                  }
                  gestureTimerRef.current = setTimeout(() => {
                    setActiveGesture(null);
                  }, 5000);
                  try {
                    game?.services.eventBus.emit('player:emote', { emoteId: item.id });
                    showToast(`Emote: ${item.title.replace('\n', ' ')}`);
                  } catch (e) {
                    console.debug('Emote event:', item.id);
                  }
                } else if (currentType === 'games') {
                  handleMiniGameSelect(item);
                } else if (currentType === 'city') {
                  handleCityPlaceSelect(item);
                }
              }}
            />

            <BottomActionTray
              onActionTrigger={handleActionTrigger}
              radioActive={activeStationId !== 'off'}
              radioColor={activeStationId !== 'off' ? currentPlayingStation?.colorHex : undefined}
              activeStationName={activeStationId !== 'off' ? currentPlayingStation?.name : undefined}
              activeDockItem={dockPopup || undefined}
              activeGesture={activeGesture}
            />
          </div>

          {/* Bottom-Right Action Buttons: Stacked Vertically (Fist -> Jump -> Bag) (Slides Down on Camera Mode) */}
          <div
            className={`flex flex-col items-center space-y-3 mb-2 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              cameraMode ? 'translate-y-12 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
            }`}
          >
            {/* 1. Fist (Top) */}
            <FistButton
              inputService={inputService}
              size={58}
              onPunch={() => {
                try {
                  const charModule = game?.lifecycle.get('character') as any;
                  charModule?.getPlayer()?.triggerPunch();
                } catch {}
              }}
            />
            {/* 2. Jump (Middle) */}
            <JumpButton
              inputService={inputService}
              size={58}
              onJump={() => {
                if (inputService) {
                  inputService.setVirtualAction('jump', true);
                }
              }}
            />
            {/* 3. Bag / Backpack (Bottom) */}
            <BagButton
              size={58}
              onOpenBag={() => {
                handleActionTrigger('bag');
              }}
            />
          </div>
        </div>
      </div>

      {/* ── FULL-SCREEN CAMERA / PHOTO MODE OVERLAY ── */}
      <CameraModeOverlay
        isOpen={cameraMode}
        onClose={() => setCameraMode(false)}
        game={game}
      />

      {/* ── INTERACTIVE 8-STATION RADIAL RADIO WHEEL (Neutral Smoked Glass) ── */}
      <RadioWheelOverlay
        isOpen={radioWheelOpen}
        onClose={() => setRadioWheelOpen(false)}
        activeStationId={activeStationId}
        onSelectStation={(id) => setActiveStationId(id)}
        onOpenStationsModal={() => {
          setRadioWheelOpen(false);
          setStationsModalOpen(true);
        }}
        customStations={customWheelStations}
      />

      {/* ── TROPICAL RADIO STATIONS SELECTOR & CONFIGURATION MODAL ── */}
      <RadioStationsModal
        isOpen={stationsModalOpen}
        onClose={() => setStationsModalOpen(false)}
        activeStationId={activeStationId}
        onPlayStation={(id, streamUrl, stationName) => {
          if (id === 'off') {
            radioAudioService.stop();
            setActiveStationId('off');
          } else {
            radioAudioService.playStation(id, streamUrl, stationName);
            setActiveStationId(id);
          }
        }}
        wheelStationIds={wheelStationIds}
        onApplyWheelStations={(newIds) => setWheelStationIds(newIds)}
      />

      {/* ── IN-GAME WORLD CHAT BOX ── */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* ── NEON SEASIDE GAME SETTINGS MENU MODAL ── */}
      <GameSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        game={game}
      />

      {/* ── ISLAND BACKPACK & INVENTORY MODAL ── */}
      <InventoryModal
        isOpen={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        onUseItem={(item) => {
          showToast(`Used: ${item.name}`);
        }}
      />

      {/* ── FRIENDS & SOCIAL PARTY MODAL ── */}
      <FriendsModal
        isOpen={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        onTeleportToFriend={(friend) => {
          game?.services.eventBus.emit('player:teleported', { position: [0, 0.4, 12] });
          showToast(`Joined ${friend.name} at ${friend.location}!`);
          setFriendsOpen(false);
        }}
        onInviteFriend={(friend) => {
          showToast(`Party invite sent to ${friend.name}!`);
        }}
      />

      {/* ── HUD LIVE ACTION TOAST NOTIFICATION ── */}
      {hudToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-2 rounded-full bg-neutral-950/90 backdrop-blur-xl border border-white/20 text-white text-xs sm:text-sm font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{hudToast.text}</span>
          </div>
        </div>
      )}
    </>
  );
};
