import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/hooks/use-params';
// sections
import TeamEditView from './view/team-edit-view';

// ----------------------------------------------------------------------

export default function TeamEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Team Edit</title>
      </Helmet>

      <TeamEditView id={`${id}`} />
    </>
  );
}
