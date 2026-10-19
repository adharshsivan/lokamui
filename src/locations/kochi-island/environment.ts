/**
 * Lokam Mini — Kochi Island Environment
 * Sets up atmospheric tropical coastal environment:
 * Seaside stone promenade, colonial balustrade, bicycle prop, coconut palms,
 * cantilevered Chinese fishing nets, wooden pier pavilion, and turquoise water.
 */

import * as THREE from 'three';
import type { LocationConfig } from '../types';
import type { MaterialRegistry } from '../../assets/MaterialRegistry';
import { EntranceBeacon, type BuildingEntranceConfig } from '../../world/buildings/EntranceIndicator';

export class KochiEnvironment {
  readonly group = new THREE.Group();
  private lights: THREE.Light[] = [];
  private waterMesh: THREE.Mesh | null = null;
  private groundMesh: THREE.Mesh | null = null;
  private animatedElements: Array<(elapsed: number) => void> = [];
  private entranceBeacons: EntranceBeacon[] = [];
  private onBuildingEnterCallback?: (building: BuildingEntranceConfig) => void;

  constructor(
    private config: LocationConfig,
    private materials: MaterialRegistry
  ) {
    this.group.name = 'kochi_island_environment';
  }

  build(): void {
    // Subtle Hemisphere Light for tropical sky/ground ambient bounce
    const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x854d0e, 0.35);
    this.group.add(hemi);
    this.lights.push(hemi);

    // 3. Island Ground Base (Lush Tropical Turf)
    const groundGeo = new THREE.CylinderGeometry(160, 180, 2, 64);
    const grassMat = this.materials.get('ground.grass');
    this.groundMesh = new THREE.Mesh(groundGeo, grassMat);
    this.groundMesh.position.set(0, -1, 0);
    this.groundMesh.receiveShadow = true;
    this.group.add(this.groundMesh);

    // 4. Curved Seaside Promenade (Warm Sandstone Pavement)
    const promGeo = new THREE.BoxGeometry(18, 0.4, 120);
    const promMat = new THREE.MeshStandardMaterial({
      color: 0xe2d4c0, // Warm Kochi cobblestone sandstone
      roughness: 0.85,
      metalness: 0.05,
    });
    const promenade = new THREE.Mesh(promGeo, promMat);
    promenade.position.set(0, 0.2, 10);
    promenade.receiveShadow = true;
    this.group.add(promenade);

    // 5. Colonial Seaside Stone Balustrade (Fence along water)
    const balustradeGroup = new THREE.Group();
    const pillarMat = this.materials.get('wall.plaster.warm');
    const railMat = this.materials.get('wood.dark');

    for (let z = -40; z <= 60; z += 5) {
      // Stone pillar
      const pillarGeo = new THREE.BoxGeometry(0.8, 1.4, 0.8);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(7, 0.9, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      balustradeGroup.add(pillar);

      // Wooden top railing segment
      if (z < 60) {
        const railGeo = new THREE.BoxGeometry(0.3, 0.25, 4.8);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(7, 1.4, z + 2.5);
        rail.castShadow = true;
        balustradeGroup.add(rail);

        // Lower wrought iron rail
        const ironGeo = new THREE.BoxGeometry(0.1, 0.1, 4.8);
        const ironMat = this.materials.get('metal.paint');
        const iron = new THREE.Mesh(ironGeo, ironMat);
        iron.position.set(7, 0.7, z + 2.5);
        balustradeGroup.add(iron);
      }
    }
    this.group.add(balustradeGroup);

    // 6. Vintage Roadster Bicycle Leaning at Balustrade (Under "Ride" Prompt)
    const bikeGroup = this.createRoadsterBicycle();
    bikeGroup.position.set(6.2, 0.4, 3.8);
    bikeGroup.rotation.y = -Math.PI / 12;
    bikeGroup.rotation.z = -0.08; // subtle tilt against balustrade
    this.group.add(bikeGroup);

    // 7. Coconut Palm Trees along Promenade
    const palmLocations: Array<[number, number, number, number]> = [
      [-5, 0.4, -15, 0.3],
      [-6, 0.4, 5, -0.2],
      [-5.5, 0.4, 25, 0.4],
      [-7, 0.4, 45, -0.3],
      [12, 0.4, -25, 0.1],
    ];

    palmLocations.forEach(([x, y, z, lean]) => {
      const palm = this.createCoconutPalm(lean);
      palm.position.set(x, y, z);
      this.group.add(palm);
    });

    // 8. Heritage Streetlights
    const lightMat = this.materials.get('metal.paint');
    for (const z of [-10, 15, 40]) {
      const lamp = this.createColonialStreetlight(lightMat);
      lamp.position.set(6.5, 0.4, z);
      this.group.add(lamp);
    }

    // 9. Chinese Fishing Nets (Cheena Vala) on Horizon
    const nets = this.createChineseFishingNet();
    nets.position.set(38, 0, 18);
    nets.rotation.y = -Math.PI / 4;
    this.group.add(nets);

    // 10. Pier Pavilion (Colonial Timber & Terracotta Roof)
    const pavilion = this.createWaterfrontPavilion();
    pavilion.position.set(16, 0.4, -5);
    this.group.add(pavilion);

    // 11. Small Wooden Ferry Boat in Water
    const boat = this.createFerryBoat();
    boat.position.set(24, 0.1, 35);
    boat.rotation.y = -Math.PI / 3;
    this.group.add(boat);

    this.animatedElements.push((elapsed) => {
      // Gentle bobbing for the boat
      boat.position.y = 0.1 + Math.sin(elapsed * 2) * 0.08;
      boat.rotation.z = Math.sin(elapsed * 1.5) * 0.03;
    });

    // 12. Glistening Turquoise Arabian Sea Surface
    const waterGeo = new THREE.PlaneGeometry(1200, 1200, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // Bright coastal turquoise
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = this.config.waterLevel;
    this.waterMesh.receiveShadow = true;
    this.group.add(this.waterMesh);

    // 13. Iconic City & Places Architecture
    const theater = this.createSarvamTheater();
    theater.position.set(-18, 0, -25);
    theater.rotation.y = Math.PI / 2;
    this.group.add(theater);

    const museum = this.createHeritageMuseum();
    museum.position.set(22, 0, -15);
    museum.rotation.y = -Math.PI / 2;
    this.group.add(museum);

    const stadium = this.createAazhiStadium();
    stadium.position.set(24, 0, 20);
    stadium.rotation.y = -Math.PI / 2;
    this.group.add(stadium);

    const cafe = this.createCafeRooftop();
    cafe.position.set(-18, 0, 12);
    cafe.rotation.y = Math.PI / 2;
    this.group.add(cafe);

    const mall = this.createParadiseMall();
    mall.position.set(-20, 0, 38);
    mall.rotation.y = Math.PI / 2;
    this.group.add(mall);

    // 14. Vice City-Style Chromatic Building Entrance Corona Indicators (Squarely on Paved Road)
    const buildingEntrances: BuildingEntranceConfig[] = [
      {
        id: 'cafe_rooftop',
        name: 'Cafe Rooftop',
        category: 'Seaside Tea & Filter Coffee Lounge',
        position: [-3.5, 0.42, 12],
        subtitle: 'Brewing signature Malabar dark roast filter coffee with open-air coastal breezes.',
        interiorStory: 'Cozy rattan lounge chairs, vinyl record player, and panoramic sunset balcony.',
      },
      {
        id: 'sarvam_theater',
        name: 'Sarvam Theater',
        category: 'Cinematic Premiere Hall',
        position: [-4.2, 0.42, -25],
        subtitle: 'Art deco cinema celebrating Malayalam & vintage world cinema classics.',
        interiorStory: 'Rich velvet seating, heritage brass projector booths, and grand gold-leaf acoustics.',
      },
      {
        id: 'heritage_museum',
        name: 'Heritage Museum',
        category: 'Colonial Dutch & Maritime Art',
        position: [3.8, 0.42, -15],
        subtitle: 'Explore 17th-century maritime maps, Dutch Bastion weapons, and Cochin spices.',
        interiorStory: 'Polished teak floors with authentic artifacts from the Malabar spice trade era.',
      },
      {
        id: 'aazhi_stadium',
        name: 'Aazhi Stadium',
        category: 'Coastal Sports & Games Arena',
        position: [3.8, 0.42, 20],
        subtitle: 'Lush beachfront turf arena for football, athletics, and traditional martial arts.',
        interiorStory: 'Open-air tiered grandstands overlooking the Arabian Sea waterfront.',
      },
      {
        id: 'paradise_mall',
        name: 'Paradise Mall',
        category: 'Waterfront Spice & Fashion Arcade',
        position: [-4.2, 0.42, 38],
        subtitle: 'Seaside shopping galleria featuring silk weavers, spice merchants, and artisans.',
        interiorStory: 'Sunlit glass atrium filled with exotic Kerala handicrafts and sweet stalls.',
      },
    ];

    buildingEntrances.forEach((cfg) => {
      const beacon = new EntranceBeacon(cfg);
      this.group.add(beacon.group);
      this.entranceBeacons.push(beacon);
    });
  }

  private createSarvamTheater(): THREE.Group {
    const group = new THREE.Group();
    // Grand Art Deco Theater Hall
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.4 }); // Deep Velvet Purple
    const neonMat = new THREE.MeshBasicMaterial({ color: 0xf0abfc }); // Neon Magenta Glow
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });

    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 14), wallMat);
    mainBlock.position.y = 6;
    mainBlock.castShadow = true;
    mainBlock.receiveShadow = true;
    group.add(mainBlock);

    // Overhanging Marquee Canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 4), goldMat);
    canopy.position.set(0, 5, 8);
    canopy.castShadow = true;
    group.add(canopy);

    // Illuminated Marquee Signboard
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 0.4), neonMat);
    signBoard.position.set(0, 7, 8.5);
    group.add(signBoard);

    // Grand Entrance Doors
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.1, transparent: true, opacity: 0.7 });
    const doors = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 0.3), glassMat);
    doors.position.set(0, 1.75, 7.1);
    group.add(doors);

    return group;
  }

  private createHeritageMuseum(): THREE.Group {
    const group = new THREE.Group();
    // Neoclassical Colonial Museum with Arched Pillars & Terracotta Roof
    const stoneMat = this.materials.get('wall.plaster.warm');
    const roofMat = this.materials.get('roof.terracotta');
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 });

    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 16), stoneMat);
    mainHall.position.y = 5;
    mainHall.castShadow = true;
    mainHall.receiveShadow = true;
    group.add(mainHall);

    // Kerala Classical Gable Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 4.5, 4), roofMat);
    roof.position.y = 12.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // 4 Front Heritage Columns
    for (let x = -6; x <= 6; x += 4) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 8, 16), stoneMat);
      col.position.set(x, 4, 9);
      col.castShadow = true;
      group.add(col);
    }

    // Museum Arch Crest
    const crest = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 0.8), goldMat);
    crest.position.set(0, 8.5, 9);
    group.add(crest);

    return group;
  }

  private createAazhiStadium(): THREE.Group {
    const group = new THREE.Group();
    // Modern Coastal Arena with Floodlight Pylons & Curved Facade
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const emeraldMat = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Emerald Stadium Glow
    const floodlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    // Outer Stadium Tier
    const stadiumGeo = new THREE.CylinderGeometry(14, 16, 9, 32, 1, true);
    const stadium = new THREE.Mesh(stadiumGeo, concreteMat);
    stadium.position.y = 4.5;
    stadium.castShadow = true;
    stadium.receiveShadow = true;
    group.add(stadium);

    // Glowing Arena Perimeter Crown
    const crown = new THREE.Mesh(new THREE.TorusGeometry(14.2, 0.35, 12, 32), emeraldMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 9;
    group.add(crown);

    // 4 Floodlight Tower Pylons
    for (const [px, pz] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 16, 8), concreteMat);
      pylon.position.set(px, 8, pz);
      pylon.castShadow = true;
      group.add(pylon);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.5), floodlightMat);
      lamp.position.set(px, 16, pz);
      group.add(lamp);
    }

    return group;
  }

  private createCafeRooftop(): THREE.Group {
    const group = new THREE.Group();
    // Chic Waterfront Two-Storey Bistro with Open-Air Rooftop Deck
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const woodMat = this.materials.get('wood.dark');
    const coralMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 }); // Coral Neon Glow
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 });

    // Lower Cafe Structure
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 10), wallMat);
    groundFloor.position.y = 2.5;
    groundFloor.castShadow = true;
    groundFloor.receiveShadow = true;
    group.add(groundFloor);

    // Rooftop Terrace Floor
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(13, 0.4, 11), woodMat);
    terrace.position.y = 5.2;
    terrace.castShadow = true;
    group.add(terrace);

    // Rooftop Sun Shade Umbrellas
    for (const [ux, uz] of [[-3, -2], [3, -2], [0, 2]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3), woodMat);
      pole.position.set(ux, 6.7, uz);
      group.add(pole);

      const umbrella = new THREE.Mesh(new THREE.ConeGeometry(2, 0.8, 8), canopyMat);
      umbrella.position.set(ux, 8.2, uz);
      group.add(umbrella);
    }

    // Glowing Neon Cafe Rooftop Bar Sign
    const neonSign = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 0.3), coralMat);
    neonSign.position.set(0, 4.2, 5.2);
    group.add(neonSign);

    return group;
  }

  private createParadiseMall(): THREE.Group {
    const group = new THREE.Group();
    // Luxury Modern Coastal Galleria & Glass Atrium Mall
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
    const blueNeonMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

    // Main Shopping Galleria Hall
    const mallBlock = new THREE.Mesh(new THREE.BoxGeometry(20, 11, 15), frameMat);
    mallBlock.position.y = 5.5;
    mallBlock.castShadow = true;
    mallBlock.receiveShadow = true;
    group.add(mallBlock);

    // Front Curved Glass Atrium
    const atrium = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 10, 16, 1, false, 0, Math.PI), glassMat);
    atrium.position.set(0, 5, 7.5);
    atrium.rotation.y = Math.PI;
    group.add(atrium);

    // Glowing Paradise Mall Header Logo Band
    const headerBand = new THREE.Mesh(new THREE.BoxGeometry(16, 1.6, 0.6), blueNeonMat);
    headerBand.position.set(0, 10.5, 8.2);
    group.add(headerBand);

    return group;
  }

  private createRoadsterBicycle(): THREE.Group {
    const bike = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3, metalness: 0.7 }); // Kerala teal
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.9 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    // Wheels
    const wheelGeo = new THREE.TorusGeometry(0.7, 0.08, 12, 24);
    const rearWheel = new THREE.Mesh(wheelGeo, tireMat);
    rearWheel.position.set(0, 0.7, -1.1);
    rearWheel.castShadow = true;
    bike.add(rearWheel);

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(0, 0.7, 1.1);
    frontWheel.castShadow = true;
    bike.add(frontWheel);

    // Frame tubes
    const tubeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4);
    const topTube = new THREE.Mesh(tubeGeo, frameMat);
    topTube.rotation.x = Math.PI / 2;
    topTube.position.set(0, 1.25, 0);
    bike.add(topTube);

    const downTube = new THREE.Mesh(tubeGeo, frameMat);
    downTube.rotation.x = Math.PI / 3.5;
    downTube.position.set(0, 0.95, 0.4);
    bike.add(downTube);

    // Handlebars
    const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9);
    const bar = new THREE.Mesh(barGeo, chromeMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.5, 0.9);
    bike.add(bar);

    // Leather Saddle
    const saddleGeo = new THREE.BoxGeometry(0.3, 0.1, 0.45);
    const leatherMat = this.materials.get('wood.dark');
    const saddle = new THREE.Mesh(saddleGeo, leatherMat);
    saddle.position.set(0, 1.4, -0.6);
    bike.add(saddle);

    return bike;
  }

  private createCoconutPalm(leanAngle: number): THREE.Group {
    const palm = new THREE.Group();
    const trunkMat = this.materials.get('wood.dark');
    const frondMat = this.materials.get('ground.grass');

    // Curved Trunk
    const trunkSegments = 6;
    let currY = 0;
    let currX = 0;

    for (let i = 0; i < trunkSegments; i++) {
      const segH = 1.3;
      const radius = 0.35 - i * 0.03;
      const segGeo = new THREE.CylinderGeometry(radius * 0.9, radius, segH, 8);
      const seg = new THREE.Mesh(segGeo, trunkMat);
      seg.position.set(currX, currY + segH / 2, 0);
      seg.rotation.z = leanAngle * 0.3;
      seg.castShadow = true;
      palm.add(seg);

      currY += segH;
      currX += leanAngle * 0.3;
    }

    // Palm Crown Fronds
    const crown = new THREE.Group();
    crown.position.set(currX, currY, 0);

    const frondGeo = new THREE.ConeGeometry(0.6, 3.8, 5);
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(Math.cos(angle) * 1.5, -0.4, Math.sin(angle) * 1.5);
      frond.rotation.z = Math.cos(angle) * 1.1;
      frond.rotation.x = Math.sin(angle) * 1.1;
      frond.castShadow = true;
      crown.add(frond);
    }
    palm.add(crown);

    return palm;
  }

  private createColonialStreetlight(metalMat: THREE.Material): THREE.Group {
    const light = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8);
    const post = new THREE.Mesh(postGeo, metalMat);
    post.position.y = 2.1;
    post.castShadow = true;
    light.add(post);

    // Glowing Lantern head
    const lanternGeo = new THREE.OctahedronGeometry(0.35);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 4.3;
    light.add(lantern);

    return light;
  }

  private createChineseFishingNet(): THREE.Group {
    const net = new THREE.Group();
    const woodMat = this.materials.get('wood.dark');

    // Massive Cantilevered Teak Poles
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, 18, 8);
    const mainArm = new THREE.Mesh(poleGeo, woodMat);
    mainArm.rotation.z = -Math.PI / 4;
    mainArm.position.set(6, 6, 0);
    mainArm.castShadow = true;
    net.add(mainArm);

    const supportArm = new THREE.Mesh(poleGeo, woodMat);
    supportArm.rotation.z = Math.PI / 3;
    supportArm.position.set(-3, 5, 0);
    net.add(supportArm);

    // Suspended Fishing Net Framework
    const netFrameGeo = new THREE.RingGeometry(2, 6, 4);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true });
    const netMesh = new THREE.Mesh(netFrameGeo, ropeMat);
    netMesh.rotation.x = Math.PI / 2;
    netMesh.position.set(12, 1, 0);
    net.add(netMesh);

    return net;
  }

  private createWaterfrontPavilion(): THREE.Group {
    const pav = new THREE.Group();
    const woodMat = this.materials.get('wood.dark');
    const roofMat = this.materials.get('roof.terracotta');

    // 4 Corner Timber Pillars
    for (const [x, z] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) {
      const colGeo = new THREE.BoxGeometry(0.5, 3.8, 0.5);
      const col = new THREE.Mesh(colGeo, woodMat);
      col.position.set(x, 1.9, z);
      col.castShadow = true;
      pav.add(col);
    }

    // Kerala Pyramidal Terracotta Roof
    const roofGeo = new THREE.ConeGeometry(7, 2.5, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    pav.add(roof);

    return pav;
  }

  private createFerryBoat(): THREE.Group {
    const boat = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 }); // Kerala green
    const cabinMat = this.materials.get('wall.plaster.warm');
    const roofMat = this.materials.get('roof.terracotta');

    // Hull
    const hullGeo = new THREE.BoxGeometry(4, 1.8, 12);
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.5;
    boat.add(hull);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(3, 1.6, 7);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.y = 2.1;
    boat.add(cabin);

    // Canopy
    const roofGeo = new THREE.BoxGeometry(3.6, 0.2, 8);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.0;
    boat.add(roof);

    return boat;
  }

  onBuildingEnter(callback: (building: BuildingEntranceConfig) => void): void {
    this.onBuildingEnterCallback = callback;
  }

  update(delta: number, elapsed: number, playerPos?: THREE.Vector3): void {
    // Gentle tidal water wave motion
    if (this.waterMesh) {
      this.waterMesh.position.y = this.config.waterLevel + Math.sin(elapsed * 1.4) * 0.06;
    }

    for (const anim of this.animatedElements) {
      anim(elapsed);
    }

    // Update Vice City-Style Chromatic Building Entrance Corona Beacons
    for (const beacon of this.entranceBeacons) {
      const enteredNow = beacon.update(delta, elapsed, playerPos);
      if (enteredNow && this.onBuildingEnterCallback) {
        this.onBuildingEnterCallback(beacon.config);
      }
    }
  }

  dispose(): void {
    if (this.waterMesh) {
      this.waterMesh.geometry.dispose();
      (this.waterMesh.material as THREE.Material).dispose();
      this.waterMesh = null;
    }

    if (this.groundMesh) {
      this.groundMesh.geometry.dispose();
      this.groundMesh = null;
    }

    for (const beacon of this.entranceBeacons) {
      beacon.dispose();
    }
    this.entranceBeacons = [];

    this.group.clear();
    this.lights = [];
    this.animatedElements = [];
  }
}
