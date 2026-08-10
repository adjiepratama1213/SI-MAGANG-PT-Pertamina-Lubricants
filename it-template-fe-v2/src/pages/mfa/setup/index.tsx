import { Helmet } from 'react-helmet-async';
import { ViewMFASetup } from './view';
// sections

// ----------------------------------------------------------------------

export default function PageMFASetup() {
  return (
    <>
      <Helmet>
        <title>PTPL: MFA Setup</title>
      </Helmet>

      <ViewMFASetup />
    </>
  );
}
