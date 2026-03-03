import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import BasicRemote from "../../components/BasicRemote";
import CrunchyrollRemote from "../../components/CrunchyrollRemote";

import { getPresetById } from "../../lib/presets";
import { loadPresetSettings, savePresetSettings } from "../../lib/presetSettings";
import { loadPresetId, loadServer } from "../../lib/storage";
import type { PresetSettings, ServerConfig } from "../../lib/types";

function hostPort(baseUrl: string) {
    try {
        const u = new URL(baseUrl);
        return u.port ? `${u.hostname}:${u.port}` : u.hostname;
    } catch {
        return baseUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    }
}

function SegmentedSmall({
    leftLabel,
    rightLabel,
    value,
    onChange,
}: {
    leftLabel: string;
    rightLabel: string;
    value: "left" | "right";
    onChange: (v: "left" | "right") => void;
}) {
    return (
        <View
            style={{
                flexDirection: "row",
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.05)",
                overflow: "hidden",
            }}
        >
            <Pressable
                onPress={() => onChange("left")}
                style={({ pressed }) => ({
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    backgroundColor: value === "left" ? "rgba(80,180,255,0.18)" : "transparent",
                    borderRightWidth: 1,
                    borderRightColor: "rgba(255,255,255,0.08)",
                    opacity: pressed ? 0.85 : 1,
                })}
            >
                <Text
                    style={{
                        color: "white",
                        fontWeight: "800",
                        fontSize: 11,
                        opacity: value === "left" ? 1 : 0.65,
                    }}
                >
                    {leftLabel}
                </Text>
            </Pressable>

            <Pressable
                onPress={() => onChange("right")}
                style={({ pressed }) => ({
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    backgroundColor: value === "right" ? "rgba(80,180,255,0.18)" : "transparent",
                    opacity: pressed ? 0.85 : 1,
                })}
            >
                <Text
                    style={{
                        color: "white",
                        fontWeight: "800",
                        fontSize: 11,
                        opacity: value === "right" ? 1 : 0.65,
                    }}
                >
                    {rightLabel}
                </Text>
            </Pressable>
        </View>
    );
}

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View
            style={{
                padding: 14,
                borderRadius: 22,
                backgroundColor: "rgba(20,20,20,0.90)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                gap: 10,
            }}
        >
            <Text
                style={{
                    color: "rgba(255,255,255,0.70)",
                    fontSize: 12,
                    fontWeight: "800",
                }}
            >
                {title}
            </Text>
            {children}
        </View>
    );
}

export default function RemoteScreen() {
    const [server, setServer] = useState<ServerConfig | null>(null);
    const [presetId, setPresetId] = useState<string | null>(null);

    const preset = useMemo(() => {
        return getPresetById(presetId) ?? getPresetById("basic");
    }, [presetId]);

    const [settings, setSettings] = useState<PresetSettings>(() => ({
        playMode: preset.capabilities.defaultPlayMode,
        volumeMode: preset.capabilities.defaultVolumeMode,
    }));

    const refresh = useCallback(async () => {
        const s = await loadServer();
        const p = await loadPresetId();
        setServer(s);
        setPresetId(p);
    }, []);

    useFocusEffect(
        useCallback(() => {
            void refresh();
        }, [refresh])
    );

    useEffect(() => {
        setSettings({
            playMode: preset.capabilities.defaultPlayMode,
            volumeMode: preset.capabilities.defaultVolumeMode,
        });

        (async () => {
            const loaded = await loadPresetSettings(preset);
            setSettings(loaded);
        })();
    }, [preset, preset.id]);

    async function updateSettings(next: Partial<PresetSettings>) {
        const merged: PresetSettings = { ...settings, ...next };
        setSettings(merged);
        await savePresetSettings(preset, merged);
    }

    const target = server ? hostPort(server.baseUrl) : "—";
    const showPlaybackSetting = !!preset.capabilities.supportsKeyboardControls;

    return (
        <View style={{ flex: 1, backgroundColor: "#0b0b0d" }}>
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    paddingTop: 56,
                    paddingHorizontal: 18,
                    paddingBottom: 12,
                    backgroundColor: "rgba(11,11,13,0.92)",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.08)",
                }}
            >
                <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                    Remote - {preset.name}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                    {preset.description} {server ? "" : `(${target})`}
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 18,
                    paddingTop: 56 + 12 + 56,
                    paddingBottom: 18,
                    gap: 10,
                }}
                showsVerticalScrollIndicator={false}
            >
                {showPlaybackSetting && (
                    <Card title="SETTINGS">
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <View style={{ flex: 1, gap: 4 }}>
                                <Text style={{ color: "white", fontWeight: "900", fontSize: 13 }}>
                                    Playback control
                                </Text>
                                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                                    System media controls vs player shortcuts.
                                </Text>
                            </View>

                            <SegmentedSmall
                                leftLabel="System"
                                rightLabel="Player"
                                value={settings.playMode === "system" ? "left" : "right"}
                                onChange={(v) =>
                                    void updateSettings({
                                        playMode: v === "left" ? "system" : "player",
                                    })
                                }
                            />
                        </View>
                    </Card>
                )}

                {preset.id === "crunchyroll" ? (
                    <CrunchyrollRemote
                        server={server}
                        playMode={settings.playMode}
                        volumeMode={settings.volumeMode}
                        onChangeVolumeMode={(mode) => void updateSettings({ volumeMode: mode })}
                        onError={(msg) => Alert.alert("Request failed", msg)}
                    />
                ) : (
                    <BasicRemote
                        server={server}
                        playMode={settings.playMode}
                        volumeMode={settings.volumeMode}
                        onError={(msg) => Alert.alert("Request failed", msg)}
                    />
                )}
            </ScrollView>
        </View>
    );
}