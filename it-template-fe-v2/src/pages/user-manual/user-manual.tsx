import { Helmet } from 'react-helmet-async';
import UserManualHero from './user-manual-hero';
import UserManualView from './user-manual-view';

// ----------------------------------------------------------------------

export default function UserManualPage() {
  return (
    <>
      <Helmet>
        <title>User Manual - POST IT</title>
      </Helmet>

      <UserManualHero />

      <UserManualView />
    </>
  );
}

