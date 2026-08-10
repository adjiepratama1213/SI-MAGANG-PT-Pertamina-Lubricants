import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/hooks/use-params';
// sections
import UserEditView from './view/user-edit-view';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: User Edit</title>
      </Helmet>

      <UserEditView id={`${id}`} />
    </>
  );
}
