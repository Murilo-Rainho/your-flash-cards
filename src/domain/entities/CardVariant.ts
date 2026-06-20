export const VARIANT_TYPES = {
  ORIGINAL: 'original',
  REVERSE: 'reverse',
} as const;

export type VariantType = (typeof VARIANT_TYPES)[keyof typeof VARIANT_TYPES];

/**
 * CardVariant (§30.5) is a presentation unit; it does not duplicate front/back.
 */
export type CardVariant = {
  id: string;
  cardId: string;
  variantType: VariantType;
  isGenerated: boolean;
  createdAt: string;
  updatedAt: string;
};
