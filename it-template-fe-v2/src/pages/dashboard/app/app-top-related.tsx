// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import TextMaxLine from 'src/components/text-max-line';

// ----------------------------------------------------------------------

type ItemProps = {
  id: string;
  name: string;
  tags: string[];
  system: string;
  shortcut: string;
  totalReviews: number;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  list: ItemProps[];
}

export default function AppTopRelated({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ px: 3, pb: 3, minWidth: 360 }}>
          {list.map((app) => (
            <ApplicationItem key={app.id} app={app} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ApplicationItemProps = {
  app: ItemProps;
};

function ApplicationItem({ app }: ApplicationItemProps) {
  const { shortcut, system, tags, totalReviews, name } = app;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          bgcolor: 'background.neutral',
        }}
      >
        <Box component="img" src={shortcut} sx={{ width: 24, height: 24 }} />
      </Avatar>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1}>
        <Typography variant="subtitle2" noWrap>
          {name}
        </Typography>
            <Link
              key={system}
              href={system}
              variant="caption"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              <Iconify icon="eva:external-link-fill" />
            </Link>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
          <Iconify
            width={14}
            icon={system === 'Mac' ? 'mingcute:apple-fill' : 'mingcute:windows-fill'}
          />

          <TextMaxLine variant="caption" line={1} persistent sx={{ ml: 0.5, mr: 1 }}>
            {system}
          </TextMaxLine>
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
          {tags.map((tag, index) => (
            <Label key={index} variant="outlined" color="info" sx={{ fontSize: 10 }}>
              {tag}
            </Label>
          ))}
        </Stack>
      </Box>

      <Stack alignItems="flex-end">
        <Typography variant="subtitle2" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {totalReviews}
        </Typography>
      </Stack>
    </Stack>
  );
}
