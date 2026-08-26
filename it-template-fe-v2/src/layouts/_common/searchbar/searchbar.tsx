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
import { useTheme } from '@mui/material/styles';
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
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          minWidth: 260,
          justifyContent: 'space-between',
          '&:hover': { bgcolor: 'action.selected' },
          transition: theme.transitions.create('background-color'),
        }),
      }}
    >
      {lgUp ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          <Box sx={{ typography: 'body2', color: 'text.disabled' }}>Cari halaman / menu...</Box>
        </Stack>
      ) : (
        <IconButton>
          <Iconify icon="eva:search-fill" />
        </IconButton>
      )}

      {lgUp && <Label sx={{ px: 0.75, fontSize: 12, color: 'text.secondary' }}>⌘K</Label>}
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
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
            inputProps={{
              sx: { typography: 'h6' },
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
