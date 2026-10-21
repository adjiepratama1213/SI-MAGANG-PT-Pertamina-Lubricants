import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { memo, useCallback, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
import { useAuthContext } from 'src/auth/hooks';
import ResultItem from './result-item';
import { applyFilter, getAllItems, groupedData } from './utils';

// ----------------------------------------------------------------------

function Searchbar() {
  const theme = useTheme();

  const router = useRouter();

  const search = useBoolean();

  const lgUp = useResponsive('up', 'lg');

  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuthContext();

  const currentRole = user?.role || 'GUEST';

  const navData = useNavData();

  const roleName = useMemo(() => {
    switch (currentRole) {
      case 'PESERTA':
        return 'Peserta';
      case 'EMPLOYEESTAFF':
        return 'Mentor';
      case 'EMPLOYEE':
        return 'VP';
      default:
        return 'Admin';
    }
  }, [currentRole]);

  const searchPlaceholder = useMemo(() => {
    switch (currentRole) {
      case 'PESERTA':
        return 'Cari menu Peserta (Presensi, Laporan, Penilaian, Feedback)...';
      case 'EMPLOYEESTAFF':
        return 'Cari menu Mentor (Data Bimbingan, Presensi, Laporan, Reminder)...';
      case 'EMPLOYEE':
        return 'Cari menu VP (Approval Evaluasi)...';
      default:
        return 'Cari menu Admin (Peserta, Mentor, Presensi, Evaluasi)...';
    }
  }, [currentRole]);

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
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

  const allowedItems = useMemo(() => {
    const all = getAllItems({ data: navData });
    // Filter out invalid '#' paths
    return all.filter((item) => item.path && item.path !== '#');
  }, [navData]);

  const dataFiltered = applyFilter({
    inputData: allowedItems,
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
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          borderRadius: 8,
          px: 1.75,
          py: 0.85,
          minWidth: { sm: 260, md: 320, lg: 380, xl: 440 },
          justifyContent: 'space-between',
          '&:hover': { 
            bgcolor: alpha(theme.palette.grey[500], 0.14),
            borderColor: alpha(theme.palette.grey[500], 0.28),
          },
          transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
        }),
      }}
    >
      {lgUp ? (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.secondary' }} />
            <Box sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 500 }}>
              Cari menu...
            </Box>
          </Stack>
          <Label
            variant="soft"
            color="default"
            sx={{
              px: 0.75,
              py: 0.2,
              typography: 'caption',
              fontWeight: 700,
              fontSize: '0.65rem',
              color: 'text.secondary',
              borderRadius: 0.75,
              height: 20,
            }}
          >
            {isMac ? '⌘K' : 'Ctrl+K'}
          </Label>
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
        disableScrollLock
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
        <Box sx={{ p: 2.5, px: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Label
              variant="soft"
              color={
                currentRole === 'PESERTA'
                  ? 'info'
                  : currentRole === 'EMPLOYEESTAFF'
                  ? 'warning'
                  : currentRole === 'EMPLOYEE'
                  ? 'success'
                  : 'primary'
              }
              sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1, py: 0.5, borderRadius: 1 }}
            >
              Pencarian Khusus Role: {roleName}
            </Label>
            <Typography variant="caption" color="text.secondary">
              Navigasi Cepat
            </Typography>
          </Stack>

          <InputBase
            fullWidth
            autoFocus
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 1.5 }}>
                <Iconify icon="eva:search-fill" width={26} sx={{ color: 'primary.main' }} />
              </InputAdornment>
            }
            inputProps={{
              sx: { typography: 'subtitle1', fontSize: '1rem', fontWeight: 500 },
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
