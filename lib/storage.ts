import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ServerConfig } from "./types";

const KEY_SERVER = "atlas_tap_server";
const KEY_PRESET = "atlas_tap_preset";

export async function loadServer(): Promise<ServerConfig | null> {
    const raw = await AsyncStorage.getItem(KEY_SERVER);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as ServerConfig;
        if (!parsed?.baseUrl || !parsed?.token) return null;
        return parsed;
    } catch {
        return null;
    }
}

export async function saveServer(cfg: ServerConfig): Promise<void> {
    await AsyncStorage.setItem(KEY_SERVER, JSON.stringify(cfg));
}

export async function clearServer(): Promise<void> {
    await AsyncStorage.removeItem(KEY_SERVER);
}

export async function loadPresetId(): Promise<string | null> {
    return await AsyncStorage.getItem(KEY_PRESET);
}

export async function savePresetId(id: string): Promise<void> {
    await AsyncStorage.setItem(KEY_PRESET, id);
}