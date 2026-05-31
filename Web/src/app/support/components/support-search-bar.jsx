'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';

// ----------------------------------------------------------------------

// Support content data for search
const SUPPORT_SEARCH_DATA = [
  // Getting Started
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of NovoTak platform',
    path: '/support/getting-started',
    category: 'Getting Started',
    icon: 'solar:play-circle-bold',
    keywords: ['start', 'begin', 'setup', 'introduction', 'basics', 'first time']
  },
  {
    id: 'registration',
    title: 'Company Registration',
    description: 'How to register your company on NovoTak',
    path: '/support/getting-started?section=registration',
    category: 'Getting Started',
    icon: 'solar:buildings-bold',
    keywords: ['register', 'company', 'signup', 'account', 'create']
  },
  {
    id: 'first-login',
    title: 'First Login',
    description: 'Steps for your first login to NovoTak',
    path: '/support/getting-started?section=first-login',
    category: 'Getting Started',
    icon: 'solar:login-3-bold',
    keywords: ['login', 'signin', 'first', 'access', 'credentials']
  },

  // Teams
  {
    id: 'teams',
    title: 'Teams Management',
    description: 'Manage team members, roles, and permissions',
    path: '/support/teams',
    category: 'Teams',
    icon: 'solar:users-group-two-rounded-bold',
    keywords: ['team', 'members', 'users', 'staff', 'employees', 'people']
  },
  {
    id: 'team-roles',
    title: 'Roles & Permissions',
    description: 'Set up roles and manage permissions',
    path: '/support/teams?section=roles-permissions',
    category: 'Teams',
    icon: 'solar:shield-user-bold',
    keywords: ['roles', 'permissions', 'access', 'rights', 'security', 'authorization']
  },
  {
    id: 'org-chart',
    title: 'Organization Chart',
    description: 'Create and manage organizational hierarchy',
    path: '/support/teams?section=organizational-chart',
    category: 'Teams',
    icon: 'solar:hierarchy-square-3-bold',
    keywords: ['organization', 'hierarchy', 'structure', 'chart', 'tree']
  },

  // Tasks
  {
    id: 'tasks',
    title: 'Task Management',
    description: 'Create, assign, and track tasks',
    path: '/support/tasks',
    category: 'Tasks',
    icon: 'solar:checklist-minimalistic-bold',
    keywords: ['tasks', 'todo', 'assignments', 'work', 'activities']
  },
  {
    id: 'task-creation',
    title: 'Creating Tasks',
    description: 'How to create and configure tasks',
    path: '/support/tasks?section=task-creation',
    category: 'Tasks',
    icon: 'solar:add-square-bold',
    keywords: ['create', 'new', 'add', 'task', 'assignment']
  },
  {
    id: 'task-assignment',
    title: 'Task Assignment',
    description: 'Assign tasks to team members',
    path: '/support/tasks?section=task-assignment',
    category: 'Tasks',
    icon: 'solar:user-plus-bold',
    keywords: ['assign', 'delegate', 'allocate', 'distribute']
  },

  // Project Management
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Manage projects, milestones, and deliverables',
    path: '/support/project-management',
    category: 'Projects',
    icon: 'solar:folder-with-files-bold',
    keywords: ['projects', 'management', 'milestones', 'deliverables', 'planning']
  },
  {
    id: 'project-creation',
    title: 'Creating Projects',
    description: 'How to create and set up new projects',
    path: '/support/project-management?section=project-creation',
    category: 'Projects',
    icon: 'solar:document-add-bold',
    keywords: ['create', 'project', 'new', 'setup', 'initialize']
  },
  {
    id: 'project-tasks',
    title: 'Project Tasks',
    description: 'Manage tasks within projects',
    path: '/support/project-management?section=project-tasks',
    category: 'Projects',
    icon: 'solar:list-check-bold',
    keywords: ['project tasks', 'subtasks', 'work items']
  },

  // Ticketing
  {
    id: 'ticketing',
    title: 'Ticketing System',
    description: 'Manage tickets and customer support',
    path: '/support/ticketing',
    category: 'Ticketing',
    icon: 'solar:ticket-bold',
    keywords: ['tickets', 'support', 'issues', 'requests', 'helpdesk']
  },
  {
    id: 'ticketing-projects',
    title: 'Ticketing Projects',
    description: 'Create and manage ticketing projects',
    path: '/support/ticketing?section=ticketing-projects',
    category: 'Ticketing',
    icon: 'solar:folder-bold',
    keywords: ['ticketing projects', 'project setup', 'ticket organization']
  },
  {
    id: 'ticket-creation',
    title: 'Creating Tickets',
    description: 'How to create and submit tickets',
    path: '/support/ticketing?section=ticket-creation',
    category: 'Ticketing',
    icon: 'solar:add-circle-bold',
    keywords: ['create ticket', 'submit', 'report issue', 'request']
  },
  {
    id: 'ticket-assignment',
    title: 'Ticket Assignment',
    description: 'Assign tickets to resolvers',
    path: '/support/ticketing?section=ticket-assignment',
    category: 'Ticketing',
    icon: 'solar:user-hand-up-bold',
    keywords: ['assign ticket', 'resolver', 'delegate', 'allocate']
  },
  {
    id: 'ticket-management',
    title: 'Ticket Management',
    description: 'Manage and track ticket progress',
    path: '/support/ticketing?section=ticket-management',
    category: 'Ticketing',
    icon: 'solar:settings-bold',
    keywords: ['manage tickets', 'track', 'status', 'progress', 'workflow']
  },

  // Common Help Topics
  {
    id: 'mobile-vs-web',
    title: 'Mobile vs Web Features',
    description: 'Differences between mobile and web platforms',
    path: '/support/getting-started?section=overview',
    category: 'General',
    icon: 'solar:devices-bold',
    keywords: ['mobile', 'web', 'platform', 'differences', 'features', 'comparison']
  },
  {
    id: 'permissions',
    title: 'User Permissions',
    description: 'Understanding user roles and permissions',
    path: '/support/teams?section=roles-permissions',
    category: 'General',
    icon: 'solar:shield-check-bold',
    keywords: ['permissions', 'access', 'roles', 'security', 'authorization', 'rights']
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    path: '/support/getting-started?section=tips',
    category: 'General',
    icon: 'solar:bug-bold',
    keywords: ['troubleshooting', 'problems', 'issues', 'solutions', 'help', 'fix']
  }
];

// ----------------------------------------------------------------------

export function SupportSearchBar({ sx, ...other }) {
  const { t } = useTranslation('support');
  const theme = useTheme();
  const router = useRouter();
  
  const search = useBoolean();
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      search.onToggle();
      setSearchQuery('');
    }
    if (event.key === 'Escape') {
      handleClose();
    }
  }, [search, handleClose]);

  useEventListener('keydown', handleKeyDown);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORT_SEARCH_DATA.slice(0, 8); // Show popular items

    const query = searchQuery.toLowerCase();
    return SUPPORT_SEARCH_DATA.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descriptionMatch = item.description.toLowerCase().includes(query);
      const categoryMatch = item.category.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(query));
      
      return titleMatch || descriptionMatch || categoryMatch || keywordMatch;
    }).slice(0, 10);
  }, [searchQuery]);

  const handleItemClick = useCallback((path) => {
    router.push(path);
    handleClose();
  }, [router, handleClose]);

  const groupedResults = useMemo(() => {
    const groups = {};
    searchResults.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [searchResults]);

  return (
    <>
      <Box
        onClick={search.onTrue}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          minWidth: { xs: 200, sm: 280 },
          height: 40,
          bgcolor: 'white',
          borderRadius: 1,
          cursor: 'pointer',
          transition: theme.transitions.create(['background-color', 'box-shadow']),
          '&:hover': {
            bgcolor: 'white',
            boxShadow: theme.customShadows.z8,
          },
          ...sx,
        }}
        {...other}
      >
        <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled' }} />
        <Typography variant="body2" sx={{ color: 'text.disabled', flex: 1 }}>
          Search support documentation...
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.25,
            bgcolor: alpha(theme.palette.grey[500], 0.12),
            borderRadius: 0.5,
            typography: 'caption',
            color: 'text.secondary',
          }}
        >
          ⌘K
        </Box>
      </Box>

      <Dialog
        fullWidth
        disableRestoreFocus
        maxWidth="md"
        open={search.value}
        onClose={handleClose}
        PaperProps={{ 
          sx: { 
            mt: 8, 
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: theme.customShadows.dropdown
          } 
        }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search support documentation..."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ESC to close
                </Typography>
              </Box>
            }
            inputProps={{ sx: { typography: 'h6' } }}
          />
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {!searchQuery.trim() && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Popular Help Topics
              </Typography>
            </Box>
          )}

          {Object.entries(groupedResults).map(([category, items]) => (
            <Box key={category}>
              {searchQuery.trim() && (
                <Box sx={{ px: 2, py: 1, bgcolor: 'background.neutral' }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {category}
                  </Typography>
                </Box>
              )}
              <List disablePadding>
                {items.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleItemClick(item.path)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Iconify icon={item.icon} width={24} sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={item.description}
                        primaryTypographyProps={{
                          variant: 'subtitle2',
                          fontWeight: 600,
                        }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                          noWrap: true,
                        }}
                      />
                      {!searchQuery.trim() && (
                        <Chip
                          label={item.category}
                          size="small"
                          variant="soft"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {Object.keys(groupedResults).length > 1 && 
               category !== Object.keys(groupedResults)[Object.keys(groupedResults).length - 1] && (
                <Divider />
              )}
            </Box>
          ))}

          {searchResults.length === 0 && searchQuery.trim() && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Iconify icon="eva:search-fill" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No results found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Try searching with different keywords or browse our help sections
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderTop: `solid 1px ${theme.palette.divider}` }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Press <strong>Ctrl+K</strong> or <strong>⌘K</strong> to search from anywhere
          </Typography>
        </Box>
      </Dialog>
    </>
  );
}

