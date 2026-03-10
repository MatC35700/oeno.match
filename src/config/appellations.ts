/**
 * Référentiel des appellations par pays et région viticole.
 * À compléter avec la liste fournie par l'utilisateur.
 * Structure prête pour : filtres, sélection dans le formulaire d'ajout.
 */

export type CountryCode = string;
export type RegionCode = string;

/** Appellations groupées par pays puis par région (clés = codes) */
export const APPELLATIONS_BY_COUNTRY_REGION: Record<
  CountryCode,
  Record<RegionCode, string[]>
> = {
  fr: {
    bordeaux: [],
    burgundy: [],
    champagne: [],
    rhone: [],
    loire: [],
    alsace: [],
    languedoc: [],
    provence: [],
  },
  it: {
    tuscany: [],
    piemont: [],
  },
  es: {
    rioja: [],
    ribera: [],
  },
  pt: { douro: [] },
  us: { napa: [], sonoma: [] },
  au: { barossa: [] },
  ar: { mendoza: [] },
  de: { mosel: [] },
  other: { others: [] },
};

/** Liste plate de toutes les appellations (pour recherche / filtre) */
export function getAllAppellations(): string[] {
  const list: string[] = [];
  for (const regions of Object.values(APPELLATIONS_BY_COUNTRY_REGION)) {
    for (const appellations of Object.values(regions)) {
      list.push(...appellations);
    }
  }
  return [...new Set(list)].sort();
}

/** Appellations pour un pays + région donnés */
export function getAppellationsForRegion(
  countryCode: CountryCode,
  regionCode: RegionCode
): string[] {
  return (
    APPELLATIONS_BY_COUNTRY_REGION[countryCode]?.[regionCode] ?? []
  );
}
