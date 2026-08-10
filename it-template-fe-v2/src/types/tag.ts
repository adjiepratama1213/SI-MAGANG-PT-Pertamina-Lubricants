import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type ITagTableFilterValue = string | string[];

export type ITagTableFilters = {
  id: string;
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type ITagSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type ITagProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type ITagProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ITagSocialLink;
};

export type ITagProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type ITagProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type ITagProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type ITagProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: Date;
  personLikes: {
    name: string;
    avatarUrl: string;
  }[];
  comments: {
    id: string;
    message: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  }[];
};

export type ITagCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type ITagItem = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

export type ITagAccount = {
  email: string;
  isPublic: boolean;
  displayName: string;
  city: string | null;
  state: string | null;
  about: string | null;
  country: string | null;
  address: string | null;
  zipCode: string | null;
  phoneNumber: string | null;
  photoUrl: CustomFile | string | null;
};

export type ITagAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type ITagAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
