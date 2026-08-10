import { Helmet } from 'react-helmet-async';
import ViewMFAValidation from './view';
// sections

// ----------------------------------------------------------------------

export default function PageMFAValidation() {
  return (
    <>
      <Helmet>
        <title>PTPL: MFA Validation</title>
      </Helmet>

      <ViewMFAValidation />
    </>
  );
}
