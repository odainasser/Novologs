import { CONFIG } from 'src/config-global';
export const mock_data = [
  {
    code: '1234',
    items: [
      {
        name: 'Nowshad RVP',
        profileImageFileUrl:
          'https://tairrastorage.blob.core.windows.net/novo/1d7de76f-26ea-4faf-a129-31fd66fb1642.jpg',
        path: 'fcde4144-706f-4d25-8580-545ff2e9ca69.jpg',
        url: 'https://tairrastorage.blob.core.windows.net/novo/fcde4144-706f-4d25-8580-545ff2e9ca69.jpg',
        isFile: true,
        member: {
          id: '101',
          name: 'Alice Johnson',
          profileImageFileUrl: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-1.webp`,
        },
      },
      {
        name: 'Shahina',
        path: 'fcde4144-706f-4d25-8580-545ff2e9ca69.jpg',
        url: 'https://tairrastorage.blob.core.windows.net/novo/fcde4144-706f-4d25-8580-545ff2e9ca69.jpg',
        isFile: true,
        member: {
          id: '102',
          name: 'Bob Smith',
          profileImageFileUrl: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-2.webp`,
        },
      },
    ],
    isApproved: false,
    chatCount: 4,
    project: 'Novotak',
  },
  {
    code: '4567',
    items: [
      {
        name: 'Nowshad RVP',
        profileImageFileUrl:
          'https://tairrastorage.blob.core.windows.net/novo/1d7de76f-26ea-4faf-a129-31fd66fb1642.jpg',
        path: '69c7712f-1aad-47b9-b7a7-1c1a131bce33.jpg',
        url: 'https://tairrastorage.blob.core.windows.net/novo/69c7712f-1aad-47b9-b7a7-1c1a131bce33.jpg',
        isFile: true,
        member: {
          id: '101',
          name: 'Alice Johnson',
          profileImageFileUrl: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-1.webp`,
        },
      },
      {
        name: 'Shahina',
        path: '69c7712f-1aad-47b9-b7a7-1c1a131bce33.jpg',
        url: 'https://tairrastorage.blob.core.windows.net/novo/69c7712f-1aad-47b9-b7a7-1c1a131bce33.jpg',
        isFile: true,
        member: {
          id: '102',
          name: 'Bob Smith',
          profileImageFileUrl: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-2.webp`,
        },
      },
    ],
    isApproved: true,
    chatCount: 6,
    project: 'Zeta',
  },
];

export const workflow_mock_data = {
  items: [
    {
      id: '001',
      name: 'Initiate',
    },
    {
      id: '002',
      name: 'Review',
    },
    {
      id: '003',
      name: 'Approve',
    },
  ],
};
