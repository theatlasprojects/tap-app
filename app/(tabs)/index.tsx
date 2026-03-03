import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import QrScannerModal from "../../components/QrScannerModal";
import { PRESETS } from "../../lib/presets";
import {
    clearServer,
    loadPresetId,
    loadServer,
    savePresetId,
    saveServer,
} from "../../lib/storage";
import type { ServerConfig } from "../../lib/types";

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
                padding: 16,
                borderRadius: 22,
                backgroundColor: "rgba(20,20,20,0.9)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                gap: 12,
            }}
        >
            <Text
                style={{
                    color: "rgba(255,255,255,0.7)",
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

function PrimaryButton({
    title,
    onPress,
    disabled,
}: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => ({
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: "rgba(80,180,255,0.18)",
                borderWidth: 1,
                borderColor: "rgba(80,180,255,0.35)",
                opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
                alignItems: "center",
            })}
        >
            <Text style={{ color: "white", fontWeight: "800" }}>
                {title}
            </Text>
        </Pressable>
    );
}

function SecondaryButton({
    title,
    onPress,
    disabled,
}: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => ({
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
                alignItems: "center",
            })}
        >
            <Text style={{ color: "white", fontWeight: "800" }}>
                {title}
            </Text>
        </Pressable>
    );
}

function PresetRow({
    name,
    description,
    active,
    onPress,
}: {
    name: string;
    description: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                padding: 14,
                borderRadius: 16,
                backgroundColor: active
                    ? "rgba(80,180,255,0.16)"
                    : "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: active
                    ? "rgba(80,180,255,0.35)"
                    : "rgba(255,255,255,0.10)",
                opacity: pressed ? 0.85 : 1,
                gap: 4,
            })}
        >
            <Text
                style={{
                    color: "white",
                    fontWeight: "800",
                    fontSize: 14,
                }}
            >
                {name}
            </Text>
            <Text
                style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                }}
            >
                {description}
            </Text>
        </Pressable>
    );
}

export default function HomeScreen() {
    const [server, setServer] = useState<ServerConfig | null>(null);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [presetId, setPresetId] = useState<string>(PRESETS[0].id);

    const refresh = useCallback(async () => {
        const s = await loadServer();
        const p = await loadPresetId();
        setServer(s);
        if (p) setPresetId(p);
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useFocusEffect(
        useCallback(() => {
            void refresh();
        }, [refresh])
    );

    async function onPaired(cfg: ServerConfig) {
        await saveServer(cfg);
        setServer(cfg);
    }

    async function unpair() {
        setServer(null);
        await clearServer();
    }

    async function selectPreset(id: string) {
        setPresetId(id);
        await savePresetId(id);
    }

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
                    paddingBottom: 14,
                    backgroundColor: "rgba(11,11,13,0.92)",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.08)",
                }}
            >
                <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                    Atlas Tap
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                    Pair your desktop and choose a preset.
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 18,
                    paddingTop: 56 + 14 + 56,
                    paddingBottom: 28,
                    gap: 14,
                }}
            >
                <Card title="PAIRING">
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                        {server ? `Connected to ${server.baseUrl}` : "Not paired yet."}
                    </Text>

                    <View style={{ gap: 12 }}>
                        <PrimaryButton
                            title="Scan QR"
                            onPress={() => setScannerOpen(true)}
                            disabled={!!server}
                        />
                        <SecondaryButton
                            title="Unpair"
                            onPress={unpair}
                            disabled={!server}
                        />
                    </View>
                </Card>

                <Card title="PRESETS">
                    <View style={{ gap: 10 }}>
                        {PRESETS.map((p) => (
                            <PresetRow
                                key={p.id}
                                name={p.name}
                                description={p.description}
                                active={p.id === presetId}
                                onPress={() => void selectPreset(p.id)}
                            />
                        ))}
                    </View>
                </Card>
            </ScrollView>

            <QrScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onPaired={onPaired}
            />
        </View>
    );
}