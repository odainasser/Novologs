import { CONFIG } from 'src/config-global';

export const _fmProjects = ['General', 'Tairra', 'Islam Web', 'Hawala', 'Zeta'];

export const _fmClients = ['Etisalat', 'DU', 'Noon', 'Amazon UAE', 'Careem', 'Talabat'];

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

export const _allFiles = [
  {
    id: '1',
    name: 'Landing Page Design.pdf',
    type: 'pdf',
    size: 245678,
    modifiedAt: '2025-04-06T10:30:00Z',
    createdAt: '2025-04-05T09:00:00Z',
    projectName: 'Zeta',
    clientName: 'Etisalat',
    members: [_fmMembers[0], _fmMembers[1]],
    shared: true,  // File is shared if it has members
    starred: false,  // Randomly mark files as starred or not
    owner: 'me',  // Assuming this file belongs to the current user
    parentId: null,
  },
  {
    id: '2',
    name: 'Proposal.docx',
    type: 'docx',
    size: 87654,
    modifiedAt: '2025-04-03T15:20:00Z',
    createdAt: '2025-04-03T14:00:00Z',
    projectName: 'General',
    clientName: 'DU',
    members: [],
    shared: false,  // No members, not shared
    starred: false,
    owner: 'me',
    parentId: null,
  },
  {
    id: '3',
    name: 'Tairra Files',
    type: 'folder',
    size: 0,
    modifiedAt: '2025-04-02T13:15:00Z',
    createdAt: '2025-04-01T11:00:00Z',
    projectName: 'Tairra',
    clientName: 'Amazon UAE',
    members: [_fmMembers[2], _fmMembers[3]],
    shared: true,
    starred: false,
    owner: 'me',
    parentId: null,
  },
  {
    id: '4',
    name: 'Assets Folder',
    type: 'folder',
    size: 0,
    modifiedAt: '2025-04-07T09:00:00Z',
    createdAt: '2025-04-07T08:00:00Z',
    projectName: 'Zeta',
    clientName: 'Careem',
    members: [],
    shared: false,
    starred: false,
    owner: 'me',
    parentId: null,
  },
  {
    id: '5',
    name: 'Phase 1 Docs',
    type: 'folder',
    size: 0,
    modifiedAt: '2025-04-10T11:00:00Z',
    createdAt: '2025-04-10T09:00:00Z',
    projectName: 'Tairra',
    clientName: 'Amazon UAE',
    members: [_fmMembers[5], _fmMembers[6]],
    shared: true,
    starred: true,  // Mark as starred
    owner: 'me',
    parentId: '3',
  },
  {
    id: '6',
    name: 'API Reference.docx',
    type: 'docx',
    size: 123000,
    modifiedAt: '2025-04-10T12:30:00Z',
    createdAt: '2025-04-10T10:00:00Z',
    projectName: 'Tairra',
    clientName: 'Amazon UAE',
    members: [_fmMembers[2], _fmMembers[3]],
    shared: true,
    starred: false,
    owner: 'me',
    parentId: '5',
  },
];
