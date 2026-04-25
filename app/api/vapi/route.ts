export async function POST() {
    try {
        const response = await fetch("https://api.vapi.ai/token", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return Response.json(data);

    } catch (error) {
        return Response.json({ error: "Token error" });
    }
}