// --------------------------------------

export type ISquadTableFilterValue = string;

export type ISquadTableFilters = {
  name: string;
  role: string[];
  status: string;
  teamId: string;
};

export type ISquadFilterValue = string;

export type ISquadFilters = {
  title: string;
  publish: string;
};

// ----------------------------------------------------------------------

export type ISquadHero = {
  title: string;
  link: string;
  coverUrl: string;
  createdAt?: Date;
  author?: {
    name: string;
    avatarUrl: string;
  };
};

export type ISquadComment = {
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

export type ISquadItem = {
  id: string;
  selfUrl?: string;
  name: string;
  description: string;
  imageUrl?: string;
  isPublic: boolean;
  backgroundImageUrl?: string;
  createdAt?: string;
  owner?: {
    id: string;
    name: string;
    avatarUrl: string;
    Position: {
      Team: {
        name: string;
      };
    };
  };

  members?: Array<{
    user: {
      id: string;
      name: string;
      photoUrl?: string;
      jobTitle?: string;
      email?: string;
    };
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt?: string;
  }>;
};

export type ISquadMember = {
  id: string; // id dari member record (SquadMemberEntity)
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt?: string;
  user: any;
};

export type ISquadProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  pathEditLink?: string;
  owner?: any;
  createdAt?: string;
};
