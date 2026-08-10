import { Helmet } from 'react-helmet-async';
import JwtLoginView from './view';
// sections

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login</title>
      </Helmet>

      <JwtLoginView />
    </>
  );
}
