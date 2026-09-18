/** États possibles d'une recherche. Repris de `useStationSearch`, sans dépendre de la couche UI. */
export type SearchStatusKind = 'locating' | 'loading' | 'ready' | 'error' | 'no-position';

export type SearchHereInput = {
  /** La carte a-t-elle été déplacée **par l'utilisateur** depuis la dernière recherche aboutie ? */
  mapMoved: boolean;
  status: SearchStatusKind;
};

/** Une recherche est déjà en cours : en proposer une seconde ferait se doubler les résultats. */
const BUSY: readonly SearchStatusKind[] = ['locating', 'loading'];

/**
 * Faut-il proposer « Chercher ici » ? (007 FR-023)
 *
 * Le bouton n'apparaît qu'après un déplacement ou un zoom voulu par l'utilisateur, et jamais pendant
 * qu'une recherche tourne. Les recadrages que l'application s'impose à elle-même — après une
 * recherche, ou en sélectionnant une station — ne comptent pas : c'est `MapView` qui les écarte,
 * avant même d'appeler cette fonction.
 *
 * Fonction pure : ni DOM, ni réseau, ni stockage, ni horloge (constitution, principe III).
 */
export function shouldOfferSearchHere({ mapMoved, status }: SearchHereInput): boolean {
  return mapMoved && !BUSY.includes(status);
}
