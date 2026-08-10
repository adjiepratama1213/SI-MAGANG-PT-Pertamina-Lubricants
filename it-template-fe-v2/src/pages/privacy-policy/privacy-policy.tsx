import { Helmet } from 'react-helmet-async';
import TermsAndConditionsView from 'src/components/privacy-policy/privacy-view';
// sections

// ----------------------------------------------------------------------

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title> Privacy us</title>
      </Helmet>

      <TermsAndConditionsView />
    </>
  );
}
