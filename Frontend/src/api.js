const API_BASE_URL = "http://localhost:8080/api/seats";

export const fetchSeats = async () => {
    try {
        console.log("Fetching seats from:", API_BASE_URL);
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return []; // Return empty array on error to prevent crash
    }
};

export const bookSeat = async (id) => {
    const response = await fetch(`${API_BASE_URL}/book/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    if (response.status === 409) throw new Error("Already booked!");
    if (!response.ok) throw new Error("Booking failed");
    return await response.json();
};
