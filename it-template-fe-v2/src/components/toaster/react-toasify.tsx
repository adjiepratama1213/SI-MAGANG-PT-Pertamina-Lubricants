import { ToastContainer } from 'react-toastify';
import { useSettingsContext } from '../settings';

export function Toaster() {
  const { themeMode, themeDirection } = useSettingsContext();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={themeDirection === 'rtl'}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={themeMode}
    />
  );
}

export default Toaster;
