/**
 * Lokam Mini — Character Definitions
 */

export interface CharacterArchetype {
  id: string;
  name: string;
  role: 'player' | 'npc_vendor' | 'npc_islander' | 'tourist';
  modelAssetId: string;
  description: string;
}

export const REGISTERED_CHARACTERS: CharacterArchetype[] = [
  {
    id: 'char_explorer_default',
    name: 'Coastal Explorer',
    role: 'player',
    modelAssetId: 'character.explorer.male.01',
    description: 'Standard explorer with linen shirt and walking sandals.',
  },
  {
    id: 'char_chaiwala_moideen',
    name: 'Chaiwala Moideen',
    role: 'npc_vendor',
    modelAssetId: 'character.npc.chaiwala.01',
    description: 'Friendly tea vendor preparing steaming hot kattan chaya.',
  },
];
