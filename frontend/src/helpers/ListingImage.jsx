import { useState } from "react";

export default function ListingImage({ listing }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showingBack, setShowingBack] = useState(false);

  const openFullImage = () => {
    setShowFullImage(true);
    setIsOpening(true);
    setIsClosing(false);
    setShowingBack(false); // always start with front
    setTimeout(() => setIsOpening(false), 350);
  };

  const closeFullImage = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowFullImage(false);
      setIsClosing(false);
      setShowingBack(false); // reset
    }, 300);
  };

  return (
    <>
      <div style={{ position: "relative", marginBottom: "15px" }}>
        <img
          src={
            listing.imageBase64_front
              ? `data:${listing.imageMime_front || "image/jpeg"};base64,${listing.imageBase64_front}`
              : listing.imageUrl
          }
          alt={listing.title}
          style={{
            width: "100%",
            height: "250px",
            objectFit: "cover",
            borderRadius: "8px",
            cursor: listing.imageBase64_front ? "pointer" : "default"
          }}
          onClick={() => {
            if (listing.imageBase64_front) openFullImage();
          }}
        />
        {!listing.imageBase64_front && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-20deg)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "1.5rem",
              fontWeight: "bold",
              pointerEvents: "none"
            }}
          >
            Stock Photo
          </span>
        )}
      </div>

      {showFullImage && (
        <div
          onClick={closeFullImage}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            opacity: isClosing ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
            animation: isOpening
              ? "fadeInZoom 0.3s ease-in-out forwards"
              : isClosing
              ? "fadeOutZoom 0.3s ease-in-out forwards"
              : "none"
          }}
        >
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={
                showingBack
                  ? `data:${listing.imageMime_back || "image/jpeg"};base64,${listing.imageBase64_back}`
                  : `data:${listing.imageMime_front || "image/jpeg"};base64,${listing.imageBase64_front}`
              }
              alt={listing.title}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: "8px",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                transform: isClosing ? "scale(0.95)" : "scale(1)",
                transition: "transform 0.3s ease-in-out"
              }}
            />

            {/* Close button */}
            <button
              onClick={closeFullImage}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "1.2rem",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            {/* Toggle buttons directly on image */}
            {listing.imageBase64_back && !showingBack && (
              <button
                onClick={() => setShowingBack(true)}
                style={{
                  position: "absolute",
                  bottom: "40px",
                  right: "10px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor: "pointer"
                }}
              >
                Back
              </button>
            )}
            {listing.imageBase64_front && showingBack && (
              <button
                onClick={() => setShowingBack(false)}
                style={{
                  position: "absolute",
                  bottom: "40px",
                  right: "10px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor: "pointer"
                }}
              >
                Front
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}