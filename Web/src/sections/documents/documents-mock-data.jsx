import { CONFIG } from 'src/config-global';



export const _documentCategories = ['Proposal', 'Guide', 'Policy', 'Reference', 'Checklist'];
export const _fmMembers = [
  {
    id: 1,
    firstName: 'John Doe',
    email: 'johnDoe@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-1.webp`,
  },
  {
    id: 2,
    firstName: 'Jane Smith',
    email: 'janeSmith@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-2.webp`,
  },
  {
    id: 3,
    firstName: 'Alice Johnson',
    email: 'aliceJohnson@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-3.webp`,
  },
  {
    id: 4,
    firstName: 'Charlie Green',
    email: 'charlieGreen@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-5.webp`,
  },
  {
    id: 5,
    firstName: 'David Black',
    email: 'davidBlack@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-6.webp`,
  },
  {
    id: 6,
    firstName: 'Eve Adams',
    email: 'eveAdams@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-7.webp`,
  },
  {
    id: 7,
    firstName: 'Bob White',
    email: 'bobWhite@gmail.com',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-4.webp`,
  },
];



export const _mockDocuments = [
    {
      id: '101',
      title: 'Product Strategy',
      description: 'Initial notes and diagrams for strategy',
      category: 'Guide', // ✅ NEW
      content: 'This document outlines the early thoughts on product roadmap...',
      coverUrl: '/assets/images/about/testimonials.webp',
      nodeType: '2',
      createdAt: '2025-04-15T08:30:00Z',
      createdBy: _fmMembers[0],
      viewers: [_fmMembers[1], _fmMembers[2]],
      editors: [_fmMembers[0]],
      publish: true,
      comments: [
        {
          id: 'c1',
          name: _fmMembers[0].firstName,
          message: "This is a fantastic document. Thanks!",
          avatarUrl: _fmMembers[0].photoPath,
          postedAt: '2025-04-20T10:00:00Z',
          replyComment: [
            {
              id: 'r1',
              userId: 2,
              tagUser: 'Aaqib Rehan',
              message: "Agreed! It helped a lot",
              postedAt: '2025-04-20T11:00:00Z',
            },
          ],
          users: [_fmMembers[1]],
        },
      ],
    },
    {
      id: '102',
      title: 'Client Onboarding Guide',
      description: 'Checklist and process steps for onboarding clients.',
      category: 'Checklist', 
      content: '<ul><li>Step 1: Welcome</li><li>Step 2: NDA</li></ul>',
      coverUrl: '/assets/images/about/vision.webp',
      nodeType: '1',
      createdAt: '2025-04-10T10:00:00Z',
      createdBy: _fmMembers[3],
      viewers: [],
      editors: [_fmMembers[3], _fmMembers[4]],
      publish: false,
    },
    {
      id: '103',
      title: 'Security Policy',
      description: 'Security compliance rules and procedures.',
      category: 'Policy', // ✅ NEW
      content: '<p>This document outlines security policies and best practices...</p>',
      coverUrl: '/assets/images/about/what-large.webp',
      nodeType: '2',
      createdAt: '2025-04-12T09:00:00Z',
      createdBy: _fmMembers[2],
      viewers: [_fmMembers[5]],
      editors: [_fmMembers[2]],
      publish: true,
    },
    {
      id: '104',
      title: 'Vendor Proposal',
      description: 'Proposal for new cloud storage vendor evaluation.',
      category: 'Proposal', // ✅ NEW
      content: '<p>Includes pricing and service comparison...</p>',
      coverUrl: '/assets/images/about/about2.webp',
      nodeType: '0',
      createdAt: '2025-04-08T14:20:00Z',
      createdBy: _fmMembers[1],
      viewers: [_fmMembers[4]],
      editors: [_fmMembers[1], _fmMembers[5]],
      publish: false,
    },
    {
      id: '105',
      title: 'Meeting Notes - Q2 Planning',
      description: 'Summary of the quarterly planning meeting.',
      category: 'Reference', 
      content: '<p>Includes goals, KPIs, and task allocation...</p>',
      coverUrl: '/assets/images/about/what-large.webp',
      nodeType: '2',
      createdAt: '2025-04-06T11:45:00Z',
      createdBy: _fmMembers[4],
      viewers: [_fmMembers[0], _fmMembers[6]],
      editors: [_fmMembers[4]],
      publish: true,
    },
    {
      id: '106',
      title: 'System Integration Checklist',
      description: 'Checklist for integrating third-party APIs.',
      category: 'Checklist', // ✅ NEW
      content: '<p>Step-by-step integration guide for developers...</p>',
      coverUrl: '/assets/images/about/what-small.webp',
      nodeType: '2',
      createdAt: '2025-04-01T16:00:00Z',
      createdBy: _fmMembers[5],
      viewers: [_fmMembers[3]],
      editors: [_fmMembers[5], _fmMembers[6]],
      publish: false,
    },
  ];
  