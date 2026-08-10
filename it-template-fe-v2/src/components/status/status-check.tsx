/* eslint-disable react/prop-types */
/// 0:drafted, 1:passed, 2:rejected, 3:pending

import { Chip } from '@mui/material';

export default function CheckStatus({ status }: { status: number }) {
  if (!status) return null;
  const props: {
    label: string;
    color?: any;
  } = { label: '', color: null };

  switch (status) {
    case 1:
      props.label = 'PASSED';
      props.color = 'success';
      break;
    case 2:
      props.label = 'REJECTED';
      props.color = 'error';
      break;
    case 3:
      props.label = 'PENDING';
      props.color = 'warning';
      break;
    default:
      props.label = 'DRAFTED';
      props.color = 'info';
      break;
  }

  return <Chip label={props?.label} color={props?.color} variant="soft" />;
}
