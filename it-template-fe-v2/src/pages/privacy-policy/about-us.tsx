import { Helmet } from 'react-helmet-async';
import AboutUsView from 'src/components/privacy-policy/about-us-view';
// sections

// ----------------------------------------------------------------------

export default function AboutUsPage() {
  return (
    <>
      <Helmet>
        <title>Tentang Kami - POST IT</title>
      </Helmet>

      <AboutUsView />
    </>
  );
}
