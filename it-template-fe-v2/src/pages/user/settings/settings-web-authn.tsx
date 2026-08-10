import { useForm } from 'react-hook-form';
import { useRouter } from 'src/hooks/use-router';
import { useAuthContext } from 'src/auth/hooks';
// @mui
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import { toast } from 'react-toastify';
import { endpoints } from 'src/utils/endpoints';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { Box, Button } from '@mui/material';
import { useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import axiosInstance from 'src/utils/axios';
import SettingWebAuthnStep from './settings-web-authn-step';

// ----------------------------------------------------------------------

type SharableId = {
  id: string;
};

type Props = {
  sharableIds: SharableId[];
};

export default function SettingWebAuthn({ sharableIds }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const { user } = useAuthContext();

  const handleCopy = () => {
    if (inputRef.current) {
      const text = inputRef.current.value;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedText(text);
          setOpen(true);
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
        });
    }
  };
  const defaultValues =
    sharableIds.length > 0 ? { webAuthnId: sharableIds[0].id } : { webAuthnId: '' };

  const methods = useForm({
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.patch(`${endpoints.user.editWebAuthn(user?.id)}`, data);
      toast('Update Webauth Code Success!');

      setTimeout(() => {
        router.reload(); // refresh the page after a delay
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        {sharableIds.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 1 }}>
            <LoadingButton
              type="submit"
              startIcon={<Iconify icon="solar:refresh-line-duotone" />}
              variant="outlined"
              loading={isSubmitting}
              sx={{ ml: 'auto', px: '1.5rem', borderColor: 'red', color: 'red' }}
            >
              Replace
            </LoadingButton>
            <RHFTextField
              inputRef={inputRef}
              key={item.id}
              name="webAuthnId"
              label="WebAuthn Code"
              disabled
              sx={{ cursor: 'pointer' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify width={24} icon="eva:checkmark-circle-2-fill" color="#00A66E" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              color="success"
              onClick={handleCopy}
              sx={{ px: 1 }}
              startIcon={<Iconify icon="solar:copy-linear" />}
            >
              Copy
            </Button>
            {/* <Button
              color="error"
              // onClick={onResetFilters}
              sx={{ px: 1 }}
              startIcon={<Iconify icon="eva:trash-2-outline" />}
            >
              Remove
            </Button> */}
          </Box>
        ))}

        <SettingWebAuthnStep />

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>POST WebAuthn</DialogTitle>
          <DialogContent>
            <Typography>
              You&apos;ve copied the code, please open new tab and paste the code: {copiedText}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </FormProvider>
  );
}
