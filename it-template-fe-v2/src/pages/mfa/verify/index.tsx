import { Helmet } from 'react-helmet-async';
import ViewMFAVerify from './view';
// sections

// ----------------------------------------------------------------------

export default function PageMFAVerify() {
  return (
    <>
      <Helmet>
        <title>PTPL: MFA Verify</title>
      </Helmet>

      <ViewMFAVerify />
    </>
  );
}
