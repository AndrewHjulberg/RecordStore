const GENRE_MAP = {
  "Rock": "Rock",
  "Rock & Roll": "Rock",
  "Pop": "Pop",
  "Hip Hop": "Hip-Hop",
  "Hip-Hop": "Hip-Hop",
  "Rap": "Hip-Hop",
  "Jazz": "Jazz",
  "Electronic": "Electronic",
  "Electronic Music": "Electronic",
  "Dance": "Electronic",
  "Metal": "Metal",
  "Heavy Metal": "Metal",
  "Country": "Country",
  "Classical": "Classical",
  "R&B": "R&B",
  "Rhythm & Blues": "R&B",
  "Soul": "R&B",
  "Folk": "Folk",
  "Reggae": "Reggae",
  "Soundtrack": "Soundtrack",
};

/**
 * Map a single Discogs genre string to your canonical genre.
 */
export function mapDiscogsGenre(rawGenre) {
  return GENRE_MAP[rawGenre] || null;
}

/**
 * Given an array of Discogs genres, return the best fit for your dropdown.
 * Strategy:
 *  - Try to map each genre to your canonical set.
 *  - Return the first valid mapped genre.
 *  - If none match, return null.
 */
export function bestFitGenre(rawGenres = []) {
  if (!Array.isArray(rawGenres)) return null;

  for (const g of rawGenres) {
    const mapped = mapDiscogsGenre(g);
    if (mapped) return mapped;
  }

  return null;
}