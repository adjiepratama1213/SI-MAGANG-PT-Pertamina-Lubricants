export type TPTPLDesainColor = {
  red: string;
  green: string;
  blue: string;
  black: string;
};

export type TPTPLDesainLogoColorComponent = {
  shapeRed: string;
  shapeGreen: string;
  shapeBlue: string;
  textPertamina: string;
  textLubricants: string;
};

export const colorRGB: TPTPLDesainColor = {
  red: "rgb(186, 49, 59)",
  green: "rgb(173, 197, 45)",
  blue: "rgb(60, 109, 178)",
  black: "rgb(16, 20, 16)",
};

export const LogoColorRGB: TPTPLDesainLogoColorComponent = {
  shapeRed: colorRGB.red,
  shapeGreen: colorRGB.green,
  shapeBlue: colorRGB.blue,
  textPertamina: colorRGB.black,
  textLubricants: colorRGB.red,
};
