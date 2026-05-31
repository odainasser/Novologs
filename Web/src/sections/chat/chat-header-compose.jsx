import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function ChatHeaderCompose({ contacts, onAddRecipients }) {
  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');

  const [searchRecipients, setSearchRecipients] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [groupName, setGroupName] = useState('');

  const handleAddRecipients = useCallback(
    (selected) => {
      setSearchRecipients('');
      setSelectedRecipients(selected);
      onAddRecipients(selected, groupName);
    },
    [onAddRecipients, groupName]
  );

  const handleGroupNameChange = (event) => {
    const newGroupName = event.target.value;
    setGroupName(newGroupName);

    onAddRecipients(selectedRecipients, newGroupName);
  };

  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{
          color: 'text.primary',
          mr: 2,
          ...(storedLang === 'ar' && { ml: 1 }),
        }}
      >
        {t('chat.to')}
      </Typography>

      <Autocomplete
        sx={{
          minWidth: { md: 320 },
          flexGrow: { xs: 1, md: 'unset' },
          '& .MuiInputBase-root': {
            minHeight: 40,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            paddingTop: '4px',
            paddingBottom: '4px',
          },
          '& .MuiChip-root': {
            margin: '2px',
          },
        }}
        multiple
        limitTags={3}
        popupIcon={null}
        defaultValue={[]}
        disableCloseOnSelect
        noOptionsText={<SearchNotFound query={searchRecipients} />}
        onChange={(event, newValue) => handleAddRecipients(newValue)}
        onInputChange={(event, newValue) => setSearchRecipients(newValue)}
        options={contacts}
        getOptionLabel={(recipient) => recipient.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t('chat.recipients')}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                padding: 0,
              },
              '& .MuiAutocomplete-input': {
                padding: '4px 8px !important',
              },
              '& .MuiInputBase-input': {
                padding: '4px 8px !important',
              },
            }}
          />
        )}
        renderOption={(props, recipient, { selected }) => (
          <li {...props} key={recipient.id}>
            <Box
              sx={{
                mr: 1,
                width: 28,
                height: 28,
                overflow: 'hidden',
                borderRadius: '50%',
                position: 'relative',
              }}
            >
              <Avatar alt={recipient.name} src={recipient.avatarUrl} sx={{ width: 1, height: 1 }} />
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  top: 0,
                  left: 0,
                  width: 1,
                  height: 1,
                  opacity: 0,
                  position: 'absolute',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.8),
                  transition: (theme) =>
                    theme.transitions.create(['opacity'], {
                      easing: theme.transitions.easing.easeInOut,
                      duration: theme.transitions.duration.shorter,
                    }),
                  ...(selected && { opacity: 1, color: 'primary.main' }),
                }}
              >
                <Iconify icon="eva:checkmark-fill" />
              </Stack>
            </Box>
            {recipient.name}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((recipient, index) => (
            <Chip
              {...getTagProps({ index })}
              key={recipient.id}
              label={recipient.name}
              avatar={<Avatar alt={recipient.name} src={recipient.avatarUrl} />}
              size="small"
              variant="soft"
              sx={{
                ...(storedLang === 'ar' && { p: 1.5 }),
              }}
            />
          ))
        }
      />
      {selectedRecipients.length <= 1 && (
        <Typography variant="subtitle2" color="#006A67" sx={{ mt: 0.5, ml: 1 }}>
          Select more than one member to create a channel
        </Typography>
      )}
      {selectedRecipients.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 4,
            minWidth: { md: 320 },
            flexGrow: { xs: 1, md: 'unset' },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.primary',
              mr: 1,
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Channel:
          </Typography>
          <TextField
            fullWidth
            value={groupName}
            onChange={handleGroupNameChange}
            placeholder="Channel Name"
            sx={{
              '& .MuiOutlinedInput-root': {
                padding: 0,
              },
              '& .MuiAutocomplete-input': {
                padding: '8px 8px !important',
              },
              '& .MuiInputBase-input': {
                padding: '8px 8px !important',
              },
            }}
          />
        </Box>
      )}
    </>
  );
}
