export type FeedbackItem = { key: string; label: string; feedback?: FeedbackItem[] };
export type CategoryItem = { key: string; label: string; feedback: FeedbackItem[] };
export type FeedbackResponse = {
  response: string;
  feedbackComment: FeedbackItem[];
  nextState: string;
};

export const fillDescription: FeedbackItem[] = [
  { key: '/1-isi-deskripsi', label: '1. Isi Deskripsi' },
  { key: '/0', label: '0. Kembali' },
];

export const categoryFeedback: CategoryItem[] = [
  {
    key: '/1',
    label: '1. Aplikasi',
    feedback: [
      { key: '/1', label: '1. P-Office', feedback: fillDescription },
      { key: '/2', label: '2. I-Vendor', feedback: fillDescription },
      { key: '/3', label: '3. MySSC', feedback: fillDescription },
      { key: '/4', label: '4. Lainnya', feedback: fillDescription },
      { key: '/0', label: '0. Kembali', feedback: [] },
    ],
  },
  {
    key: '/2',
    label: '2. Infrastruktur',
    feedback: [
      { key: '/1', label: '1. Jaringan', feedback: fillDescription },
      { key: '/2', label: '2. Server', feedback: fillDescription },
      { key: '/3', label: '3. Lainnya', feedback: fillDescription },
      { key: '/0', label: '0. Kembali', feedback: [] },
    ],
  },
  {
    key: '/0',
    label: '0. Kembali',
    feedback: [],
  },
];

export const changeUserPhoneFeedback: FeedbackItem[] = [
  { key: '/1-isi-nomor-telepon', label: '1. Rubah Nomor Telepon' },
  { key: '/0', label: '0. Kembali' },
];
