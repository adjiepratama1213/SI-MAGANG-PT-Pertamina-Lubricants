import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import type { TLogoColor, TLogoOrientation } from '../ptpl';
import { PTPLLogo } from '../ptpl';
import { RouterLink } from '../router-link';
import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disabledLink?: boolean;
  opt?: TLogoOrientation;
  fillStyle?: TLogoColor;
};

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      width,
      href = '/',
      height,
      isSingle = true,
      disabledLink = false,
      className,
      sx,
      opt = 'horizontal',
      fillStyle,
      ...other
    },
    ref
  ) => {
    const singleLogo =
      opt === 'horizontal' ? (
        <PTPLLogo orientation="horizontal" fillStyle={fillStyle} />
      ) : (
        <PTPLLogo orientation="vertical" fillStyle={fillStyle} />
      );

    const fullLogo =
      opt === 'horizontal' ? (
        <PTPLLogo orientation="horizontal" fillStyle={fillStyle} />
      ) : (
        <PTPLLogo orientation="vertical" fillStyle={fillStyle} />
      );

    const baseSize = {
      width: width ?? 200,
      height: height ?? 40,
      ...(!isSingle && {
        width: width ?? 102,
        height: height ?? 36,
      }),
    };

    return (
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="Logo"
        sx={{
          ...baseSize,
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disabledLink && { pointerEvents: 'none' }),
          ...sx,
        }}
        {...other}
      >
        {isSingle ? singleLogo : fullLogo}
      </Box>
    );
  }
);

Logo.displayName = 'Logo';

export { Logo };
