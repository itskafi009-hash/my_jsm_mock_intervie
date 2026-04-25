import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapiInstance() {
    if (vapiInstance) return vapiInstance;

    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!;

    vapiInstance = new Vapi(publicKey);

    return vapiInstance;
}