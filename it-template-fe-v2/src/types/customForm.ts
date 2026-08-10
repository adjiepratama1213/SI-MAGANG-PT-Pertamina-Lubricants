import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type ICustomFormTableFilterValue = string | string[];

export type ICustomFormTableFilters = {
  id: string;
  name: string;
  role: string[];
  status: string;
};

export interface ICustomFormField {
  id?: string;
  fieldName: string; // Name of the form field
  customFormId: string; // The ID associated with the custom form
  fieldType: 'text' | 'number' | 'int' | 'dropdown'; // Type of the field (text, number, or dropdown)
  isRequired: boolean; // Whether the field is required or not
  options?: any; // Options for the dropdown field (if applicable), typically a JSON string
  sortNo?: number;
}

// ----------------------------------------------------------------------

export type ICustomFormSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type ICustomFormProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type ICustomFormProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ICustomFormSocialLink;
};

export type ICustomFormProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type ICustomFormProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type ICustomFormProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type ICustomFormProfilePost = {
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

export type ICustomFormCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

// ===== Question =====
export type IQuestionLogic = {
  showIf?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'is_empty' | 'is_not_empty';
    value?: string | string[] | number;
  };
  skipTo?: string; // ID question untuk skip
};

export type IQuestion = {
  id: string;
  type: "text" | "multiple_choice" | "checkbox" | "rating" | "TEXT" | "TEXTAREA" | "RADIO" | "CHECKBOX" | "MULTI_CHECKBOX" | "DROPDOWN" | "MULTI_DROPDOWN" | "RATING" | "SCALE" | "DATE" | "TIME" | "FILE";
  label: string;
  options?: string[] | { label: string; value: string }[];   // untuk pilihan ganda
  required: boolean;
  order: number;
  validation?: Record<string, any>;
  logic?: IQuestionLogic; // Conditional logic rules
};

// ===== Form =====
export type ICustomFormItem = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  _count?: {
    questions?: number;
    responses?: number;
  }
  isActive: boolean; // derived → !expiresAt && (masih valid)
  owner: IUser;     // owner

  questions: IQuestion[];

  // setting tambahan
  requireLogin: boolean;
  requireUniqueEmail: boolean;
  allowMultiple: boolean;
  expiresAt?: string; // ISO date
  coverLink?: string;
  settings?: {
    theme?: {
      primaryColor?: string;
      fontFamily?: string;
      layoutStyle?: string;
    };
    redirectUrl?: string;
    thankYouMessage?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

// ===== Response =====
export type IResponse = {
  id: string;
  formId: string;
  user?: IUser | null; // null = anonymous
  answers: Record<string, any>; // { q1: "Budi", q2: 5, q3: ["A", "B"] }

  // metadata
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  geo?: {
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
  };

  createdAt: string; // ISO date
};

export type ICustomFormAccount = {
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

export type ICustomFormAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type ICustomFormAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type CustomFormData = {
  id?: string;
  name: string;
  description?: string;
  CustomFormFields: ICustomFormField[];
};

export type CustomFormProps = {
  currentCustomForm?: CustomFormData;
};