import { Helmet } from 'react-helmet-async';
import JwtRegisterView from './view';
// sections

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Register</title>
      </Helmet>

      <JwtRegisterView />
    </>
  );
}
