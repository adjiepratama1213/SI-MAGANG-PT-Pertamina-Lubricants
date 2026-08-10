import { Helmet } from 'react-helmet-async';
import JwtVerificationView from './view';
// sections

// ----------------------------------------------------------------------

export default function VerificationPage() {
  return (
    <>
      <Helmet>
        <title> Verification</title>
      </Helmet>

      <JwtVerificationView />
    </>
  );
}
