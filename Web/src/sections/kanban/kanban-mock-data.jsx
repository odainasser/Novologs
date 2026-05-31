import { useMemo, useState } from 'react';
import { CONFIG } from 'src/config-global';
import { mutate } from 'swr';
import axios, { fetcher, endpoints } from 'src/utils/axios';

const enableServer = false;

const KANBAN_ENDPOINT = endpoints.kanban;

export function useGetBoard() {
  const initialData = {
    board: {
      tasks: {
        '1-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2': [
          {
            id: '1-task-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
            reporter: {
              id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17',
              name: 'Angelique Morse',
              avatarUrl:
                'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-17.webp',
            },
            name: 'Develop Landing Page',
            labels: ['Technology'],
            comments: [
              {
                id: 'f33f755e-7ef3-4d10-9979-17dab19b3613',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
                createdAt: '2025-03-27T07:55:33+00:00',
                messageType: 'text',
                message:
                  'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.',
              },
            ],
            assignee: [
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
              },
            ],
            description:
              'Atque eaque ducimus minima distinctio velit. Laborum et veniam officiis. Delectus ex saepe hic id laboriosam officia. Odit nostrum qui illum saepe debitis ullam. Laudantium beatae modi fugit ut. Dolores consequatur beatae nihil voluptates rem maiores.',
            due: ['2025-03-29T08:15:33+00:00', '2025-03-30T08:15:33+00:00'],
            priority: 'hight',
            attachments: [
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-12.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-13.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-14.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-15.webp',
            ],
            status: 'Not started',
          },
          {
            id: '2-task-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
            reporter: {
              id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17',
              name: 'Angelique Morse',
              avatarUrl:
                'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-17.webp',
            },
            name: 'Design Homepage',
            labels: ['Technology', 'Health and Wellness'],
            comments: [
              {
                id: 'bffb2879-c4e3-4fab-9ca8-83ae6a2a46cf',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
                createdAt: '2025-03-27T07:55:33+00:00',
                messageType: 'text',
                message:
                  'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.',
              },
              {
                id: '926f4682-829e-418d-9317-1e4a25e1ba2b',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
                createdAt: '2025-03-27T07:56:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-7.webp',
              },
            ],
            assignee: [
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
              },
            ],
            description:
              'Rerum eius velit dolores. Explicabo ad nemo quibusdam. Voluptatem eum suscipit et ipsum et consequatur aperiam quia. Rerum nulla sequi recusandae illum velit quia quas. Et error laborum maiores cupiditate occaecati.',
            due: ['2025-03-30T08:15:33+00:00', '2025-03-31T08:15:33+00:00'],
            priority: 'medium',
            attachments: [],
            status: 'In progress',
          },
          {
            id: '3-task-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4',
            reporter: {
              id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17',
              name: 'Angelique Morse',
              avatarUrl:
                'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-17.webp',
            },
            name: 'Implement API Integration for Tairra',
            labels: ['Technology', 'Health and Wellness', 'Travel'],
            comments: [
              {
                id: '5e2ee093-ce57-4c38-bc9a-1f8c551fa239',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
                createdAt: '2025-03-27T07:55:33+00:00',
                messageType: 'text',
                message:
                  'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.',
              },
              {
                id: '5fea791f-4292-40a3-b00f-be5b8ea57a56',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
                createdAt: '2025-03-27T07:56:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-7.webp',
              },
              {
                id: 'a356bf3e-7d97-49ab-b840-cd64771662a0',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
                createdAt: '2025-03-27T07:57:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-8.webp',
              },
            ],
            assignee: [
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
              },
            ],
            description:
              'Et non omnis qui. Qui sunt deserunt dolorem aut velit cumque adipisci aut enim. Nihil quis quisquam nesciunt dicta nobis ab aperiam dolorem repellat. Voluptates non blanditiis. Error et tenetur iste soluta cupiditate ratione perspiciatis et. Quibusdam aliquid nam sunt et quisquam non esse.',
            due: ['2025-03-31T08:15:33+00:00', '2025-04-01T08:15:33+00:00'],
            priority: 'hight',
            attachments: [],
            status: 'In progress',
          },
        ],
        '2-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3': [
          {
            id: '4-task-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5',
            reporter: {
              id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17',
              name: 'Angelique Morse',
              avatarUrl:
                'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-17.webp',
            },
            name: 'Develop a comprehensive task management system with real-time collaboration, automated notifications, and seamless API integration for enhanced productivity',
            labels: ['Technology', 'Health and Wellness', 'Travel', 'Finance'],
            comments: [
              {
                id: '2aa02b04-394c-4d0b-a385-c92eaacc42fa',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
                createdAt: '2025-03-27T07:55:33+00:00',
                messageType: 'text',
                message:
                  'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.',
              },
              {
                id: '60a34b45-ff75-4286-ae29-c206488df9d9',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
                createdAt: '2025-03-27T07:56:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-7.webp',
              },
              {
                id: '2212dd87-fa8a-4985-8c1d-b0c1a8ee71e9',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
                createdAt: '2025-03-27T07:57:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-8.webp',
              },
              {
                id: 'a69cebe4-94d9-4ea0-a351-26188433e8a1',
                name: 'Harrison Stein',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-4.webp',
                createdAt: '2025-03-27T07:58:33+00:00',
                messageType: 'text',
                message: 'The aroma of freshly brewed coffee filled the air, awakening my senses.',
              },
            ],
            assignee: [
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4',
                name: 'Harrison Stein',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-4.webp',
              },
            ],
            description:
              'Nihil ea sunt facilis praesentium atque. Ab animi alias sequi molestias aut velit ea. Sed possimus eos. Et est aliquid est voluptatem.',
            due: ['2025-04-01T08:15:33+00:00', '2025-04-02T08:15:33+00:00'],
            priority: 'medium',
            attachments: [],
            status: 'In progress',
          },
          {
            id: '5-task-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6',
            reporter: {
              id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17',
              name: 'Angelique Morse',
              avatarUrl:
                'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-17.webp',
            },
            name: 'Final Review and Deployment',
            labels: ['Technology', 'Health and Wellness', 'Travel', 'Finance', 'Education'],
            comments: [
              {
                id: '90ccc86c-cc31-4390-8a34-01fcae99da21',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
                createdAt: '2025-03-27T07:55:33+00:00',
                messageType: 'text',
                message:
                  'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.',
              },
              {
                id: '1351622e-2394-4e77-896a-bc31f4831412',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
                createdAt: '2025-03-27T07:56:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-7.webp',
              },
              {
                id: 'b4bb218a-d025-4a22-b24c-9f5ce27bfc28',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
                createdAt: '2025-03-27T07:57:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-8.webp',
              },
              {
                id: 'c9b86e16-862c-4d01-860e-53462b94618d',
                name: 'Harrison Stein',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-4.webp',
                createdAt: '2025-03-27T07:58:33+00:00',
                messageType: 'text',
                message: 'The aroma of freshly brewed coffee filled the air, awakening my senses.',
              },
              {
                id: 'ab9ef3ff-1f1f-4e11-a1e6-cb95cc3c72ee',
                name: 'Reece Chung',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-5.webp',
                createdAt: '2025-03-27T07:59:33+00:00',
                messageType: 'text',
                message:
                  'The children giggled with joy as they ran through the sprinklers on a hot summer day.',
              },
            ],
            assignee: [
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4',
                name: 'Harrison Stein',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-4.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5',
                name: 'Reece Chung',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-5.webp',
              },
            ],
            description:
              'Non rerum modi. Accusamus voluptatem odit nihil in. Quidem et iusto numquam veniam culpa aperiam odio aut enim. Quae vel dolores. Pariatur est culpa veritatis aut dolorem.',
            due: ['2025-04-02T08:15:33+00:00', '2025-04-03T08:15:33+00:00'],
            priority: 'low',
            attachments: [
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-5.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-6.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-7.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-8.webp',
              'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-9.webp',
            ],
            status: 'Done',
          },
        ],
        '3-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4': [],
        '4-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5': [
          {
            id: '6-task-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b7',
            reporter: {
              id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17',
              name: 'Angelique Morse',
              avatarUrl:
                'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-17.webp',
            },
            name: 'Organize Team Meeting',
            labels: [
              'Technology',
              'Health and Wellness',
              'Travel',
              'Finance',
              'Education',
              'Food and Beverage',
            ],
            comments: [
              {
                id: '4e81d177-077e-4631-bd76-64b61123f8e3',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
                createdAt: '2025-03-27T07:55:33+00:00',
                messageType: 'text',
                message:
                  'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.',
              },
              {
                id: 'ddd01b36-1fa9-4b4c-a88c-0ec424e2f891',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
                createdAt: '2025-03-27T07:56:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-7.webp',
              },
              {
                id: '4488d996-4894-423b-a5ba-c1f3fe74e469',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
                createdAt: '2025-03-27T07:57:33+00:00',
                messageType: 'image',
                message: 'https://api-dev-minimal-v610.pages.dev/assets/images/cover/cover-8.webp',
              },
              {
                id: '0dcdb6dd-fb6b-4010-9858-e606be05661e',
                name: 'Harrison Stein',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-4.webp',
                createdAt: '2025-03-27T07:58:33+00:00',
                messageType: 'text',
                message: 'The aroma of freshly brewed coffee filled the air, awakening my senses.',
              },
              {
                id: '5d3b27c2-f774-4bd4-8bbb-ea4789c50adf',
                name: 'Reece Chung',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-5.webp',
                createdAt: '2025-03-27T07:59:33+00:00',
                messageType: 'text',
                message:
                  'The children giggled with joy as they ran through the sprinklers on a hot summer day.',
              },
              {
                id: 'd9154b13-bf42-45ea-8300-a3756b8bfc11',
                name: 'Lainey Davidson',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-6.webp',
                createdAt: '2025-03-27T08:00:33+00:00',
                messageType: 'text',
                message:
                  'He carefully crafted a beautiful sculpture out of clay, his hands skillfully shaping the intricate details.',
              },
            ],
            assignee: [
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
                name: 'Jayvion Simon',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-1.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
                name: 'Lucian Obrien',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-2.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
                name: 'Deja Brady',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-3.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4',
                name: 'Harrison Stein',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-4.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5',
                name: 'Reece Chung',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-5.webp',
              },
              {
                id: 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6',
                name: 'Lainey Davidson',
                avatarUrl:
                  'https://api-dev-minimal-v610.pages.dev/assets/images/avatar/avatar-6.webp',
              },
            ],
            description:
              'Est enim et sit non impedit aperiam cumque animi. Aut eius impedit saepe blanditiis. Totam molestias magnam minima fugiat.',
            due: ['2025-04-03T08:15:33+00:00', '2025-04-04T08:15:33+00:00'],
            priority: 'low',
            attachments: [],
            status: 'On Hold',
          },
        ],
      },
      columns: [
        {
          id: '1-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2',
          name: 'Not started',
        },
        {
          id: '2-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3',
          name: 'In progress',
        },
        {
          id: '3-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4',
          name: 'On Hold',
        },
        {
          id: '4-column-e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5',
          name: 'Done',
        },
      ],
    },
  };

  const [boardData, setBoardData] = useState(initialData.board);

  // Function to update board
  const updateBoard = (updatedTasks) => {
    setBoardData((prevBoard) => ({
      ...prevBoard,
      tasks: updatedTasks,
    }));
  };

  // Memoized value to optimize re-renders
  const memoizedValue = useMemo(() => {
    return {
      board: boardData,
      boardEmpty: !boardData.columns.length,
      updateBoard, // Expose update function
    };
  }, [boardData]);

  return memoizedValue;
}
export const _status = [`Not started`, `In progress`, `On hold`, `Submitted`, `Completed`];

export const taskStatus = [`Approved`, `Not Approved`];
export const taskVariant = [
  `General`,
  `Project`,
  `Mission`,
  `Client`,
  `Vendor`,
  `Lead`,
  `Contract`,
];
export const taskVariantAr = ['عام', 'المشاريع', 'المهمة', 'العميل', 'المورد', 'صفقة', 'العقد'];

export const _projects = [`General`, `Tairra`, `Islam Web`, `Hawala`, `Zeta`];

export const _categories = [`Design`, `Development`, `Testing`];

export const _members = [
  {
    id: 1,
    firstName: 'John Doe',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-1.webp`,
    email: 'johnDoe@gmail.com',
    designationName: 'System Administrator',
    departmentName: 'IT',
    empStatus: {
      name: 'On Duty',
      colorCode: '#00B894',
    },
  },
  {
    id: 2,
    firstName: 'Jane Smith',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-2.webp`,
    email: 'janeSmith@gmail.com',
    designationName: 'QA Engineer',
    departmentName: 'IT',
    empStatus: {
      name: 'On Duty',
      colorCode: '#00B894',
    },
  },
  {
    id: 3,
    firstName: 'Alice Johnson',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-3.webp`,
    email: 'AliceJohnson@gmail.com',
    designationName: 'CEO',
    departmentName: 'Management',
  },
  {
    id: 4,
    firstName: 'Charlie Green',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-5.webp`,
    email: 'charlieGreen@gmail.com',
    designationName: 'Software Developer',
    departmentName: 'IT',
    empStatus: {
      name: 'Vacation',
      colorCode: '#D63031',
    },
  },
  {
    id: 5,
    firstName: 'David Black',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-6.webp`,
    email: 'davidBlack@gmail.com',
  },
  {
    id: 6,
    firstName: 'Eve Adams',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-7.webp`,
    email: 'eveAdams@gmail.com',
  },
  {
    id: 7,
    firstName: 'Bob White',
    photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-4.webp`,
    email: 'bobWhite@gmail.com',
  },
  // {
  //   id: 8,
  //   firstName: 'Jaydon Frankie',
  //   photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-25.webp`,
  //   email: 'demo@minimals.cc',
  // },
];

export const _weight = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  value: index + 1,
}));

export const priorityOptions = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
};

export const tasks = [
  {
    id: 1,
    taskId: 45,
    projectName: 'General',
    title: 'Develop Landing Page',
    startDate: '2025-03-24T03:30:34+04:00',
    endDate: '2025-03-31T11:28:34+04:00',
    status: 'In progress',
    assignedToMe: true,
    category: 'Design',
    isProject: true,
    projectId: 1,
    members: [
      {
        id: 1,
        firstName: 'John Doe',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-1.webp`,
        email: 'johnDoe@gmail.com',
      },
      {
        id: 2,
        firstName: 'Jane Smith',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-2.webp`,
        email: 'janeSmith@gmail.com',
      },
    ],
    subTasks: [
      {
        id: 11,
        taskId: 147,
        projectName: 'General',
        title: 'Develop Home Page',
        startDate: '2025-03-24T11:28:34+04:00',
        endDate: '2025-03-25T11:28:34+04:00',
        status: 'In progress',
        isProject: true,
        projectId: 1,
        members: [
          {
            id: 2,
            firstName: 'Jane Smith',
            photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-2.webp`,
            email: 'janeSmith@gmail.com',
          },
        ],

        subTasks: [],
        priority: 'High',
        type: 'created',
      },
      {
        id: 12,
        taskId: 148,
        projectName: 'General',
        title: 'Develop Teams Page',
        startDate: '2025-03-24T11:28:34+04:00',
        endDate: '2025-03-25T11:28:34+04:00',
        status: 'Not started',
        isProject: true,
        projectId: 1,
        members: [
          {
            id: 1,
            firstName: 'John Doe',
            photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-1.webp`,
            email: 'johnDoe@gmail.com',
          },
        ],

        subTasks: [],
        priority: 'High',
        type: 'assigned',
      },
    ],
    priority: 'High',
    weight: 5,
    type: 'assigned',
  },
  {
    id: 2,
    taskId: 213,
    projectName: 'Project',
    title: 'Design Homepage',
    startDate: '2025-03-20T11:28:34+04:00',
    endDate: '2025-03-25T11:28:34+04:00',
    status: 'Completed',
    assignedToMe: false,
    category: 'Testing',
    isProject: true,
    projectId: 2,
    members: [
      {
        id: 3,
        firstName: 'Alice Johnson',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-3.webp`,
        email: 'alicJohnson@gmail.com',
      },
    ],
    subTasks: [],
    priority: 'Low',
    weight: 10,
    type: 'created',
  },
  {
    id: 3,
    taskId: 334,
    projectName: 'Mission',
    title: 'Implement API Integration for Tairra ',
    startDate: '2025-03-26T11:28:34+04:00',
    endDate: '2025-04-02T11:28:34+04:00',
    status: 'Not started',
    assignedToMe: true,
    category: 'Testing',
    isProject: false,
    projectId: 3,
    members: [],
    subTasks: [],
    priority: 'Medium',
    weight: 25,
    type: 'backlog',
  },
  {
    id: 4,
    taskId: 423,
    projectName: 'Client',
    title:
      'Develop a comprehensive task management system with real-time collaboration, automated notifications, and seamless API integration for enhanced productivity',
    startDate: '2025-04-01T11:28:34+04:00',
    endDate: '2025-04-05T11:28:34+04:00',
    status: 'On hold',
    assignedToMe: true,
    category: 'Development',
    isProject: true,
    projectId: 4,
    members: [
      {
        id: 4,
        firstName: 'Charlie Green',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-5.webp`,
        email: 'charlieGreen@gmail.com',
      },
      {
        id: 5,
        firstName: 'David Black',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-6.webp`,
        email: 'davidBlack@gmail.com',
      },
      {
        id: 6,
        firstName: 'Eve Adams',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-7.webp`,
        email: 'eveAdams.com',
      },
      {
        id: 7,
        firstName: 'Bob White',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-4.webp`,
        email: 'bodWhite@gmail.com',
      },
    ],
    subTasks: [
      {
        id: 41,
        taskId: 424,
        projectName: 'Vendor',
        title: 'Manual Testing',
        startDate: '2025-04-01T11:28:34+04:00',
        endDate: '2025-04-03T11:28:34+04:00',
        status: 'On hold',
        isProject: true,
        projectId: 4,
        members: [
          {
            id: 4,
            firstName: 'Charlie Green',
            photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-5.webp`,
            email: 'charlieGreen@gmail.com',
          },
          {
            id: 5,
            firstName: 'David Black',
            photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-6.webp`,
            email: 'davidBlack@gmail.com',
          },
        ],
        subTasks: [],
        priority: 'Medium',
        type: 'created',
      },
    ],
    priority: 'Medium',
    weight: 15,
    type: 'created',
  },
  {
    id: 5,
    taskId: 513,
    projectName: 'General',
    title: 'Final Review and Deployment',
    startDate: '2025-04-03T11:28:34+04:00',
    endDate: '2025-04-07T11:28:34+04:00',
    status: 'Submitted',
    assignedToMe: false,
    category: 'Design',
    isProject: false,
    projectId: 5,
    members: [
      {
        id: 6,
        firstName: 'Eve Adams',
        photoPath: `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-7.webp`,
        email: 'eveAdams@gmail.com',
      },
    ],
    subTasks: [],
    priority: 'High',
    weight: 20,
    type: 'assigned',
  },
];

export async function moveTask(updateTasks) {
  /**
   * Work in local
   */
  mutate(
    KANBAN_ENDPOINT,
    (currentData) => {
      const { board } = currentData;
      console.log('this is the current data', currentData);

      // update board.tasks
      const tasks = updateTasks;

      return { ...currentData, board: { ...board, tasks } };
    },
    false
  );

  /**
   * Work on server
   */
  if (enableServer) {
    const data = { updateTasks };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'move-task' } });
  }
}
export const TASK_STATUS = [
  { id: 1, name: 'Not Started', nameAr: 'لم يبدأ' },
  { id: 2, name: 'In Progress', nameAr: 'قيد التنفيذ' },
  { id: 3, name: 'On Hold', nameAr: 'قيد الانتظار' },
  { id: 4, name: 'Submitted', nameAr: 'تم الإرسال' },
  { id: 5, name: 'Completed', nameAr: 'مكتمل' },
];

export const TASK_CATEGORIES = [
  { id: 1, name: 'Development', nameAr: 'تطوير' },
  { id: 2, name: 'Design', nameAr: 'تصميم' },
  { id: 3, name: 'Testing', nameAr: 'اختبار' },
  { id: 4, name: 'Deployment', nameAr: 'نشر' },
  { id: 5, name: 'Research', nameAr: 'بحث' },
  { id: 6, name: 'Documentation', nameAr: 'توثيق' },
];
export const TASK_PRIORITIES = [
  { id: 1, name: 'Low', nameAr: 'منخفض' },
  { id: 2, name: 'Medium', nameAr: 'متوسط' },
  { id: 3, name: 'High', nameAr: 'مرتفع' },
];

export const task_variant = [
  { id: 1, name: 'General', nameAr: 'عام' },
  { id: 2, name: 'Project', nameAr: 'مشروع' },
  { id: 3, name: 'Mission', nameAr: 'مهمة' },
  { id: 4, name: 'Client', nameAr: 'عميل' },
  { id: 5, name: 'Vendor', nameAr: 'مورد' },
];

export const task_type = [
  { id: 1, name: 'Bug', nameAr: 'خلل' },
  { id: 2, name: 'Feature', nameAr: 'ميزة' },
  { id: 3, name: 'Improvement', nameAr: 'تحسين' },
  { id: 4, name: 'Research', nameAr: 'بحث' },
  { id: 5, name: 'Maintenance', nameAr: 'صيانة' },
];

export const mission_task_type = [
  {
    id: 1,
    name: 'Planning',
    nameAr: 'تخطيط',
  },
  {
    id: 2,
    name: 'Design Review',
    nameAr: 'مراجعة التصميم',
  },
  {
    id: 3,
    name: 'Site Visit',
    nameAr: 'زيارة الموقع',
  },
  {
    id: 4,
    name: 'Progress Monitoring',
    nameAr: 'مراقبة التقدم',
  },
  {
    id: 5,
    name: 'Quality Assurance',
    nameAr: 'ضمان الجودة',
  },
  {
    id: 6,
    name: 'Risk Assessment',
    nameAr: 'تقييم المخاطر',
  },
  {
    id: 7,
    name: 'Stakeholder Meeting',
    nameAr: 'اجتماع أصحاب المصلحة',
  },
  {
    id: 8,
    name: 'Final Handover',
    nameAr: 'التسليم النهائي',
  },
];

export const CATEGORIES = ['Not started', 'In progress', 'On hold', 'Submitted', 'Completed'];

export const MOCK_EMPLOYEE_TASKS = [
  {
    employeeId: 1,
    employeeName: 'Aisha Khan',
    stats: {
      notStarted: 5,
      inProgress: 8,
      onHold: 2,
      submitted: 3,
      completed: 12,
    },
  },
  {
    employeeId: 2,
    employeeName: 'Mohammed Ali',
    stats: {
      notStarted: 2,
      inProgress: 6,
      onHold: 1,
      submitted: 4,
      completed: 9,
    },
  },
];
