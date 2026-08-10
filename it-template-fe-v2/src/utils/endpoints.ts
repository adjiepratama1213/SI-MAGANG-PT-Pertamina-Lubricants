export const endpoints = {
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    qrCreate: '/auth/qr/create',
    qrVerify: '/auth/qr/verify',
    qrStatus: '/auth/qr/status',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    loginWebAuthn: '/auth/webauthn',
    updatePassword: '/auth/change-password',
  },

  chat: {
    list: '/post-generative-ai',
    search: '/post-generative-ai/search',
    viaForm: '/post-generative-ai/via-form',
  },

  user: {
    list: '/user',
    managerCheck: (email: string) => `/user/manager-team-check/${email}`,
    search: '/user/search',
    syncIdaman: '/user/sync-idaman',
    updatePassword: '/user/change-password-by-admin',
    details: (id: string) => `/user/${id}`,
    edit: (id: string) => `/user/${id}`,
    editWebAuthn: (id: string) => `/user/edit-webauthn/${id}`,
  },

  mfa: {
    generate: '/mfa/generate',
    verify: '/mfa/verify',
    validate: '/mfa/validate',
    ready: '/mfa/ready',
    reset: '/mfa/reset',
    remove: '/mfa/remove',
    sendOtpEmail: '/mfa/send-otp-email',
  },

  dashboard: {
    postClicks: (id: string) => `/dashboard/post-clicks/${id}`,
    postByAuthor: (id: string) => `/dashboard/post-by-author/${id}`,
    postConversion: (id: string) => `/dashboard/post-click-conversion/${id}`,
    postActiveMembers: (id: string) => `/dashboard/post-by-active-members/${id}`,
    postClicksByAuthor: (id: string) => `/dashboard/post-clicks-by-author/${id}`,
    postClicksYearly: (id: string) => `/dashboard/post-clicks-yearly/${id}`,
    userClicksYearly: (id: string) => `/dashboard/user-clicks-yearly/${id}`,
  },
  gcpItem: {
    financeExecutiveSummary: () => `/gcp-item/finance-executive-summary`,
  },
  news: {
    list: (limit: number, keyword: string) => `/news/${limit}/${keyword}`,
  },

  position: {
    list: '/position',
    search: '/position/search',
    syncIdaman: '/position/sync-idaman',
    details: (id: string) => `/position/${id}`,
  },

  tag: {
    list: '/tag',
    search: '/tag/search',
    request: '/tag',
    syncIdaman: '/tag/sync-idaman',
    realization: '/tag-real',
  },

  customForm: {
    list: '/custom-form',
    search: '/custom-form/search',
    request: '/custom-form',
    realization: '/custom-form-real',
    answer: '/custom-form/answer',
    submitted: '/custom-form/answer-submitted',
    responses: '/custom-form/check-list-answer',
    upload: '/custom-form/upload',
    uploadAnswerFile: '/custom-form/upload-answer-file',
    addCollaborator: (id: string) => `/custom-form/${id}/collaborators`,
    removeCollaborator: (id: string, userId: string) => `/custom-form/${id}/collaborators/${userId}`,
    aiInsights: (id: string) => `/custom-form/${id}/ai-insights`,
  },

  customFormEndUser: {
    list: '/custom-form-end-user',
    search: '/custom-form-end-user/search',
    request: '/custom-form-end-user/create',
    edit: '/custom-form-end-user/edit',
  },

  team: {
    list: '/team',
    search: '/team/search',
    searchWithUser: '/team/search-with-user',
    request: '/team-request',
    syncIdaman: '/team/sync-idaman',
    realization: '/team-real',
  },

  squad: {
    list: '/squad',
    search: '/squad/search',
    request: '/squad',
    join: (id: number) => `/squad/${id}/join`,
    updateRoleMember: (id: string) => `/squad/${id}/update-member-role`,
  },

  squadPost: {
    list: '/squad-post-item',
    search: '/squad-post-item/search',
    searchTeams: '/squad-post-item/search-teams',
    searchSubordinate: '/squad-post-item/search-subordinate',
    featured: '/squad-post-item/search-featured',
    upload: '/squad-post-item/upload',
    request: '/squad-post-item',
    generativeAi: '/squad-post-item/generative-ai',
    realization: '/squad-post-item-real',
    latest: '/squad-post-item/latest',
    clickTracking: '/squad-post-item/click-tracking',
    generateCoverUrls: '/squad-post-item/generate-cover-urls-with-signature',
  },

  post: {
    list: '/post-item',
    search: '/post-item/search',
    searchTeams: '/post-item/search-teams',
    searchSubordinate: '/post-item/search-subordinate',
    featured: '/post-item/search-featured',
    upload: '/post-item/upload',
    request: '/post-item',
    generativeAi: '/post-item/generative-ai',
    realization: '/post-item-real',
    latest: '/post-item/latest',
    clickTracking: '/post-item/click-tracking',
    generateCoverUrls: '/post-item/generate-cover-urls-with-signature',
  },

  blog: {
    list: '/blog-item',
    search: '/blog-item/search',
    searchSubordinate: '/blog-item/search-subordinate',
    featured: '/blog-item/search-featured',
    upload: '/blog-item/upload',
    request: '/blog-item',
    realization: '/blog-item-real',
    latest: '/blog-item/latest',
  },

  blogUpload: {
    list: '/blog-upload-item',
    search: '/blog-upload-item/search',
    searchSubordinate: '/blog-upload-item/search-subordinate',
    featured: '/blog-upload-item/search-featured',
    upload: '/blog-upload-item/upload',
    reRunUpload: '/blog-upload-item/update-runned-upload',
    runUpload: '/blog-upload-item/run-upload',
    request: '/blog-upload-item',
    realization: '/blog-upload-item-real',
    latest: '/blog-upload-item/latest',
  },

  vendor: {
    list: '/vendor',
    countQR: (id: number) => `/qr-master/count/${id}`,
    request: '/vendor-request',
    realization: '/vendor-real',
  },

  ptpl: {
    qrMaster: '/qr-master',
    qaCheck: '/qa-check',
    prodUsage: '/prod-usage',
  },

  /// THEME
  kanban: '/kanban',
  calendar: '/calendar',
  mail: {
    list: '/mail/list',
    details: '/mail/details',
    labels: '/mail/labels',
    sentVerification: '/mail/sent-verification',
  },

  product: {
    list: '/product/list',
    details: '/product/details',
    search: '/product/search',
  },
};
