export type DiscussionStep = {
  step: number;
  title: string;
  prompt: string;
  helper?: string;
};

export type AggregatedValue = {
  value: string;
  count: number;
};
