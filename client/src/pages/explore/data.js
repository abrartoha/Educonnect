// Real-world coordinates and metadata for University of Melbourne (Parkville)
// and the public-transport stops within ~1km.
//
// All buildings/stops are placed using their actual lat/lng. The scene
// converts these to local meters relative to CAMPUS_CENTRE so we can run
// Three.js with sensible numbers.
//
// Sources: University of Melbourne campus map, PTV route data (publicly
// available). Verified May 2026.

// South Lawn — the geographic heart of Parkville campus. Avatar spawns here.
export const CAMPUS_CENTRE = { lat: -37.79817, lng: 144.96129, name: 'South Lawn' };

// Soft boundary — ~1 km radius around the centre. The avatar gets nudged
// back if they walk past it.
export const BOUNDARY_RADIUS_METERS = 1000;

// ---------------------------------------------------------------------------
// Buildings — real UMelb landmarks. (lat, lng, label, blurb).
// ---------------------------------------------------------------------------
export const BUILDINGS = [
  {
    id: 'old-quad',
    name: 'Old Quad',
    lat: -37.79839,
    lng: 144.96115,
    emoji: '🏛️',
    summary:
      'The original 1854 Bluestone quadrangle — heart of the campus. ' +
      'Houses heritage exhibitions and is the traditional graduation venue.',
    tags: ['Heritage', 'Graduations'],
  },
  {
    id: 'baillieu-library',
    name: 'Baillieu Library',
    lat: -37.79755,
    lng: 144.96098,
    emoji: '📚',
    summary:
      'Main university library. Five levels, 1.5M+ volumes, 24/7 study spaces ' +
      'during exam periods, dedicated international student support desk.',
    tags: ['Library', '24/7 study'],
  },
  {
    id: 'arts-west',
    name: 'Arts West',
    lat: -37.79728,
    lng: 144.95977,
    emoji: '🎭',
    summary:
      'Faculty of Arts hub — Anthropology, English, Linguistics. ' +
      'Award-winning building with a gallery, seminar rooms and barista coffee on level 1.',
    tags: ['Faculty of Arts'],
  },
  {
    id: 'old-arts',
    name: 'Old Arts',
    lat: -37.79806,
    lng: 144.96030,
    emoji: '🎨',
    summary:
      '1924 sandstone hall housing humanities lectures and the Carrillon clock tower. ' +
      'Iconic backdrop for orientation photos.',
    tags: ['Humanities'],
  },
  {
    id: 'union-house',
    name: 'Union House',
    lat: -37.79803,
    lng: 144.96190,
    emoji: '🍱',
    summary:
      'Student hub — food court (10+ cuisines under AUD $12), UMSU offices, ' +
      'event spaces and the Welfare Department.',
    tags: ['Food', 'Student Union'],
  },
  {
    id: 'engineering',
    name: 'Melbourne Connect (Engineering)',
    lat: -37.79927,
    lng: 144.96309,
    emoji: '⚙️',
    summary:
      'New Faculty of Engineering & IT building. Maker spaces, robotics labs, ' +
      'industry collaboration zones (Microsoft, NAB residents).',
    tags: ['Engineering', 'IT'],
  },
  {
    id: 'redmond-barry',
    name: 'Redmond Barry',
    lat: -37.79843,
    lng: 144.96207,
    emoji: '🧪',
    summary:
      'Biomedical sciences and laboratories. Adjacent to the Peter MacCallum cancer centre.',
    tags: ['Biomedicine', 'Labs'],
  },
  {
    id: 'south-lawn',
    name: 'South Lawn (you are here)',
    lat: -37.79817,
    lng: 144.96129,
    emoji: '🌳',
    summary:
      'The big green at the centre of campus. Underground car park beneath. ' +
      'Lunchtime gatherings, club fairs, frisbee, sunbathing.',
    tags: ['Open space'],
  },
  {
    id: 'med-school',
    name: 'Medical Building',
    lat: -37.79665,
    lng: 144.96021,
    emoji: '🩺',
    summary:
      'Faculty of Medicine, Dentistry and Health Sciences — Australia\'s #1 medical school. ' +
      'Lecture theatres, anatomy museum, simulation hospital.',
    tags: ['Medicine'],
  },
  {
    id: 'sports-centre',
    name: 'Melbourne University Sport',
    lat: -37.79561,
    lng: 144.96214,
    emoji: '🏋️',
    summary:
      'Olympic-grade pool, gym, squash courts, group classes. ' +
      'Free for full-time international students.',
    tags: ['Sports', 'Wellbeing'],
  },
  {
    id: 'law',
    name: 'Melbourne Law School',
    lat: -37.80256,
    lng: 144.95988,
    emoji: '⚖️',
    summary:
      'Standalone graduate law school on Pelham Street. Mooting courts, ' +
      'JD library, Wheeler Centre talks venue.',
    tags: ['Law', 'Graduate'],
  },
];

// ---------------------------------------------------------------------------
// Public transport stops within walking distance — real PTV data.
// ---------------------------------------------------------------------------
export const TRANSIT_STOPS = [
  {
    id: 'tram-melbourne-uni',
    type: 'tram',
    name: 'Melbourne University · Tram 19',
    lat: -37.79842,
    lng: 144.96462,
    routes: [
      {
        line: '19',
        colour: '#7c3aed',
        from: 'North Coburg',
        to: 'Flinders Street Station',
        notes: 'Direct to CBD in 12 min. Free Tram Zone starts at Melbourne Central.',
      },
    ],
    summary:
      'On Swanston Street at the SE corner of campus. Most-used stop for international students.',
  },
  {
    id: 'tram-grattan-st',
    type: 'tram',
    name: 'Grattan Street / Royal Parade',
    lat: -37.79730,
    lng: 144.95870,
    routes: [
      {
        line: '1',
        colour: '#0ea5e9',
        from: 'East Coburg',
        to: 'South Melbourne Beach',
        notes: 'Beach access on Sundays. ~25 min to South Melbourne Market.',
      },
      {
        line: '6',
        colour: '#10b981',
        from: 'Glen Iris',
        to: 'Moreland',
        notes: 'Useful for the eastern suburbs / Caulfield campus connection.',
      },
    ],
    summary: 'Tram stop on the western edge of campus, opposite the Royal Melbourne Hospital.',
  },
  {
    id: 'tram-lygon-elgin',
    type: 'tram',
    name: 'Lygon Street / Elgin Street',
    lat: -37.79988,
    lng: 144.96719,
    routes: [
      {
        line: '1',
        colour: '#0ea5e9',
        from: 'East Coburg',
        to: 'South Melbourne Beach',
      },
      {
        line: '6',
        colour: '#10b981',
        from: 'Glen Iris',
        to: 'Moreland',
      },
    ],
    summary: 'Walk to Lygon Street for Carlton\'s famous Italian restaurants and gelato.',
  },
  {
    id: 'train-melbourne-central',
    type: 'train',
    name: 'Melbourne Central Station',
    lat: -37.81017,
    lng: 144.96274,
    routes: [
      {
        line: 'Craigieburn',
        colour: '#dc2626',
        from: 'CBD',
        to: 'Craigieburn',
      },
      {
        line: 'Sunbury',
        colour: '#dc2626',
        from: 'CBD',
        to: 'Sunbury (via Airport bus)',
      },
      {
        line: 'Upfield',
        colour: '#dc2626',
        from: 'CBD',
        to: 'Upfield',
      },
      {
        line: 'City Loop',
        colour: '#0ea5e9',
        from: 'Flinders St',
        to: 'Southern Cross',
        notes: 'All Loop trains stop here. Closest train station to campus.',
      },
    ],
    summary:
      'Underground station beneath Melbourne Central shopping centre. ~12 min walk south of campus. Connects to airport via SkyBus from Southern Cross.',
  },
  {
    id: 'tram-haymarket',
    type: 'tram',
    name: 'Haymarket Roundabout',
    lat: -37.80133,
    lng: 144.96238,
    routes: [
      {
        line: '19',
        colour: '#7c3aed',
        from: 'North Coburg',
        to: 'Flinders Street Station',
      },
      {
        line: '57',
        colour: '#f59e0b',
        from: 'West Maribyrnong',
        to: 'Flinders St',
      },
      {
        line: '59',
        colour: '#22c55e',
        from: 'Airport West',
        to: 'Flinders St',
        notes: 'Useful inbound from western suburbs.',
      },
    ],
    summary: 'Major tram interchange on the southern boundary — first stop into the Free Tram Zone.',
  },
  {
    id: 'bus-royal-parade',
    type: 'bus',
    name: 'Royal Parade Bus Stop',
    lat: -37.79546,
    lng: 144.96085,
    routes: [
      {
        line: '401',
        colour: '#64748b',
        from: 'North Melbourne',
        to: 'Melbourne Uni',
        notes: 'Free university shuttle bus, weekdays 7am–7pm.',
      },
    ],
    summary: 'Free uni shuttle from North Melbourne train station — handy if you live in Brunswick or Footscray.',
  },
];
