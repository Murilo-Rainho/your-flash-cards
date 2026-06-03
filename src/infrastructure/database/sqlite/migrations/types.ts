export type SqliteMigration = {
  version: string;
  description: string;
  statements: readonly string[];
};
