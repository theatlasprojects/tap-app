import type { Preset } from "./types";

export const PRESETS: Preset[] = [
    {
        id: "basic",
        name: "Basic",
        description: "System media controls.",
        capabilities: {
            supportsKeyboardControls: false,
            supportsPlayerVolume: false,
            defaultPlayMode: "system",
            defaultVolumeMode: "system",
        },
    },
    {
        id: "crunchyroll",
        name: "Crunchyroll",
        description: "Crunchyroll media player. Requires focus.",
        capabilities: {
            supportsKeyboardControls: true,
            supportsPlayerVolume: true,
            defaultPlayMode: "player",
            defaultVolumeMode: "player",
        },
    },
];

export function getPresetById(id: string | null | undefined): Preset {
    const found = PRESETS.find((p) => p.id === id);
    return found ?? PRESETS[0];
}

export type { Preset };
