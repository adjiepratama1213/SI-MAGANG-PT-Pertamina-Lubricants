import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type IUserTableFilterValue = string | string[];

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type IUserSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: IUserSocialLink;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IUserProfilePost = {
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

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  idamanId?: string;
  name: string;
  password?: string;
  teamId?: string;
  city?: string;
  role: string;
  email: string;
  state?: string;
  status: string;
  address?: string;
  country?: string;
  jobTitle?: string;
  zipCode?: string;
  company?: string;
  photoUrl?: string;
  phone?: string;
  phoneNumber?: string;
  positionId: string;
  isVerified: boolean;
  Position: {
    id: string;
    name: string;
    Team: {
      id: string;
      name: string;
    };
  };
  employeeProfile?: {
    id: string;
    employeeId: string | null;
    jabatan: string | null;
    direktorat: string | null;
    fungsi: string | null;
    subFungsi?: string | null;
    gender?: any;
  };
  internProfile?: {
    id: string;
    internId: string | null;
    university: string | null;
    gender: 'PRIA' | 'WANITA' | null;
    dateOfBirth: Date | string | null;
    major: string | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    program: string | null;
    documentUrls?: string[];
    mentorProfileId: string | null;
    mentor?: {
      id: string;
      user?: {
        name: string;
        email: string;
      };
    };
  };
};

export type IUserAccount = {
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

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type IUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
