import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CustomPopover from './custom-popover';

const meta: Meta<typeof CustomPopover> = {
  title: 'Components/Overlay/CustomPopover',
  component: CustomPopover,
  tags: ['autodocs'],
  argTypes: {
    arrow: { control: 'select', options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] },
    hiddenArrow: { control: 'boolean' },
  },
};

function PopoverDemo({ arrow = 'top-right' as const, hiddenArrow }: { arrow?: any; hiddenArrow?: boolean }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button variant="contained" onClick={(e) => setAnchorEl(e.currentTarget)}>
        Open popover
      </Button>
      <CustomPopover open={anchorEl} onClose={() => setAnchorEl(null)} arrow={arrow} hiddenArrow={hiddenArrow}>
        <List sx={{ p: 1 }}>
          <ListItemButton onClick={() => setAnchorEl(null)}>
            <ListItemText primary="Option 1" />
          </ListItemButton>
          <ListItemButton onClick={() => setAnchorEl(null)}>
            <ListItemText primary="Option 2" />
          </ListItemButton>
        </List>
      </CustomPopover>
    </>
  );
}

export default meta;

type Story = StoryObj<typeof CustomPopover>;

export const Default: Story = {
  render: () => <PopoverDemo />,
};

export const NoArrow: Story = {
  render: () => <PopoverDemo hiddenArrow />,
};
