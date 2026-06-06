export type Tag = {
  id: string;
  collectionId: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  updatedAt: string;
};

export type CardTag = {
  cardId: string;
  tagId: string;
};
