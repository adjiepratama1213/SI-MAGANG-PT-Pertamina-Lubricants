import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import SplashScreen from './splash-screen';

const meta: Meta<typeof SplashScreen> = {
  title: 'Components/Feedback/SplashScreen',
  component: SplashScreen,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ position: 'relative', height: 400 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SplashScreen>;

export const Default: Story = {};
