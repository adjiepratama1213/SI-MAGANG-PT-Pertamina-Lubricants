import { Helmet } from 'react-helmet-async';
// sections
import TeamCreateView from './view/team-create-view';

// ----------------------------------------------------------------------

export default function TeamCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new team</title>
      </Helmet>

      <TeamCreateView />
    </>
  );
}
