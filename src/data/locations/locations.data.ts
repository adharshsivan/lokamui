/**
 * Lokam Mini — Location Data Definitions
 */

export interface LocationMeta {
  id: string;
  name: string;
  region: string;
  description: string;
  packagePath: string;
}

export const REGISTERED_LOCATIONS: LocationMeta[] = [
  {
    id: 'kochi-island',
    name: 'Fort Kochi Isle',
    region: 'Kerala Coast',
    description: 'Colonial heritage streets, Chinese fishing nets, coastal jetty promenade.',
    packagePath: '@/locations/kochi-island',
  },
  {
    id: 'alappuzha-backwaters',
    name: 'Alappuzha Backwaters',
    region: 'Kerala Backwaters',
    description: 'Palm-fringed canals, houseboats, and interconnected coastal lagoons.',
    packagePath: '@/locations/alappuzha-backwaters',
  },
];
