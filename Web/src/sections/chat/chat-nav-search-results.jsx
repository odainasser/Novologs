import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import { useTranslation } from 'react-i18next';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function ChatNavSearchResults({ query, results, onClickResult }) {
  const { t } = useTranslation('dashboard/chat');

  const totalResults = results.length;

  const notFound = !totalResults && !!query;

  const renderNotFound = (
    <SearchNotFound
      query={query}
      sx={{
        p: 3,
        mx: 'auto',
        width: `calc(100% - 40px)`,
        bgcolor: 'background.neutral',
      }}
    />
  );

  const renderResults = (
    <nav>
      <Box component="ul">
        {results.map((result) => {
          let displayName = 'Unknown';
          let avatarUrl = '';

          if (result.type === 'GROUP') {
            displayName = result.groupName || 'Unnamed Group';
            avatarUrl = result.groupName?.charAt(0).toUpperCase() || 'G';
          } else {
            const participant = result.participants?.[0];
            displayName = participant?.name || 'Unknown';
            avatarUrl = participant?.avatarUrl || '';
          }

          return (
            <Box key={result.id} component="li" sx={{ display: 'flex' }}>
              <ListItemButton
                onClick={() => onClickResult(result)}
                sx={{ gap: 2, py: 1.5, px: 2.5, typography: 'subtitle2' }}
              >
                <Avatar alt={displayName} src={avatarUrl} />
                {displayName}
              </ListItemButton>
            </Box>
          );
        })}
      </Box>
    </nav>
  );

  return (
    <>
      <Typography variant="h6" sx={{ px: 2.5, mb: 2 }}>
        {t('chat.contacts')} ({totalResults})
      </Typography>

      {notFound ? renderNotFound : renderResults}
    </>
  );
}
