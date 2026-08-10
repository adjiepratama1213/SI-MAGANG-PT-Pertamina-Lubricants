// ----------------------------------------------------------------------

import { ITagItem } from './tag';
import { ITeamItem } from './team';

export type IPostTableFilterValue = string;

export type IPostTableFilters = {
  name: string;
  role: string[];
  status: string;
  teamId: string;
};

export type IPostFilterValue = string;

export type IPostFilters = {
  title: string;
  publish: string;
};

// ----------------------------------------------------------------------

export type IPostHero = {
  title: string;
  link: string;
  coverUrl: string;
  createdAt?: Date;
  author?: {
    name: string;
    avatarUrl: string;
  };
};

export type IPostComment = {
  id: string;
  name: string;
  avatarUrl: string;
  message: string;
  postedAt: Date;
  users: {
    id: string;
    name: string;
    avatarUrl: string;
  }[];
  replyComment: {
    id: string;
    userId: string;
    message: string;
    postedAt: Date;
    tagUser?: string;
  }[];
};

export type IPostItem = {
  id: string;
  authorId: string;
  title: string;
  link: string;
  teamIds?: ITeamItem[];
  tags: ITagItem[];
  publish: string;
  isMicrosite: boolean;
  isFeatured: boolean;
  content: string;
  coverUrl: string;
  metaTitle: string;
  teamId?: string;
  totalViews: number;
  totalShares: number;
  description: string;
  totalComments: number;
  totalFavorites: number;
  metaKeywords: string[];
  metaDescription: string;
  comments: IPostComment[];
  createdAt: Date;
  favoritePerson: {
    name: string;
    avatarUrl: string;
  }[];
  Author?: {
    name: string;
    avatarUrl: string;
    Position: {
      Team: {
        name: string;
      };
    };
  };
  author?: {
    name: string;
    avatarUrl: string;
    Position: {
      Team: {
        name: string;
      };
    };
  };
};
