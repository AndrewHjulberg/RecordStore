import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

function AdminOrderLookup() {
    const [searchParams] = useSearchParams();
    const initialId = searchParams.get("id") || "";
    const [orderId, setOrderId] = useState(initialId);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const lookupOrder = async () => {
        if (!orderId.trim()) return;

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) {
                throw new Error("Order not found or unauthorized");
            }

            const data = await res.json();
            setOrder(data);
        } catch (err) {
            console.error(err);
            setError("Order not found.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") lookupOrder();
    };
    useEffect(() => {
        if (initialId) {
            lookupOrder(initialId);
        }
    }, [initialId]);
    return (
        <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
            <h1>Order Lookup</h1>

            {/* INPUT FIELD */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="number"
                    placeholder="Enter Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{
                        padding: "10px",
                        width: "200px",
                        marginRight: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
                <button
                    onClick={lookupOrder}
                    style={{
                        padding: "10px 15px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Lookup
                </button>
            </div>

            {/* LOADING / ERROR */}
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* ORDER DETAILS */}
            {order && (
                <div
                    style={{
                        marginTop: "30px",
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                    }}
                >
                    <h2>Order #{order.id}</h2>
                    {/* VIEW USER LINK */}
                    <p>
                        <Link
                            to={`/admin/users?id=${order.userId}`}
                            style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
                        >
                            View User
                        </Link>
                    </p>

                    <p>
                        <strong>User:</strong> {order.user?.email}
                    </p>
                    <p>
                        <strong>Order Date:</strong>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p>
                        <strong>Status:</strong> {order.status}
                    </p>
                    <p>
                        <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
                    </p>

                    <h3 style={{ marginTop: "20px" }}>Items</h3>
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginBottom: "10px",
                                borderBottom: "1px solid #eee",
                                paddingBottom: "10px",
                            }}
                        >
                            {item.listing?.imageUrl && (
                                <img
                                    src={item.listing.imageUrl}
                                    alt={item.listing.title}
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                        borderRadius: "6px",
                                    }}
                                />
                            )}

                            <div style={{ flex: 1 }}>
                                <strong>{item.listing?.title}</strong>
                                <div style={{ color: "#555" }}>{item.listing?.artist}</div>
                            </div>

                            <div>
                                $
                                {(
                                    item.price ??
                                    item.listing?.salePrice ??
                                    item.listing?.price ??
                                    0
                                ).toFixed(2)}
                            </div>
                        </div>
                    ))}

                    {order.shippingAddress && (
                        <>
                            <h3 style={{ marginTop: "20px" }}>Shipping Address</h3>
                            <p>{order.shippingAddress}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminOrderLookup;