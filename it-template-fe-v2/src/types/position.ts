// ----------------------------------------------------------------------

import { ITeamItem } from './team';
import { IUserItem } from './user';

export type IPositionTableFilterValue = string | string[];

export type IPositionTableFilters = {
  name: string;
  role: string[];
  status: string;
};

export type IPositionItem = {
  id: string;

  createdAt: Date;
  updatedAt: Date;

  name: string;

  teamId: string;
  organizationId: string;
  organizationParentId: string;
  isChief: boolean;
  isHead: boolean;
  isOwner: boolean;
  isPublished: boolean;
  isSync: boolean;

  User: IUserItem;
  Organization: any;
  Team: ITeamItem;
};
