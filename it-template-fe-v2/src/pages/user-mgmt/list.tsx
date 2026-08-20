import { Helmet } from 'react-helmet-async';
// sections
import UserListView from './view/user-list-view';

// ----------------------------------------------------------------------

type Props = {
  defaultRole?: string;
};

export default function UserListPage({ defaultRole }: Props) {
  return (
    <>
      <Helmet>
        <title> Dashboard: User Management</title>
      </Helmet>

      <UserListView defaultRole={defaultRole} />
    </>
  );
}
