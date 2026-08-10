// ----------------------------------------------------------------------

import { ITagItem } from './tag';

export type ISquadPostTableFilterValue = string;

export type ISquadPostTableFilters = {
  name: string;
  role: string[];
  status: string;
  teamId: string;
};

export type ISquadPostFilterValue = string;

export type ISquadPostFilters = {
  title: string;
  publish: string;
};

// ----------------------------------------------------------------------

export type ISquadPostHero = {
  title: string;
  link: string;
  coverUrl: string;
  createdAt?: Date;
  author?: {
    name: string;
    avatarUrl: string;
  };
};

export type ISquadPostComment = {
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

export type ISquadPostItem = {
  id: string;
  authorId: string;
  title: string;
  link: string;
  tags: ITagItem[];
  publish: string;
  isMicrosite: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  content: string;
  coverUrl: string;
  metaTitle: string;
  squadId?: string;
  totalViews: number;
  totalShares: number;
  description: string;
  totalComments: number;
  totalFavorites: number;
  metaKeywords: string[];
  metaDescription: string;
  comments: ISquadPostComment[];
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
