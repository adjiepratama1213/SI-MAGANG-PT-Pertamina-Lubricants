import { Helmet } from 'react-helmet-async';
import AccountView from './view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Profil Saya | SI-Magang</title>
      </Helmet>

      <AccountView />
    </>
  );
}
