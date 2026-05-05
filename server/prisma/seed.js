/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const hash = (pw) =>
  argon2.hash(pw, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

async function main() {
  console.log('Seeding database...');

  // Wipe first so seed is idempotent.
  await prisma.review.deleteMany();
  await prisma.postVote.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.universityProfile.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.consultantProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const commonPw = await hash('Password123');

  // ---- Admin ----
  await prisma.user.create({
    data: {
      email: 'admin@educonnect.com.au',
      passwordHash: await hash('Admin12345'),
      role: 'ADMIN',
      status: 'ACTIVE',
      name: 'Platform Admin',
      emailVerified: true,
    },
  });

  // ---- Universities ----
  const unis = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admissions@unimelb.edu.au',
        passwordHash: commonPw,
        role: 'UNIVERSITY',
        status: 'ACTIVE',
        name: 'University of Melbourne',
        emailVerified: true,
        university: {
          create: {
            shortName: 'UniMelb',
            location: 'Melbourne, VIC',
            type: 'Group of Eight',
            description:
              'Australia\'s top-ranked university, globally recognised for research and teaching excellence across all major disciplines.',
            website: 'https://unimelb.edu.au',
            phone: '+61 3 9035 5511',
            logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=UM&backgroundColor=1e40af',
            coverImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
            foundedYear: 1853,
            studentCount: 53000,
            internationalPct: 42,
            ranking: 14,
            rating: 4.7,
            reviewCount: 238,
            verified: true,
            tier: 'ENTERPRISE',
            tuitionMin: 42000,
            tuitionMax: 68000,
            tuitionCurrency: 'AUD',
            courses: ['Medicine', 'Law', 'Engineering', 'Business', 'Arts'],
            scholarships: ['Melbourne International Scholarship', 'Chancellor\'s Scholarship'],
            intakes: ['February', 'July'],
            facilities: ['Parkville Library', 'Wilson Hall', 'Sports Centre'],
            accreditations: ['AACSB', 'TEQSA'],
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'study@monash.edu.au',
        passwordHash: commonPw,
        role: 'UNIVERSITY',
        status: 'ACTIVE',
        name: 'Monash University',
        emailVerified: true,
        university: {
          create: {
            shortName: 'Monash',
            location: 'Clayton, VIC',
            type: 'Group of Eight',
            description:
              'Australia\'s largest university with a global presence across five continents.',
            website: 'https://monash.edu',
            logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=MU&backgroundColor=be185d',
            coverImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
            foundedYear: 1958,
            studentCount: 86000,
            internationalPct: 38,
            ranking: 37,
            rating: 4.5,
            reviewCount: 192,
            verified: true,
            tier: 'PREMIUM',
            tuitionMin: 38000,
            tuitionMax: 55000,
            tuitionCurrency: 'AUD',
            courses: ['Pharmacy', 'Engineering', 'IT', 'Education'],
            intakes: ['February', 'July', 'October'],
            facilities: ['Clayton Campus', 'Caulfield Campus'],
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'info@swinburne.edu.au',
        passwordHash: commonPw,
        role: 'UNIVERSITY',
        status: 'ACTIVE',
        name: 'Swinburne University of Technology',
        emailVerified: true,
        university: {
          create: {
            shortName: 'Swinburne',
            location: 'Hawthorn, VIC',
            type: 'Public',
            description:
              'Technology-focused university known for industry engagement and applied research.',
            website: 'https://swinburne.edu.au',
            logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SU&backgroundColor=dc2626',
            foundedYear: 1908,
            studentCount: 54000,
            internationalPct: 28,
            ranking: 285,
            rating: 4.3,
            reviewCount: 141,
            verified: true,
            tier: 'PREMIUM',
            tuitionMin: 32000,
            tuitionMax: 48000,
            tuitionCurrency: 'AUD',
            courses: ['Information Technology', 'Design', 'Engineering', 'Business'],
            intakes: ['February', 'July'],
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'hello@unsw.edu.au',
        passwordHash: commonPw,
        role: 'UNIVERSITY',
        status: 'PENDING',
        name: 'University of New South Wales',
        emailVerified: false,
        university: {
          create: {
            shortName: 'UNSW',
            location: 'Sydney, NSW',
            type: 'Group of Eight',
            description: 'World-class teaching and research across the sciences and humanities.',
            website: 'https://unsw.edu.au',
            verified: false,
            foundedYear: 1949,
            studentCount: 63000,
            tuitionMin: 40000,
            tuitionMax: 62000,
            tuitionCurrency: 'AUD',
          },
        },
      },
    }),
  ]);

  // ---- Agents ----
  const agents = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah@pacificedu.com.au',
        passwordHash: commonPw,
        role: 'AGENT',
        status: 'ACTIVE',
        name: 'Pacific Education Agency',
        emailVerified: true,
        agent: {
          create: {
            contactPerson: 'Sarah Thompson',
            phone: '+61 3 9123 4567',
            location: 'Melbourne, VIC',
            description:
              'Full-service education agency specialising in Australian university placements for South Asian students.',
            logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=PEA&backgroundColor=059669',
            yearsExperience: 12,
            studentsPlaced: 2800,
            partnerInstitutions: 45,
            successRate: 96,
            rating: 4.8,
            reviewCount: 320,
            verified: true,
            tier: 'PREMIUM',
            services: ['Course Selection', 'Visa Assistance', 'Application Support'],
            languages: ['English', 'Hindi', 'Bengali', 'Mandarin'],
            specialisations: ['Business', 'Engineering', 'IT'],
            maraNumber: 'MARN1234567',
            certifications: ['MARA Registered', 'PIER Certified'],
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'contact@globaledu.com.au',
        passwordHash: commonPw,
        role: 'AGENT',
        status: 'ACTIVE',
        name: 'Global Edu Connect',
        emailVerified: true,
        agent: {
          create: {
            contactPerson: 'Michael Chen',
            phone: '+61 2 8765 4321',
            location: 'Sydney, NSW',
            description: 'Connecting international students with their ideal Australian university.',
            logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=GEC&backgroundColor=0891b2',
            yearsExperience: 8,
            studentsPlaced: 1500,
            partnerInstitutions: 32,
            successRate: 92,
            rating: 4.6,
            reviewCount: 210,
            verified: true,
            tier: 'FREE',
            services: ['Counselling', 'Visa Support'],
            languages: ['English', 'Mandarin', 'Cantonese'],
            specialisations: ['Health Sciences', 'Nursing'],
          },
        },
      },
    }),
  ]);

  // ---- Consultants ----
  const consultants = await Promise.all([
    prisma.user.create({
      data: {
        email: 'emma.thompson@educonsult.com.au',
        passwordHash: commonPw,
        role: 'CONSULTANT',
        status: 'ACTIVE',
        name: 'Dr. Emma Thompson',
        emailVerified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        consultant: {
          create: {
            phone: '+61 4 0012 3456',
            location: 'Melbourne, VIC',
            description:
              'Senior education consultant with 15 years of experience guiding international students through their Australian education journey.',
            yearsExperience: 15,
            studentsAssisted: 1100,
            successRate: 94,
            rating: 4.9,
            reviewCount: 178,
            verified: true,
            tier: 'PREMIUM',
            qualifications: ['PhD Education', 'MARA Registered'],
            services: ['Career Counselling', 'University Selection', 'Scholarship Advice'],
            languages: ['English', 'French'],
            specialisations: ['Research degrees', 'Scholarships'],
            hourlyRate: 120,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'raj.patel@educonsult.com.au',
        passwordHash: commonPw,
        role: 'CONSULTANT',
        status: 'ACTIVE',
        name: 'Raj Patel',
        emailVerified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
        consultant: {
          create: {
            phone: '+61 4 0098 7654',
            location: 'Sydney, NSW',
            description:
              'Independent consultant specialising in STEM programs and postgraduate placements.',
            yearsExperience: 9,
            studentsAssisted: 620,
            successRate: 91,
            rating: 4.7,
            reviewCount: 95,
            verified: true,
            tier: 'FREE',
            qualifications: ['MSc Engineering', 'Certified Career Coach'],
            services: ['Mock Interview', 'Portfolio Review'],
            languages: ['English', 'Hindi', 'Gujarati'],
            specialisations: ['Engineering', 'Computer Science'],
            hourlyRate: 90,
          },
        },
      },
    }),
  ]);

  // ---- Students ----
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'arun.kumar@gmail.com',
        passwordHash: commonPw,
        role: 'STUDENT',
        status: 'ACTIVE',
        name: 'Arun Kumar',
        emailVerified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun',
        student: {
          create: {
            nationality: 'India',
            currentEducation: 'Bachelor of Engineering',
            interestedIn: ['Masters in IT', 'Masters in Data Science'],
            preferredLocations: ['Melbourne', 'Sydney'],
            budgetMin: 35000,
            budgetMax: 55000,
            bio: 'Looking to pursue a Masters degree in Data Science in Australia.',
            intakeTarget: 'February 2027',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'wei.zhang@gmail.com',
        passwordHash: commonPw,
        role: 'STUDENT',
        status: 'ACTIVE',
        name: 'Wei Zhang',
        emailVerified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wei',
        student: {
          create: {
            nationality: 'China',
            currentEducation: 'High School',
            interestedIn: ['Bachelor of Business', 'Bachelor of Commerce'],
            preferredLocations: ['Melbourne', 'Brisbane'],
            budgetMin: 30000,
            budgetMax: 45000,
            intakeTarget: 'July 2026',
          },
        },
      },
    }),
  ]);

  // ---- Seed posts from various authors ----
  const samplePosts = [
    {
      authorId: unis[0].id,
      title: 'Melbourne Intl Scholarship applications now open for 2027',
      content:
        'Applications are now open for the Melbourne International Undergraduate Scholarship offering up to 50% fee remission. Deadline: 31 May 2026.',
      category: 'SCHOLARSHIPS',
      tags: ['scholarship', 'undergraduate', 'funding'],
      upvoteCount: 47,
    },
    {
      authorId: agents[0].id,
      title: 'Top 5 tips for your student visa (subclass 500) interview',
      content:
        '1. Know your Genuine Temporary Entrant (GTE) statement well. 2. Have all original documents. 3. Be clear about your study plans. 4. Show financial evidence. 5. Stay calm and honest.',
      category: 'VISA_TIPS',
      tags: ['visa', 'student-visa', 'interview'],
      upvoteCount: 62,
    },
    {
      authorId: consultants[0].id,
      title: 'How to choose between Melbourne and Sydney for your studies',
      content:
        'Both cities are amazing but differ in cost of living, weather, and job market. Melbourne is ~15% cheaper, Sydney has stronger finance jobs...',
      category: 'CAMPUS_LIFE',
      tags: ['melbourne', 'sydney', 'city-comparison'],
      upvoteCount: 38,
    },
    {
      authorId: unis[1].id,
      title: 'Monash Open Day — register now',
      content:
        'Join us on-campus or virtually on 10 August 2026 to explore our courses and meet faculty. Free registration required.',
      category: 'EVENTS',
      tags: ['open-day', 'monash', 'event'],
      upvoteCount: 19,
    },
    {
      authorId: students[0].id,
      title: 'My journey: accepted into Masters of Data Science 🎉',
      content:
        'Sharing my experience and the mistakes I made along the way. Happy to answer any questions!',
      category: 'STUDENT_LIFE',
      tags: ['success-story', 'data-science', 'masters'],
      upvoteCount: 85,
    },
  ];

  for (const p of samplePosts) {
    await prisma.post.create({ data: p });
  }

  // ---- Seed sample enquiries ----
  await prisma.lead.create({
    data: {
      studentId: students[0].id,
      targetId: unis[0].id,
      targetRole: 'UNIVERSITY',
      programme: 'Masters of Data Science',
      message:
        'Hi, I\'m interested in your Masters of Data Science program for Feb 2027 intake. Can you share more info on prerequisites and scholarships?',
    },
  });
  await prisma.universityProfile.update({
    where: { userId: unis[0].id },
    data: { inquiries: { increment: 1 } },
  });

  await prisma.lead.create({
    data: {
      studentId: students[1].id,
      targetId: agents[0].id,
      targetRole: 'AGENT',
      message:
        'Hi, I\'m looking for an agent to help me apply to business programs in Melbourne. Could you let me know your fees and process?',
    },
  });

  // ---- Seed campaigns for UniMelb ----
  await prisma.campaign.createMany({
    data: [
      {
        universityId: unis[0].id,
        name: 'Summer Intake 2026',
        audience: 'International Students - South Asia',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
        impressions: 45200,
        clicks: 3840,
      },
      {
        universityId: unis[0].id,
        name: 'Scholarship Awareness',
        audience: 'High-Achieving Students',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-05-15'),
        status: 'ACTIVE',
        impressions: 32100,
        clicks: 2890,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Login credentials:');
  console.log('  Admin       — admin@educonnect.com.au / Admin12345');
  console.log('  All others  — any seed email / Password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
