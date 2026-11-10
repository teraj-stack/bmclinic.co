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
 * Generuje graf Schema.org JSON-LD dla domeny bmclinic.co.
 * Gdy brak aktywnej podstrony zabiegowej (czysty fundament), zwraca bazowy graf MedicalClinic.
 */
export function buildBmClinicSchemaGraph(input?: BmClinicProcedureSchemaInput) {
  const baseClinic = {
    '@type': 'MedicalClinic',
    '@id': 'https://bmclinic.co/#clinic',
    name: 'BM Clinic (bmclinic.co)',
    url: 'https://bmclinic.co',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PL',
    },
  };

  if (!input) {
    return {
      '@context': 'https://schema.org',
      '@graph': [baseClinic],
    };
  }

  const canonicalUrl = `https://bmclinic.co${input.urlPath}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      baseClinic,
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
