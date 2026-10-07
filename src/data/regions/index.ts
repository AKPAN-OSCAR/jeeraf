export interface RegionalServer {
  id: string;
  name: string;
  code: string;
  endpoint: string;
  location: string;
  latencyMs: number;
  status: 'active' | 'provisioning' | 'standby';
}

export interface CountryConfig {
  id: string;
  name: string;
  flag: string;
  continentId: string;
  code: string;
  currency: string;
  preferredServer: RegionalServer;
  supportedExams: {
    id: string;
    name: string;
    fullName: string;
    databasePath: string;
    isAvailable: boolean;
  }[];
  educationBodies: string[];
  databaseType: 'json_file_bank' | 'firestore_nosql' | 'hybrid';
}

export interface ContinentConfig {
  id: string;
  name: string;
  code: string;
  icon: string;
  isActive: boolean;
  statusText: string;
  description: string;
  countries: CountryConfig[];
  primaryEdgeRegion: string;
}

export const REGIONAL_SERVERS: Record<string, RegionalServer> = {
  'af-west-1': {
    id: 'af-west-1',
    name: 'West Africa 01 (Lagos)',
    code: 'LOS-01',
    endpoint: 'https://los.edge.jeeraf.app',
    location: 'Lagos, Nigeria',
    latencyMs: 14,
    status: 'active'
  },
  'af-west-2': {
    id: 'af-west-2',
    name: 'West Africa 02 (Accra)',
    code: 'ACC-02',
    endpoint: 'https://acc.edge.jeeraf.app',
    location: 'Accra, Ghana',
    latencyMs: 19,
    status: 'active'
  },
  'af-east-1': {
    id: 'af-east-1',
    name: 'East Africa 01 (Nairobi)',
    code: 'NBO-01',
    endpoint: 'https://nbo.edge.jeeraf.app',
    location: 'Nairobi, Kenya',
    latencyMs: 25,
    status: 'active'
  },
  'af-east-2': {
    id: 'af-east-2',
    name: 'East Africa 02 (Kigali)',
    code: 'KGL-02',
    endpoint: 'https://kgl.edge.jeeraf.app',
    location: 'Kigali, Rwanda',
    latencyMs: 27,
    status: 'active'
  },
  'af-south-1': {
    id: 'af-south-1',
    name: 'Southern Africa 01 (Johannesburg)',
    code: 'JNB-01',
    endpoint: 'https://jnb.edge.jeeraf.app',
    location: 'Johannesburg, South Africa',
    latencyMs: 32,
    status: 'active'
  },
  'af-north-1': {
    id: 'af-north-1',
    name: 'North Africa 01 (Cairo)',
    code: 'CAI-01',
    endpoint: 'https://cai.edge.jeeraf.app',
    location: 'Cairo, Egypt',
    latencyMs: 38,
    status: 'active'
  },
  'af-pan-edge': {
    id: 'af-pan-edge',
    name: 'Pan-African Distributed Edge Mesh',
    code: 'AF-MESH-00',
    endpoint: 'https://edge.africa.jeeraf.app',
    location: 'Distributed Pan-African Edge',
    latencyMs: 18,
    status: 'active'
  }
};

export const CONTINENTS: ContinentConfig[] = [
  {
    id: 'africa',
    name: 'Africa',
    code: 'AF',
    icon: '🌍',
    isActive: true,
    statusText: 'Active / Live Hub',
    description: 'Premier operational continent with comprehensive JSON question registries for national examinations & foundation courses.',
    primaryEdgeRegion: 'af-west-1',
    countries: [
      {
        id: 'Nigeria',
        name: 'Nigeria',
        flag: '🇳🇬',
        continentId: 'africa',
        code: 'NG',
        currency: 'NGN (₦)',
        preferredServer: REGIONAL_SERVERS['af-west-1'],
        educationBodies: ['JAMB', 'WAEC', 'NECO', 'NABTEB', 'TRCN', 'POST-UTME'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'JAMB', name: 'JAMB UTME', fullName: 'Joint Admissions and Matriculation Board', databasePath: 'src/data/question_banks/jamb', isAvailable: true },
          { id: 'WAEC', name: 'WAEC WASSCE', fullName: 'West African Examinations Council May/June', databasePath: 'src/data/question_banks/waec', isAvailable: true },
          { id: 'NECO', name: 'NECO SSCE', fullName: 'National Examinations Council June/July', databasePath: 'src/data/question_banks/neco', isAvailable: true },
          { id: 'WAEC GCE', name: 'WAEC GCE', fullName: 'West African Senior School Certificate (Private)', databasePath: 'src/data/question_banks/waec_gce', isAvailable: true },
          { id: 'NECO GCE', name: 'NECO GCE', fullName: 'National Examinations Council (Nov/Dec Private)', databasePath: 'src/data/question_banks/neco_gce', isAvailable: true }
        ]
      },
      {
        id: 'Ghana',
        name: 'Ghana',
        flag: '🇬🇭',
        continentId: 'africa',
        code: 'GH',
        currency: 'GHS (GH₵)',
        preferredServer: REGIONAL_SERVERS['af-west-2'],
        educationBodies: ['WAEC Ghana', 'BECE', 'WASSCE'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'WAEC', name: 'WAEC Ghana WASSCE', fullName: 'West African Examinations Council (Ghana)', databasePath: 'src/data/question_banks/waec', isAvailable: true },
          { id: 'BECE', name: 'BECE', fullName: 'Basic Education Certificate Examination', databasePath: 'src/data/question_banks/ghana/bece', isAvailable: true },
          { id: 'NOVDEC', name: 'Nov/Dec Private', fullName: 'General Certificate of Education Private', databasePath: 'src/data/question_banks/ghana/novdec', isAvailable: true }
        ]
      },
      {
        id: 'Kenya',
        name: 'Kenya',
        flag: '🇰🇪',
        continentId: 'africa',
        code: 'KE',
        currency: 'KES (KSh)',
        preferredServer: REGIONAL_SERVERS['af-east-1'],
        educationBodies: ['KNEC', 'KCSE', 'KCPE'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'KCSE', name: 'KCSE', fullName: 'Kenya Certificate of Secondary Education', databasePath: 'src/data/question_banks/kenya/kcse', isAvailable: true },
          { id: 'KCPE', name: 'KCPE', fullName: 'Kenya Certificate of Primary Education', databasePath: 'src/data/question_banks/kenya/kcpe', isAvailable: true }
        ]
      },
      {
        id: 'South Africa',
        name: 'South Africa',
        flag: '🇿🇦',
        continentId: 'africa',
        code: 'ZA',
        currency: 'ZAR (R)',
        preferredServer: REGIONAL_SERVERS['af-south-1'],
        educationBodies: ['DBE', 'IEB', 'NSC Matric'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'NSC', name: 'NSC Matric', fullName: 'National Senior Certificate Examinations', databasePath: 'src/data/question_banks/south_africa/nsc', isAvailable: true },
          { id: 'IEB', name: 'IEB National', fullName: 'Independent Examinations Board', databasePath: 'src/data/question_banks/south_africa/ieb', isAvailable: true }
        ]
      },
      {
        id: 'Rwanda',
        name: 'Rwanda',
        flag: '🇷🇼',
        continentId: 'africa',
        code: 'RW',
        currency: 'RWF (FRw)',
        preferredServer: REGIONAL_SERVERS['af-east-2'],
        educationBodies: ['NESA', 'REB National'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'S6_NAT', name: 'S6 National Exam', fullName: 'National Examination and School Inspection Authority', databasePath: 'src/data/question_banks/rwanda/s6', isAvailable: true }
        ]
      },
      {
        id: 'Egypt',
        name: 'Egypt',
        flag: '🇪🇬',
        continentId: 'africa',
        code: 'EG',
        currency: 'EGP (E£)',
        preferredServer: REGIONAL_SERVERS['af-north-1'],
        educationBodies: ['Thanaweya Amma', 'Ministry of Education'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'THANAWEYA', name: 'Thanaweya Amma', fullName: 'General Secondary Education Certificate', databasePath: 'src/data/question_banks/egypt/thanaweya', isAvailable: true }
        ]
      },
      {
        id: 'Ethiopia',
        name: 'Ethiopia',
        flag: '🇪🇹',
        continentId: 'africa',
        code: 'ET',
        currency: 'ETB (Br)',
        preferredServer: REGIONAL_SERVERS['af-east-1'],
        educationBodies: ['EAES National'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'EUEE', name: 'EUEE Grade 12', fullName: 'Ethiopian University Entrance Examination', databasePath: 'src/data/question_banks/ethiopia/euee', isAvailable: true }
        ]
      },
      {
        id: 'Uganda',
        name: 'Uganda',
        flag: '🇺🇬',
        continentId: 'africa',
        code: 'UG',
        currency: 'UGX (USh)',
        preferredServer: REGIONAL_SERVERS['af-east-1'],
        educationBodies: ['UNEB', 'UCE', 'UACE'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'UCE', name: 'UCE O-Level', fullName: 'Uganda Certificate of Education', databasePath: 'src/data/question_banks/uganda/uce', isAvailable: true },
          { id: 'UACE', name: 'UACE A-Level', fullName: 'Uganda Advanced Certificate of Education', databasePath: 'src/data/question_banks/uganda/uace', isAvailable: true }
        ]
      },
      {
        id: 'Tanzania',
        name: 'Tanzania',
        flag: '🇹🇿',
        continentId: 'africa',
        code: 'TZ',
        currency: 'TZS (TSh)',
        preferredServer: REGIONAL_SERVERS['af-east-1'],
        educationBodies: ['NECTA', 'CSEE', 'ACSEE'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'CSEE', name: 'CSEE Form 4', fullName: 'Certificate of Secondary Education Examination', databasePath: 'src/data/question_banks/tanzania/csee', isAvailable: true },
          { id: 'ACSEE', name: 'ACSEE Form 6', fullName: 'Advanced Certificate of Secondary Education Examination', databasePath: 'src/data/question_banks/tanzania/acsee', isAvailable: true }
        ]
      },
      {
        id: 'General Africa',
        name: 'General Africa',
        flag: '🌍',
        continentId: 'africa',
        code: 'AF-ALL',
        currency: 'USD ($)',
        preferredServer: REGIONAL_SERVERS['af-pan-edge'],
        educationBodies: ['Pan-African Examination Alliance', 'Cambridge International Africa'],
        databaseType: 'json_file_bank',
        supportedExams: [
          { id: 'WAEC', name: 'WAEC All-Region', fullName: 'West African Examinations Council International', databasePath: 'src/data/question_banks/waec', isAvailable: true },
          { id: 'CAMBRIDGE', name: 'Cambridge IGCSE', fullName: 'Cambridge International Secondary Assessment', databasePath: 'src/data/question_banks/international/cambridge', isAvailable: true }
        ]
      }
    ]
  },
  {
    id: 'europe',
    name: 'Europe',
    code: 'EU',
    icon: '🏰',
    isActive: false,
    statusText: 'Provisioning Phase 2',
    description: 'Scheduled international expansion for GCSE, A-Levels, and European Baccalaureate standards.',
    primaryEdgeRegion: 'eu-west-1',
    countries: []
  },
  {
    id: 'americas',
    name: 'Americas',
    code: 'AM',
    icon: '🌎',
    isActive: false,
    statusText: 'Provisioning Phase 3',
    description: 'Scheduled international expansion for SAT, ACT, AP, and CXC Caribbean examinations.',
    primaryEdgeRegion: 'us-east-1',
    countries: []
  },
  {
    id: 'asia',
    name: 'Asia',
    code: 'AS',
    icon: '🌏',
    isActive: false,
    statusText: 'Provisioning Phase 4',
    description: 'Scheduled international expansion for JEE, CBSE, and Gaokao preparation banks.',
    primaryEdgeRegion: 'ap-south-1',
    countries: []
  },
  {
    id: 'oceania',
    name: 'Oceania',
    code: 'OC',
    icon: '🏝️',
    isActive: false,
    statusText: 'Provisioning Phase 5',
    description: 'Scheduled expansion for HSC, VCE, and NCEA Pacific standards.',
    primaryEdgeRegion: 'ap-southeast-2',
    countries: []
  }
];

export function getActiveContinent(): ContinentConfig {
  return CONTINENTS.find(c => c.isActive) || CONTINENTS[0];
}

export function getCountryById(countryId: string): CountryConfig {
  const activeContinent = getActiveContinent();
  const found = activeContinent.countries.find(c => c.id === countryId || c.name === countryId);
  return found || activeContinent.countries[0];
}
