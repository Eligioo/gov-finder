export interface Municipality {
  id: string;
  name: string;
  sourceType: 'easycruit' | 'rss_drupal' | 'gemeentebanen' | 'municipal_cms' | 'afas' | 'werkenbijgo' | 'ofgv_cms' | 'od_drenthe' | 'recruitee' | 'denhaag_wp' | 'wp_rest_project' | 'html_list';
  sourceUrl: string;
  logoUrl?: string;
  lat: number;
  lng: number;
}

export interface Vacancy {
  id: number;
  externalId: string;
  municipalityId: string;
  municipalityName?: string;
  title: string;
  department?: string;
  location?: string;
  description?: string;
  descriptionPlain?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryScale?: string;
  salaryRaw?: string;
  hoursPerWeek?: number;
  educationLevel?: string;
  employmentType?: string;
  closingDate?: string;
  publishedDate?: string;
  sourceUrl: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  scrapedAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ScrapedVacancy {
  externalId: string;
  municipalityId: string;
  title: string;
  department?: string;
  location?: string;
  description?: string;
  salaryRaw?: string;
  hoursPerWeek?: number;
  educationLevel?: string;
  employmentType?: string;
  closingDate?: string;
  publishedDate?: string;
  sourceUrl: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface VacancyListResponse {
  data: Vacancy[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  filters: {
    municipalities: { id: string; name: string; count: number }[];
    educationLevels: { value: string; count: number }[];
    employmentTypes: { value: string; count: number }[];
  };
}

export interface MunicipalityWithCount extends Municipality {
  vacancyCount: number;
}

export interface ScrapeStatus {
  id: number;
  municipalityId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'success' | 'error';
  vacanciesFound: number;
  vacanciesNew: number;
  vacanciesUpdated: number;
  errorMessage?: string;
}

export interface StatsResponse {
  totalActive: number;
  byMunicipality: { id: string; name: string; count: number }[];
  byEducation: { value: string; count: number }[];
  byEmploymentType: { value: string; count: number }[];
  lastScrape?: string;
}

export const MUNICIPALITIES: Municipality[] = [
  {
    id: 'zwolle',
    name: 'Gemeente Zwolle',
    sourceType: 'easycruit',
    sourceUrl: 'https://gemeentezwolle.easycruit.com',
    lat: 52.5168,
    lng: 6.0830,
  },
  {
    id: 'kampen',
    name: 'Gemeente Kampen',
    sourceType: 'easycruit',
    sourceUrl: 'https://gemeentekampen.easycruit.com',
    lat: 52.5551,
    lng: 5.9114,
  },
  {
    id: 'zwartewaterland',
    name: 'Gemeente Zwartewaterland',
    sourceType: 'rss_drupal',
    sourceUrl: 'https://www.zwartewaterland.nl',
    lat: 52.6100,
    lng: 6.0700,
  },
  {
    id: 'dronten',
    name: 'Gemeente Dronten',
    sourceType: 'easycruit',
    sourceUrl: 'https://gemeentedronten.easycruit.com',
    lat: 52.5253,
    lng: 5.7186,
  },
  {
    id: 'noordoostpolder',
    name: 'Gemeente Noordoostpolder',
    sourceType: 'easycruit',
    sourceUrl: 'https://noordoostpolder.easycruit.com',
    lat: 52.7120,
    lng: 5.7460,
  },
  {
    id: 'dalfsen',
    name: 'Gemeente Dalfsen',
    sourceType: 'easycruit',
    sourceUrl: 'https://dalfsen.easycruit.com',
    lat: 52.5040,
    lng: 6.2540,
  },
  {
    id: 'oldebroek',
    name: 'Gemeente Oldebroek',
    sourceType: 'gemeentebanen',
    sourceUrl: 'https://www.oldebroek.nl/Bestuur_en_organisatie/Werken_bij_de_gemeente',
    lat: 52.4497,
    lng: 5.9056,
  },
  {
    id: 'hattem',
    name: 'Gemeente Hattem',
    sourceType: 'gemeentebanen',
    sourceUrl: 'https://www.hattem.nl/Bestuur_en_organisatie/Werk_van_nu_in_historisch_Hattem/Vacatures/Vacatures',
    lat: 52.4728,
    lng: 6.0642,
  },
  {
    id: 'heerde',
    name: 'Gemeente Heerde',
    sourceType: 'municipal_cms',
    sourceUrl: 'https://www.heerde.nl/Bestuur_en_organisatie/Organisatie/Werken_bij_Heerde/Vacatures',
    lat: 52.3862,
    lng: 6.0386,
  },
  {
    id: 'od-ijsselland',
    name: 'OD IJsselland',
    sourceType: 'afas',
    sourceUrl: 'https://www.werkenbij.odijsselland.nl',
    lat: 52.5085,
    lng: 6.0938,
  },
  {
    id: 'od-twente',
    name: 'OD Twente',
    sourceType: 'afas',
    sourceUrl: 'https://werkenbij.odtwente.nl',
    lat: 52.2215,
    lng: 6.8937,
  },
  {
    id: 'od-veluwe',
    name: 'OD Veluwe',
    sourceType: 'werkenbijgo',
    sourceUrl: 'https://www.werkenbijgo.nl/vacatures/',
    lat: 52.2112,
    lng: 5.9699,
  },
  {
    id: 'od-de-vallei',
    name: 'OD de Vallei',
    sourceType: 'werkenbijgo',
    sourceUrl: 'https://www.werkenbijgo.nl/vacatures/',
    lat: 52.0393,
    lng: 5.6680,
  },
  {
    id: 'od-groene-metropool',
    name: 'OD Groene Metropool',
    sourceType: 'werkenbijgo',
    sourceUrl: 'https://www.werkenbijgo.nl/vacatures/',
    lat: 51.9851,
    lng: 5.8987,
  },
  {
    id: 'ofgv',
    name: 'OFGV',
    sourceType: 'ofgv_cms',
    sourceUrl: 'https://www.ofgv.nl/werken-bij/vacatures/',
    lat: 52.3508,
    lng: 5.2647,
  },
  {
    id: 'od-drenthe',
    name: 'OD Drenthe',
    sourceType: 'od_drenthe',
    sourceUrl: 'https://oddrenthe.nl/vacatures/',
    lat: 52.9925,
    lng: 6.5625,
  },
  // --- Pijnacker-Nootdorp area ---
  {
    id: 'pijnacker-nootdorp',
    name: 'Gemeente Pijnacker-Nootdorp',
    sourceType: 'recruitee',
    sourceUrl: 'https://werkenbijpijnackernootdorp.recruitee.com',
    lat: 52.0186,
    lng: 4.6305,
  },
  {
    id: 'lansingerland',
    name: 'Gemeente Lansingerland',
    sourceType: 'recruitee',
    sourceUrl: 'https://gemeentelansingerland.recruitee.com',
    lat: 52.0123,
    lng: 4.5247,
  },
  {
    id: 'delft',
    name: 'Gemeente Delft',
    sourceType: 'easycruit',
    sourceUrl: 'https://werkenvoordelft.easycruit.com',
    lat: 52.0116,
    lng: 4.3571,
  },
  {
    id: 'westland',
    name: 'Gemeente Westland',
    sourceType: 'easycruit',
    sourceUrl: 'https://gemeentewestland.easycruit.com',
    lat: 51.9942,
    lng: 4.2000,
  },
  {
    id: 'den-haag',
    name: 'Gemeente Den Haag',
    sourceType: 'denhaag_wp',
    sourceUrl: 'https://werkenvoor.denhaag.nl',
    lat: 52.0705,
    lng: 4.3007,
  },
  {
    id: 'zoetermeer',
    name: 'Gemeente Zoetermeer',
    sourceType: 'html_list',
    sourceUrl: 'https://www.werkenbijzoetermeer.nl/vacatures',
    lat: 52.0575,
    lng: 4.4937,
  },
  {
    id: 'rijswijk',
    name: 'Gemeente Rijswijk',
    sourceType: 'html_list',
    sourceUrl: 'https://www.rijswijk.nl/vacatures',
    lat: 52.0363,
    lng: 4.3237,
  },
  {
    id: 'leidschendam-voorburg',
    name: 'Gemeente Leidschendam-Voorburg',
    sourceType: 'wp_rest_project',
    sourceUrl: 'https://werkenvoorleidschendam-voorburg.nl',
    lat: 52.0837,
    lng: 4.4147,
  },
  // TODO: Gemeente Midden-Delfland — inhroffice.com/Vue backend. Currently 0
  // published vacancies; enable once a vacancy appears and the XHR shape is observed.
  // { id: 'midden-delfland', name: 'Gemeente Midden-Delfland', sourceType: 'html_list',
  //   sourceUrl: 'https://middendelfland.inhroffice.com/nl', lat: 51.9717, lng: 4.3097 },
  {
    id: 'dcmr',
    name: 'DCMR Milieudienst Rijnmond',
    sourceType: 'html_list',
    sourceUrl: 'https://www.werkenbijdcmr.nl/onze-vacatures',
    lat: 51.9225,
    lng: 4.3881,
  },
  {
    id: 'od-haaglanden',
    name: 'Omgevingsdienst Haaglanden',
    sourceType: 'html_list',
    sourceUrl: 'https://omgevingsdiensthaaglanden.nl/werken-bij/',
    lat: 52.0799,
    lng: 4.3113,
  },
  {
    id: 'od-west-holland',
    name: 'Omgevingsdienst West-Holland',
    sourceType: 'html_list',
    sourceUrl: 'https://www.odwh.nl/zoektjou/',
    lat: 52.1660,
    lng: 4.4915,
  },
];
