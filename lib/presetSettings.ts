import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Preset, PresetSettings } from "./types";

function keyForPreset(presetId: string) {
    return `atlas_tap_preset_settings_v2_${presetId}`;
}

export function defaultSettingsForPreset(p: Preset): PresetSettings {
    return {
        playMode: p.capabilities.defaultPlayMode,
        volumeMode: p.capabilities.defaultVolumeMode,
    };
}

export function sanitizeSettings(p: Preset, s: PresetSettings): PresetSettings {
    const out: PresetSettings = { ...s };

    if (!p.capabilities.supportsKeyboardControls) {
        out.playMode = "system";
    }

    if (!p.capabilities.supportsPlayerVolume) {
        out.volumeMode = "system";
    }

    if (out.playMode !== "system" && out.playMode !== "player") {
        out.playMode = "system";
    }

    if (out.volumeMode !== "system" && out.volumeMode !== "player") {
        out.volumeMode = "system";
    }

    return out;
}

export async function loadPresetSettings(p: Preset): Promise<PresetSettings> {
    const raw = await AsyncStorage.getItem(keyForPreset(p.id));
    if (!raw) return defaultSettingsForPreset(p);

    try {
        const parsed = JSON.parse(raw) as Partial<PresetSettings>;
        const merged: PresetSettings = {
            ...defaultSettingsForPreset(p),
            ...parsed,
        };

        return sanitizeSettings(p, merged);
    } catch {
        return defaultSettingsForPreset(p);
    }
}

export async function savePresetSettings(p: Preset, s: PresetSettings): Promise<void> {
    const safe = sanitizeSettings(p, s);
    await AsyncStorage.setItem(keyForPreset(p.id), JSON.stringify(safe));
}