import { useEffect, useState } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";

export default function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/listings")
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Record Store</h1>
      <div className="listings-grid">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
