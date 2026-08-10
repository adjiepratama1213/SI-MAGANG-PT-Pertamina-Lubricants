import type { Meta, StoryObj } from '@storybook/react';
import OTPForm from './otp-form';

const meta: Meta<typeof OTPForm> = {
  title: 'Components/MFA/OTPForm',
  component: OTPForm,
  tags: ['autodocs'],
  argTypes: {
    isSetup: { control: 'boolean' },
    mfaType: { control: 'select', options: ['authenticator', 'email', null] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OTPForm>;

const handleSubmit = async (code: string) => {
  console.log('Submit OTP:', code);
};

export const Validation: Story = {
  args: {
    submitHandler: handleSubmit,
    isSetup: false,
    mfaType: 'email',
  },
};

export const SetupAuthenticator: Story = {
  args: {
    submitHandler: handleSubmit,
    isSetup: true,
    mfaType: 'authenticator',
  },
};

export const WithError: Story = {
  args: {
    submitHandler: handleSubmit,
    error: 'Invalid code. Please try again.',
    isSetup: false,
  },
};
