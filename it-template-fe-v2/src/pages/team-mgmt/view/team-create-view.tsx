// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/pages/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import TeamNewEditForm from '../molecules/team-new-edit-form';

// ----------------------------------------------------------------------

export default function TeamCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new team"
        links={[
          {
            name: 'Team',
            href: paths.teamManagement.root,
          },
          { name: 'New team' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TeamNewEditForm />
    </Container>
  );
}
