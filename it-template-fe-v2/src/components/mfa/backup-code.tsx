import { SaveAltOutlined, HomeOutlined } from '@mui/icons-material';
import { Alert, Button, Stack } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useRouter } from 'src/hooks/use-router';

interface IBackupCode {
  code: string;
  next: Function;
}
export default function BackupCode({ code, next }: IBackupCode) {
  const { user } = useAuthContext();
  const router = useRouter();

  const downloadTextAsFile = (text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `POST-IT-OTP-BackUpCode-${user?.name}-${user?.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    next();
  };

  const handleGoToHome = () => {
    router.push(PATH_AFTER_LOGIN);
  };

  return (
    <Stack spacing={2} sx={{ mt: 5 }}>
      <Alert severity="success">
        Register success! Save your backup code for reset the configuration latter!
      </Alert>

      <Button
        endIcon={<SaveAltOutlined />}
        onClick={() => {
          downloadTextAsFile(code);
        }}
        variant="contained"
        size="large"
      >
        {code}
      </Button>

      <Button
        startIcon={<HomeOutlined />}
        onClick={handleGoToHome}
        variant="outlined"
        size="large"
        fullWidth
      >
        Go to Home
      </Button>
    </Stack>
  );
}
