export const numericTransformer = {
  to: (v: number) => v,
  from: (v: string) => parseFloat(v),
};
