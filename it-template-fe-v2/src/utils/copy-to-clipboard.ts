import { toast } from 'react-toastify';

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to Clipboard!', { hideProgressBar: true });
}
