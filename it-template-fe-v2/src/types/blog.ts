// ----------------------------------------------------------------------

import { ITagItem } from "./tag";

export type IBlogTableFilterValue = string;

export type IBlogTableFilters = {
  name: string;
  role: string[];
  status: string;
  content: string;
  publish: string;
};

export type IBlogFilterValue = string;

export type IBlogFilters = {
  name: string;
  role: string[];
  status: string;
  publish: string;
};

// ----------------------------------------------------------------------

export type IBlogHero = {
  title: string;
  link: string;
  coverUrl: string;
  createdAt?: Date;
  author?: {
    name: string;
    avatarUrl: string;
  };
};

export type IBlogComment = {
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

export type IBlogItem = {
  id: string;
  title: string;
  link: string;
  tags: ITagItem[];
  publish: string;
  isMicrosite: boolean;
  isFeatured: boolean;
  hasSensitiveContent: boolean;
  content: string;
  coverUrl: string;
  metaTitle: string;
  totalViews: number;
  totalShares: number;
  description: string;
  totalComments: number;
  totalFavorites: number;
  metaKeywords: string[];
  metaDescription: string;
  comments: IBlogComment[];
  createdAt: Date;
  favoritePerson: {
    name: string;
    avatarUrl: string;
  }[];
  Author: {
    name: string;
    avatarUrl: string;
  };
  BlogUploadedItem?: IBlogUploadItem;
  blogUploadedId?: string;
};

export type IBlogUploadItem = {
  id: string;
  name: string;
  tags: ITagItem[];
  publish: string;
  uploadedFile: string;
  isMicrosite: boolean;
  isFeatured: boolean;
  hasSensitiveContent: boolean;
  metaKeywords: string[];
  BlogItem: IBlogItem[];
  _count: {
    BlogItem: number;
  };
  metaDescription: string;
  createdAt: Date;
  Author: {
    name: string;
    avatarUrl: string;
  };
};
