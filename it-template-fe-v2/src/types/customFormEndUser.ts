import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type ICustomFormEndUserTableFilterValue = string | string[];

export type ICustomFormEndUserTableFilters = {
  id: string;
  dynamicFilters: any;
};

export interface ICustomFormEndUserField {
  id?: string;
  fieldName: string; // Name of the form field
  customFormId: string; // The ID associated with the custom form
  fieldType: 'text' | 'number' | 'dropdown'; // Type of the field (text, number, or dropdown)
  isRequired: boolean; // Whether the field is required or not
  options?: string; // Options for the dropdown field (if applicable), typically a JSON string
}

// ----------------------------------------------------------------------

export type ICustomFormEndUserSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type ICustomFormEndUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type ICustomFormEndUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ICustomFormEndUserSocialLink;
};

export type ICustomFormEndUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type ICustomFormEndUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type ICustomFormEndUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type ICustomFormEndUserProfilePost = {
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

export type ICustomFormEndUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type ICustomFormEndUserItem = {
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

export type ICustomFormEndUserAccount = {
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

export type ICustomFormEndUserAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type ICustomFormEndUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type CustomFormData = {
  id?: string;
  name: string;
  CustomFormFields: ICustomFormEndUserField[];
};

export type CustomFormProps = {
  currentCustomForm?: CustomFormData;
};