import { Helmet } from 'react-helmet-async';
import ViewMFAReset from './view';

export default function PageMFAReset() {
  return (
    <>
      <Helmet>
        <title>PTPL: MFA Reset</title>
      </Helmet>

      <ViewMFAReset />
    </>
  );
}
