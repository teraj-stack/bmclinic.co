export interface BmClinicProcedureSchemaInput {
  urlPath: string;
  procedureTitle: string;
  aioDirectAnswerPassage: string;
  leadPhysicianName: string;
  physicianSpecialty: string;
  basePricePln: number;
  h2AioQuestion: string;
}

/**
 * Generuje pełny graf Schema.org JSON-LD (MedicalClinic + Physician + MedicalProcedure + FAQPage)
 * zoptymalizowany pod Google Search, AI Overviews (GEO) oraz YMYL / E-E-A-T dla domeny bmclinic.co.
 */
export function buildBmClinicSchemaGraph(input: BmClinicProcedureSchemaInput) {
  const canonicalUrl = `https://bmclinic.co${input.urlPath}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': 'https://bmclinic.co/#clinic',
        name: 'BM Clinic — Centrum Medycyny Laserowej i Proktologii',
        url: 'https://bmclinic.co',
        medicalSpecialty: ['Proctology', 'LaserSurgery', 'Dermatology'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Warszawa',
          addressRegion: 'Mazowieckie',
          addressCountry: 'PL',
        },
        priceRange: '$$',
      },
      {
        '@type': 'Physician',
        '@id': 'https://bmclinic.co/#physician-lead',
        name: input.leadPhysicianName,
        jobTitle: input.physicianSpecialty,
        worksFor: { '@id': 'https://bmclinic.co/#clinic' },
      },
      {
        '@type': 'MedicalProcedure',
        '@id': `${canonicalUrl}#procedure`,
        name: input.procedureTitle,
        url: canonicalUrl,
        procedureType: 'https://schema.org/NoninvasiveProcedure',
        description: input.aioDirectAnswerPassage,
        performer: { '@id': 'https://bmclinic.co/#physician-lead' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PLN',
          price: input.basePricePln,
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: input.h2AioQuestion,
            acceptedAnswer: {
              '@type': 'Answer',
              text: input.aioDirectAnswerPassage,
            },
          },
        ],
      },
    ],
  };
}
