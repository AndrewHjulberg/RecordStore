export default function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      <img src={listing.imageUrl} alt={listing.title} />
      <h2>{listing.title}</h2>
      <p>{listing.artist}</p>
      <p>${listing.price}</p>
      <p>{listing.condition}</p>
    </div>
  );
}
