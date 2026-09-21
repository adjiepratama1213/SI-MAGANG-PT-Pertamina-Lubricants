import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { memo, useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import SearchNotFound from 'src/components/search-not-found';
import { useRouter } from 'src/hooks/use-router';
//
import { useNavData } from 'src/pages/dashboard/layout/config-navigation';
import ResultItem from './result-item';
import { applyFilter, getAllItems, groupedData } from './utils';

// ----------------------------------------------------------------------

function Searchbar() {
  const theme = useTheme();

  const router = useRouter();

  const search = useBoolean();

  const lgUp = useResponsive('up', 'lg');

  const [searchQuery, setSearchQuery] = useState('');

  const navData = useNavData();

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'k' && event.metaKey) {
      search.onToggle();
      setSearchQuery('');
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleClick = useCallback(
    (path: string) => {
      if (path.includes('http')) {
        window.open(path);
      } else {
        router.push(path);
      }
      handleClose();
    },
    [handleClose, router]
  );

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const dataFiltered = applyFilter({
    inputData: getAllItems({ data: navData }),
    query: searchQuery,
  });

  // Ensure dataFiltered is an array
  const notFound = searchQuery && (!Array.isArray(dataFiltered) || !dataFiltered.length);
  
  const renderItems = () => {
    const data = groupedData(dataFiltered);
  
    return Object.keys(data)
      .sort((a, b) => -b.localeCompare(a))
      .map((group, index) => (
        <List key={group || index} disablePadding>
          {data[group]?.map((item, itemIndex) => {
            const { title, path } = item;
  
            // Safely use title and path with fallback empty string if they are undefined or null
            const partsTitle = parse(title || '', match(title || '', searchQuery || ''));
            const partsPath = parse(path || '', match(path || '', searchQuery || ''));
  
            // Use a more reliable unique key by combining `title`, `path`, and `itemIndex`
            const key = `${title || ''}-${path || ''}-${itemIndex}`;
  
            return (
              <ResultItem
                path={partsPath}
                title={partsTitle}
                key={key}  // Ensure the key is unique
                groupLabel={searchQuery && group}
                onClickItem={() => handleClick(path)}
              />
            );
          })}
        </List>
      ));
  };  
  
  const renderButton = (
    <Stack
      direction="row"
      alignItems="center"
      onClick={search.onTrue}
      sx={{
        cursor: 'pointer',
        ...(lgUp && {
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          border: `1px solid transparent`,
          borderRadius: 8,
          px: 2.5,
          py: 1.25,
          minWidth: 320,
          justifyContent: 'flex-start',
          '&:hover': { 
            bgcolor: alpha(theme.palette.grey[500], 0.16),
            borderColor: alpha(theme.palette.grey[500], 0.24),
          },
          transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
        }),
      }}
    >
      {lgUp ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} />
          <Box sx={{ typography: 'body1', color: 'text.secondary', fontWeight: 500 }}>Cari halaman / menu...</Box>
        </Stack>
      ) : (
        <IconButton>
          <Iconify icon="eva:search-fill" />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <>
      {renderButton}

      <Dialog
        fullWidth
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            mt: 15,
            overflow: 'unset',
          },
        }}
        sx={{
          [`& .${dialogClasses.container}`]: {
            alignItems: 'flex-start',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="Ketik untuk mencari..."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2 }}>
                <Iconify icon="eva:search-fill" width={28} sx={{ color: 'primary.main' }} />
              </InputAdornment>
            }
            inputProps={{
              sx: { typography: 'h5' },
            }}
          />
        </Box>

        <Scrollbar sx={{ p: 3, pt: 2, height: 400 }}>
          {notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderItems()}
        </Scrollbar>
      </Dialog>
    </>
  );
}

export default memo(Searchbar);
