import { Helmet } from 'react-helmet-async';
import ForgotPasswordView from './view';
// sections

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Lupa Kata Sandi - Portal Magang PT Pertamina Lubricants</title>
      </Helmet>

      <ForgotPasswordView />
    </>
  );
}
