// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/pages/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function TeamEditView({ id }: Props) {
  const settings = useSettingsContext();

  // const currentTeam = _teamList.find((team) => team.id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Team',
            href: paths.teamManagement.root,
          },
          // { name: currentTeam?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* <TeamNewEditForm currentTeam={currentTeam} /> */}
    </Container>
  );
}
