import { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import { ClockRunning } from '../clock';

type BrowserInfo = {
  browser: string;
  version: string;
  os: string;
  device: string;
  timezone: string;
  userAgent: string;
};

const getBrowserInfo = (): BrowserInfo => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';

  if (/chrome|crios|crmo/i.test(ua)) {
    browser = 'Chrome';
    version = ua.match(/(?:chrome|crios|crmo)\/(\d+)/i)?.[1] || version;
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
    version = ua.match(/(?:firefox|fxios)\/(\d+)/i)?.[1] || version;
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Safari';
    version = ua.match(/version\/(\d+)/i)?.[1] || version;
  } else if (/edg/i.test(ua)) {
    browser = 'Edge';
    version = ua.match(/edg\/(\d+)/i)?.[1] || version;
  }

  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const device = /mobile|iphone|ipad|android/i.test(ua) ? 'Mobile / Tablet' : 'Desktop';

  return { browser, version, os, device, timezone, userAgent: ua };
};

export default function UserDeviceInfo() {
  const [info, setInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    setInfo(getBrowserInfo());
  }, []);

  if (!info) return null;

  return (
    <Box width="100%" display="flex" justifyContent="flex-end" mb={1}>
      <Box display="flex" gap={1} overflow="auto">
        <Chip
          label={`🌐 ${info.browser} v${info.version}`}
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.2)', // soft blue
            color: 'rgba(25, 118, 210, 0.8)',
          }}
        />
        <Chip
          label={`💻 ${info.os}`}
          sx={{
            backgroundColor: 'rgba(56, 142, 60, 0.2)', // soft green
            color: 'rgba(56, 142, 60, 0.8)',
          }}
        />
        <Chip
          label={`📐 ${info.device}`}
          sx={{
            backgroundColor: 'rgba(123, 31, 162, 0.2)', // soft purple
            color: 'rgba(123, 31, 162, 0.8)',
          }}
        />
        <Chip
          label={`📝 ${info.userAgent}`}
          sx={{
            maxWidth: 500,
            backgroundColor: 'rgba(100, 100, 100, 0.1)', // soft gray
            color: 'rgba(50, 50, 50, 0.8)',
          }}
          title={info.userAgent}
        />
        <Chip
          label={`🧭 ${info.timezone}`}
          sx={{
            backgroundColor: 'rgba(237, 108, 2, 0.2)', // soft orange
            color: 'rgba(237, 108, 2, 0.8)',
          }}
        />
        <Chip
          label={
          <ClockRunning size="small" />}
          sx={{
            maxWidth: 500,
            backgroundColor: 'rgba(56, 142, 60, 0.2)', // soft green
            color: 'rgba(56, 142, 60, 0.8)',
          }}
          title={info.userAgent}
        />
      </Box>
    </Box>
  );
}
