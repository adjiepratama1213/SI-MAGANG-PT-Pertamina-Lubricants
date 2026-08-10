import { Helmet } from 'react-helmet-async';
// sections
import TeamListView from './view/team-list-view';

// ----------------------------------------------------------------------

export default function TeamListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Team List</title>
      </Helmet>

      <TeamListView />
    </>
  );
}
