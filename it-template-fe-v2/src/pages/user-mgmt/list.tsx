import { Helmet } from 'react-helmet-async';
// sections
import UserListView from './view/user-list-view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserListView />
    </>
  );
}
