// Shared enum + shape mappers between the backend (UPPER_SNAKE) and the UI
// (lower-kebab/strings). Keeps the conversion logic in one place.

// ---- Roles ----------------------------------------------------------------
export const ROLE_FROM_API = {
  ADMIN: 'admin',
  UNIVERSITY: 'university',
  AGENT: 'agent',
  CONSULTANT: 'consultant',
  STUDENT: 'student',
};

export const ROLE_TO_API = {
  admin: 'ADMIN',
  university: 'UNIVERSITY',
  agent: 'AGENT',
  consultant: 'CONSULTANT',
  student: 'STUDENT',
};

// ---- Post categories ------------------------------------------------------
export const CATEGORY_FROM_API = {
  SCHOLARSHIPS: 'scholarships',
  VISA_TIPS: 'visa-tips',
  COURSES: 'courses',
  CAMPUS_LIFE: 'campus-life',
  CAREER: 'career',
  STUDENT_LIFE: 'student-life',
  EVENTS: 'events',
};

export const CATEGORY_TO_API = Object.fromEntries(
  Object.entries(CATEGORY_FROM_API).map(([k, v]) => [v, k])
);

export const MEDIA_FROM_API = { NONE: 'none', IMAGE: 'image', VIDEO: 'video' };
export const MEDIA_TO_API = { none: 'NONE', image: 'IMAGE', video: 'VIDEO' };

// ---- Booking / lead / campaign statuses -----------------------------------
export const BOOKING_STATUS_FROM_API = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const LEAD_STATUS_FROM_API = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CONVERTED: 'converted',
  CLOSED: 'closed',
};

export const CAMPAIGN_STATUS_FROM_API = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ENDED: 'Ended',
};

// ---- Shape helpers --------------------------------------------------------

// Normalise a post returned by the API into the shape the UI components expect.
export function normalisePost(p) {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    category: CATEGORY_FROM_API[p.category] || 'events',
    tags: p.tags || [],
    status: p.status === 'PUBLISHED' ? 'published' : (p.status || '').toLowerCase(),
    isPinned: !!p.isPinned,
    upvotes: p.upvoteCount ?? 0,
    commentCount: p.commentCount ?? 0,
    createdAt: p.createdAt,
    mediaType: MEDIA_FROM_API[p.mediaType] || 'none',
    mediaUrl: p.mediaUrl,
    hasUpvoted: !!p.hasUpvoted,
    hasBookmarked: !!p.hasBookmarked,
    authorId: p.author?.id,
    authorName: p.author?.name,
    authorAvatar: p.author?.avatarUrl,
    authorType: ROLE_FROM_API[p.author?.role] || 'student',
  };
}

// Flatten a User + profile response into a single UI object for marketplace cards.
export function normaliseDirectoryItem(u) {
  const profile = u.university || u.agent || u.consultant || {};
  const studentCount = profile.studentCount ?? 0;
  const internationalPct = profile.internationalPct ?? 0;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatarUrl,
    logo: profile.logoUrl,
    coverImage: profile.coverImageUrl,
    location: profile.location,
    description: profile.description,
    website: profile.website,
    phone: profile.phone,
    rating: profile.rating ?? 0,
    reviewCount: profile.reviewCount ?? 0,
    verified: !!profile.verified,
    tier: (profile.tier || 'FREE').toLowerCase(),
    // University-specific
    shortName: profile.shortName,
    type: profile.type,
    foundedYear: profile.foundedYear,
    established: profile.foundedYear,
    studentCount,
    internationalPct,
    // `internationalStudents` is derived from student count × pct.
    internationalStudents: Math.round((studentCount * internationalPct) / 100),
    tuitionRange: {
      min: profile.tuitionMin ?? 0,
      max: profile.tuitionMax ?? 0,
      currency: profile.tuitionCurrency || 'AUD',
    },
    ranking: profile.ranking,
    views: profile.views ?? 0,
    inquiries: profile.inquiries ?? 0,
    courses: profile.courses || [],
    scholarships: profile.scholarships || [],
    intakes: profile.intakes || [],
    facilities: profile.facilities || [],
    accreditations: profile.accreditations || [],
    // Agent-specific
    contactPerson: profile.contactPerson,
    yearsExperience: profile.yearsExperience,
    studentsPlaced: profile.studentsPlaced,
    partnerInstitutions: profile.partnerInstitutions,
    successRate: profile.successRate,
    certifications: profile.certifications || [],
    services: profile.services || [],
    languages: profile.languages || [],
    specialisations: profile.specialisations || [],
    maraNumber: profile.maraNumber,
    // Consultant-specific
    studentsAssisted: profile.studentsAssisted,
    qualifications: profile.qualifications || [],
    hourlyRate: profile.hourlyRate,
    // Meta
    status: (u.status || 'ACTIVE').toLowerCase(),
    createdAt: u.createdAt,
  };
}

// Normalise a booking response.
export function normaliseBooking(b) {
  return {
    id: b.id,
    subject: b.subject,
    notes: b.notes,
    scheduledAt: b.scheduledAt,
    durationMinutes: b.durationMinutes,
    mode: b.mode,
    status: BOOKING_STATUS_FROM_API[b.status] || 'pending',
    student: b.student,
    provider: b.provider,
    createdAt: b.createdAt,
  };
}

export function normaliseLead(l) {
  return {
    id: l.id,
    programme: l.programme,
    message: l.message,
    status: LEAD_STATUS_FROM_API[l.status] || 'new',
    student: l.student,
    university: l.university,
    createdAt: l.createdAt,
  };
}

export function normaliseCampaign(c) {
  return {
    id: c.id,
    name: c.name,
    audience: c.audience,
    startDate: c.startDate,
    endDate: c.endDate,
    status: CAMPAIGN_STATUS_FROM_API[c.status] || c.status,
    impressions: c.impressions || 0,
    clicks: c.clicks || 0,
    createdAt: c.createdAt,
  };
}
