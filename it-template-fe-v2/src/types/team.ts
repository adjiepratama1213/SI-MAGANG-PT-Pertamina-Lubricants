import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type ITeamTableFilterValue = string | string[];

export type ITeamTableFilters = {
  id: string;
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type ITeamSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type ITeamProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type ITeamProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ITeamSocialLink;
};

export type ITeamProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type ITeamProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type ITeamProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type ITeamProfilePost = {
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

export type ITeamCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type ITeamItem = {
  id: string;
  name: string;
  city: string;
  role: string;
  email: string;
  state: string;
  status: string;
  address: string;
  country: string;
  zipCode: string;
  company: string;
  avatarUrl: string;
  phoneNumber: string;
  positionId: string;
  isVerified: boolean;
  positions: {
    id: string;
    name: string;
    User: {
      name: string;
    }[]
    Team: {
      id: string;
    }
    isHead: boolean;
  }[];
  teams: [any];
};

export type ITeamAccount = {
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

export type ITeamAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type ITeamAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
