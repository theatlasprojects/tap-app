export type PlayMode = "system" | "player";
export type VolumeMode = "system" | "player";

export type Preset = {
    id: string;
    name: string;
    description: string;
    capabilities: {
        supportsKeyboardControls: boolean;
        supportsPlayerVolume: boolean;
        defaultPlayMode: PlayMode;
        defaultVolumeMode: VolumeMode;
    };
};

export type PresetSettings = {
    playMode: PlayMode;
    volumeMode: VolumeMode;
};

export type ServerConfig = {
    baseUrl: string;
    token: string;
};

export type ActionRequest =
    | { type: "post"; path: string }
    | { type: "keypress"; key: string };