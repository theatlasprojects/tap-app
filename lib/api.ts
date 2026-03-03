import type { ActionRequest, ServerConfig } from "./types";

type ErrorCode = "unpaired" | "unauthorized" | "rejected" | "network" | "unknown";

type ErrorBody = {
    code?: string;
    message?: string;
};

export class RemoteError extends Error {
    public readonly code: ErrorCode;
    public readonly status?: number;

    public constructor(code: ErrorCode, message: string, status?: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

function hintForBaseUrl(baseUrl: string) {
    return `Check that your phone + desktop are on the same LAN, the server is running, and the URL is reachable: ${baseUrl}`;
}

function normalizeBaseUrl(u: string) {
    return u.replace(/\/+$/, "");
}

async function checkedFetch(url: string, init: RequestInit, baseUrl: string) {
    try {
        return await fetch(url, init);
    } catch (err) {
        const msg = String((err as Error)?.message ?? err);

        if (msg.toLowerCase().includes("network request failed")) {
            throw new RemoteError("network", `Request failed (network). ${hintForBaseUrl(baseUrl)}`);
        }

        throw new RemoteError("network", `Request failed: ${msg}. ${hintForBaseUrl(baseUrl)}`);
    }
}

async function readErrorBody(res: Response): Promise<ErrorBody | null> {
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null;

    try {
        return (await res.json()) as ErrorBody;
    } catch {
        return null;
    }
}

function mapCode(raw?: string): ErrorCode {
    if (!raw) return "unknown";
    const v = raw.toLowerCase();
    if (v === "unpaired") return "unpaired";
    if (v === "unauthorized") return "unauthorized";
    if (v === "rejected") return "rejected";
    return "unknown";
}

async function throwForNotOk(res: Response, baseUrl: string) {
    const body = await readErrorBody(res);
    const code = mapCode(body?.code);

    if (code !== "unknown") {
        throw new RemoteError(code, body?.message ?? `Request failed (${res.status}).`, res.status);
    }

    if (res.status === 401 || res.status === 403) {
        throw new RemoteError(
            "unauthorized",
            "Unauthorized. Pair again from Home.",
            res.status
        );
    }

    throw new RemoteError(
        "rejected",
        `Request failed (${res.status}). The server rejected the command.`,
        res.status
    );
}

export async function sendAction(server: ServerConfig, req: ActionRequest): Promise<void> {
    const baseUrl = normalizeBaseUrl(server.baseUrl);

    if (req.type === "keypress") {
        const res = await checkedFetch(
            `${baseUrl}/keypress`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${server.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: req.key }),
            },
            baseUrl
        );

        if (!res.ok) {
            await throwForNotOk(res, baseUrl);
        }
        return;
    }

    const res = await checkedFetch(
        `${baseUrl}${req.path}`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${server.token}`,
            },
        },
        baseUrl
    );

    if (!res.ok) {
        await throwForNotOk(res, baseUrl);
    }
}