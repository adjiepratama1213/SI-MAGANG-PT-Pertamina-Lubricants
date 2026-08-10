import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 8080,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'POST IT',
    description: 'POST Documentation Management Services',
    version: '1.0',
    path: 'docs',
  },
  security: {
    expiresIn: '1y',
    refreshIn: '1y',
    bcryptSaltOrRound: 10,
  },
  sessionGuard: {
    enabled: true,
    secret: 'h0tButton',
    resave: false,
    saveUninitialized: false,
  },
};

export default (): Config => config;
