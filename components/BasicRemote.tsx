import { Pause, Play, SkipBack, SkipForward, VolumeX } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { sendAction } from "../lib/api";
import type { PlayMode, ServerConfig, VolumeMode } from "../lib/types";
import VolumeGlyph from "./VolumeGlyph";

type Props = {
    server: ServerConfig | null;
    onError: (message: string) => void;
    playMode: PlayMode;
    volumeMode: VolumeMode;
};

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

function Btn({
    label,
    onPress,
    onPressIn,
    onPressOut,
    children,
    flex,
    primary,
}: {
    label: string;
    onPress: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    children: React.ReactNode;
    flex?: number;
    primary?: boolean;
}) {
    return (
        <Pressable
            accessibilityLabel={label}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={({ pressed }) => ({
                flex: flex ?? 1,
                height: 58,
                borderRadius: 18,
                backgroundColor: primary ? "rgba(80,180,255,0.18)" : "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: primary ? "rgba(80,180,255,0.35)" : "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
                paddingHorizontal: 10,
            })}
        >
            {children}
        </Pressable>
    );
}

export default function BasicRemote({ server, onError, playMode, volumeMode }: Props) {
    const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdTick = useRef<ReturnType<typeof setTimeout> | null>(null);

    function stopHold() {
        if (holdTimeout.current) clearTimeout(holdTimeout.current);
        if (holdTick.current) clearTimeout(holdTick.current);
        holdTimeout.current = null;
        holdTick.current = null;
    }

    function startHold(fn: () => Promise<void>) {
        stopHold();
        holdTimeout.current = setTimeout(() => {
            const tick = async () => {
                await fn();
                holdTick.current = setTimeout(tick, 95);
            };
            void tick();
        }, 240);
    }

    async function post(path: string) {
        if (!server) return onError("Not paired. Go to Home and scan the QR.");
        try {
            await sendAction(server, { type: "post", path });
        } catch (e) {
            onError((e as Error).message);
        }
    }

    async function key(k: string) {
        if (!server) return onError("Not paired. Go to Home and scan the QR.");
        try {
            await sendAction(server, { type: "keypress", key: k });
        } catch (e) {
            onError((e as Error).message);
        }
    }

    const playPause = () => {
        if (playMode === "player") return key("Space");
        return post("/play_pause");
    };

    const prev = () => post("/prev");
    const next = () => post("/next");

    const volUp = () => post("/volume/up");
    const volDown = () => post("/volume/down");
    const mute = () => post("/volume/mute");

    const volUpAny = () => (volumeMode === "player" ? key("Up") : volUp());
    const volDownAny = () => (volumeMode === "player" ? key("Down") : volDown());
    const muteAny = () => (volumeMode === "player" ? key("m") : mute());

    return (
        <View style={{ gap: 10 }}>
            <Card title="TRANSPORT">
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <Btn label="Previous" onPress={prev} flex={1}>
                        <SkipBack color="white" size={20} />
                    </Btn>

                    <Btn label="Play/Pause" primary onPress={playPause} flex={2}>
                        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                            <Play color="white" size={18} />
                            <Pause color="white" size={18} />
                        </View>
                    </Btn>

                    <Btn label="Next" onPress={next} flex={1}>
                        <SkipForward color="white" size={20} />
                    </Btn>
                </View>
            </Card>

            <Card title="VOLUME">
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <Btn label="Mute" onPress={muteAny} flex={1}>
                        <VolumeX color="white" size={22} />
                    </Btn>

                    <Btn
                        label="Volume Down"
                        onPress={volDownAny}
                        onPressIn={() => startHold(async () => volDownAny())}
                        onPressOut={stopHold}
                        flex={1}
                    >
                        <VolumeGlyph variant="minus" />
                    </Btn>

                    <Btn
                        label="Volume Up"
                        onPress={volUpAny}
                        onPressIn={() => startHold(async () => volUpAny())}
                        onPressOut={stopHold}
                        flex={1}
                    >
                        <VolumeGlyph variant="plus" />
                    </Btn>
                </View>
            </Card>
        </View>
    );
}