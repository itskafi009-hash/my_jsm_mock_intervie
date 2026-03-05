export async function POST(req: Request) {
    const body = await req.json();

    console.log("Interview Result:", body);

    // Yaha database save logic aayega

    return Response.json({
        success: true,
        message: "Result saved successfully"
    });
}