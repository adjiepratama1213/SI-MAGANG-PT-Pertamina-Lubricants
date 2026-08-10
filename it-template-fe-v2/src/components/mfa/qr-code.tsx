import { CopyAll } from '@mui/icons-material';
import { Button, Paper, Stack } from '@mui/material';
import Image from 'src/components/image';
import { copyToClipboard } from 'src/utils/copy-to-clipboard';

interface IQRCode {
  qr: string;
  secret: string;
}

export default function QRCode({ qr, secret }: IQRCode) {
  return (
    <Stack spacing={1}>
      <Paper elevation={8} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image src={qr} alt="" />
      </Paper>
      <Button
        onClick={() => {
          copyToClipboard(secret);
        }}
        endIcon={<CopyAll />}
        variant="contained"
      >
        {secret}
      </Button>
    </Stack>
  );
}
