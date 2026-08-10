import { Helmet } from 'react-helmet-async';
import ForgotPasswordView from './view';
// sections

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>

      <ForgotPasswordView />
    </>
  );
}
