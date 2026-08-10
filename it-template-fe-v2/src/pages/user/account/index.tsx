import { Helmet } from 'react-helmet-async';
import AccountView from './view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title> User: Account Settings</title>
      </Helmet>

      <AccountView />
    </>
  );
}
