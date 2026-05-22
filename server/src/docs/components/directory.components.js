export const directorySchemas = {
  UniversityProfile: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      avatarUrl: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      university: {
        type: 'object',
        properties: {
          shortName: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          type: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          website: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true },
          coverImageUrl: { type: 'string', nullable: true },
          foundedYear: { type: 'integer', nullable: true },
          studentCount: { type: 'integer', nullable: true },
          internationalPct: { type: 'integer', nullable: true },
          ranking: { type: 'integer', nullable: true },
          tuitionMin: { type: 'integer', nullable: true },
          tuitionMax: { type: 'integer', nullable: true },
          tuitionCurrency: { type: 'string', nullable: true },
          courses: { type: 'array', items: { type: 'string' } },
          scholarships: { type: 'array', items: { type: 'string' } },
          intakes: { type: 'array', items: { type: 'string' } },
          facilities: { type: 'array', items: { type: 'string' } },
          accreditations: { type: 'array', items: { type: 'string' } },
          rating: { type: 'number' },
          views: { type: 'integer' },
          verified: { type: 'boolean' }
        }
      }
    }
  },
  UniversityUpdate: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 200 },
      shortName: { type: 'string', maxLength: 40 },
      location: { type: 'string', maxLength: 120 },
      type: { type: 'string', maxLength: 60 },
      description: { type: 'string', maxLength: 2000 },
      website: { type: 'string', format: 'uri' },
      phone: { type: 'string', maxLength: 40 },
      logoUrl: { type: 'string', format: 'uri', maxLength: 500 },
      coverImageUrl: { type: 'string', format: 'uri', maxLength: 500 },
      foundedYear: { type: 'integer', minimum: 1000, maximum: 2100 },
      studentCount: { type: 'integer', minimum: 0, maximum: 1000000 },
      internationalPct: { type: 'integer', minimum: 0, maximum: 100 },
      ranking: { type: 'integer', minimum: 1, maximum: 100000 },
      tuitionMin: { type: 'integer', minimum: 0, maximum: 1000000 },
      tuitionMax: { type: 'integer', minimum: 0, maximum: 1000000 },
      tuitionCurrency: { type: 'string', minLength: 3, maxLength: 3 },
      courses: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 200 },
      scholarships: { type: 'array', items: { type: 'string', maxLength: 200 }, maxItems: 100 },
      intakes: { type: 'array', items: { type: 'string', maxLength: 80 }, maxItems: 20 },
      facilities: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 100 },
      accreditations: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 50 },
    }
  },
  AgentProfile: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      avatarUrl: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      agent: {
        type: 'object',
        properties: {
          contactPerson: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          website: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true },
          yearsExperience: { type: 'integer', nullable: true },
          certifications: { type: 'array', items: { type: 'string' } },
          services: { type: 'array', items: { type: 'string' } },
          languages: { type: 'array', items: { type: 'string' } },
          specialisations: { type: 'array', items: { type: 'string' } },
          maraNumber: { type: 'string', nullable: true },
          rating: { type: 'number' },
          verified: { type: 'boolean' }
        }
      }
    }
  },
  AgentUpdate: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      contactPerson: { type: 'string', maxLength: 120 },
      phone: { type: 'string', maxLength: 40 },
      location: { type: 'string', maxLength: 120 },
      description: { type: 'string', maxLength: 2000 },
      website: { type: 'string', format: 'uri' },
      logoUrl: { type: 'string', format: 'uri', maxLength: 500 },
      yearsExperience: { type: 'integer', minimum: 0, maximum: 80 },
      certifications: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 30 },
      services: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 30 },
      languages: { type: 'array', items: { type: 'string', maxLength: 60 }, maxItems: 20 },
      specialisations: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 30 },
      maraNumber: { type: 'string', maxLength: 20 },
    }
  },
  ConsultantProfile: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      avatarUrl: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      consultant: {
        type: 'object',
        properties: {
          phone: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          website: { type: 'string', nullable: true },
          yearsExperience: { type: 'integer', nullable: true },
          qualifications: { type: 'array', items: { type: 'string' } },
          services: { type: 'array', items: { type: 'string' } },
          languages: { type: 'array', items: { type: 'string' } },
          specialisations: { type: 'array', items: { type: 'string' } },
          hourlyRate: { type: 'integer', nullable: true },
          rating: { type: 'number' },
          verified: { type: 'boolean' }
        }
      }
    }
  },
  ConsultantUpdate: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      phone: { type: 'string', maxLength: 40 },
      location: { type: 'string', maxLength: 120 },
      description: { type: 'string', maxLength: 2000 },
      website: { type: 'string', format: 'uri' },
      yearsExperience: { type: 'integer', minimum: 0, maximum: 80 },
      qualifications: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 30 },
      services: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 30 },
      languages: { type: 'array', items: { type: 'string', maxLength: 60 }, maxItems: 20 },
      specialisations: { type: 'array', items: { type: 'string', maxLength: 120 }, maxItems: 30 },
      hourlyRate: { type: 'integer', minimum: 0, maximum: 10000 },
    }
  },
  StudentUpdate: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      phone: { type: 'string', maxLength: 40 },
      nationality: { type: 'string', maxLength: 80 },
      currentEducation: { type: 'string', maxLength: 120 },
      interestedIn: { type: 'array', items: { type: 'string', maxLength: 80 }, maxItems: 20 },
      preferredLocations: { type: 'array', items: { type: 'string', maxLength: 80 }, maxItems: 20 },
      budgetMin: { type: 'integer', minimum: 0 },
      budgetMax: { type: 'integer', minimum: 0 },
      bio: { type: 'string', maxLength: 1000 },
      intakeTarget: { type: 'string', maxLength: 80 },
    }
  }
};