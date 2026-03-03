import {
    Captions,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    FastForward,
    Pause,
    Play,
    RotateCcw,
    SkipForward,
    VolumeX,
} from "lucide-react-native";
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
    onChangeVolumeMode: (mode: VolumeMode) => void;
};

function Card({
    title,
    right,
    children,
}: {
    title: string;
    right?: React.ReactNode;
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
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
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

                {right}
            </View>

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

function IconWithLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <View style={{ alignItems: "center", gap: 4 }}>
            {icon}
            <Text
                style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 0.3,
                }}
            >
                {text}
            </Text>
        </View>
    );
}

function SegmentedTiny({
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
                    paddingVertical: 6,
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
                    paddingVertical: 6,
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

export default function CrunchyrollRemote({
    server,
    onError,
    playMode,
    volumeMode,
    onChangeVolumeMode,
}: Props) {
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

    async function key(k: string) {
        if (!server) return onError("Not paired. Go to Home and scan the QR.");
        try {
            await sendAction(server, { type: "keypress", key: k });
        } catch (e) {
            onError((e as Error).message);
        }
    }

    async function post(path: string) {
        if (!server) return onError("This device is currently not paired.");
        try {
            await sendAction(server, { type: "post", path });
        } catch (e) {
            onError((e as Error).message);
        }
    }

    const playPause = () => {
        if (playMode === "system") return post("/play_pause");
        return key("Space");
    };

    const back5 = () => key("Left");
    const forward5 = () => key("Right");
    const back10 = () => key("j");
    const forward10 = () => key("l");

    const captions = () => key("c");
    const skipIntro = () => key("s");
    const nextEpisode = () => key("Shift+N");
    const restart = () => key("0");

    const volUp = () => {
        if (volumeMode === "system") return post("/volume/up");
        return key("Up");
    };

    const volDown = () => {
        if (volumeMode === "system") return post("/volume/down");
        return key("Down");
    };

    const mute = () => {
        if (volumeMode === "system") return post("/volume/mute");
        return key("m");
    };

    return (
        <View style={{ gap: 10 }}>
            <Card title="TRANSPORT">
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <Btn label="Back 10 seconds" onPress={back10} flex={1}>
                        <IconWithLabel icon={<ChevronsLeft color="white" size={20} />} text="-10" />
                    </Btn>

                    <Btn label="Back 5 seconds" onPress={back5} flex={1}>
                        <IconWithLabel icon={<ChevronLeft color="white" size={20} />} text="-5" />
                    </Btn>

                    <Btn label="Play/Pause" primary onPress={playPause} flex={2}>
                        <View style={{ alignItems: "center", gap: 6 }}>
                            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                                <Play color="white" size={18} />
                                <Pause color="white" size={18} />
                            </View>
                            {/* <Text
                                style={{
                                    color: "rgba(255,255,255,0.72)",
                                    fontSize: 10,
                                    fontWeight: "800",
                                    letterSpacing: 0.3,
                                }}
                            >
                                PLAY
                            </Text> */}
                        </View>
                    </Btn>

                    <Btn label="Forward 5 seconds" onPress={forward5} flex={1}>
                        <IconWithLabel icon={<ChevronRight color="white" size={20} />} text="+5" />
                    </Btn>

                    <Btn label="Forward 10 seconds" onPress={forward10} flex={1}>
                        <IconWithLabel icon={<ChevronsRight color="white" size={20} />} text="+10" />
                    </Btn>
                </View>
            </Card>

            <Card
                title="VOLUME"
                right={
                    <SegmentedTiny
                        leftLabel="System"
                        rightLabel="Player"
                        value={volumeMode === "system" ? "left" : "right"}
                        onChange={(v) => onChangeVolumeMode(v === "left" ? "system" : "player")}
                    />
                }
            >
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <Btn label="Mute" onPress={mute} flex={1}>
                        <VolumeX color="white" size={22} />
                    </Btn>

                    <Btn
                        label="Volume Down"
                        onPress={volDown}
                        onPressIn={() => startHold(async () => volDown())}
                        onPressOut={stopHold}
                        flex={1}
                    >
                        <VolumeGlyph variant="minus" />
                    </Btn>

                    <Btn
                        label="Volume Up"
                        onPress={volUp}
                        onPressIn={() => startHold(async () => volUp())}
                        onPressOut={stopHold}
                        flex={1}
                    >
                        <VolumeGlyph variant="plus" />
                    </Btn>
                </View>
            </Card>

            <Card title="EXTRAS">
                <View style={{ gap: 10 }}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <Btn label="Captions" onPress={captions} flex={1}>
                            <IconWithLabel icon={<Captions color="white" size={20} />} text="CC" />
                        </Btn>

                        <Btn label="Skip Intro" onPress={skipIntro} flex={1}>
                            <IconWithLabel icon={<FastForward color="white" size={20} />} text="INTRO" />
                        </Btn>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <Btn label="Next Episode" onPress={nextEpisode} flex={1}>
                            <IconWithLabel icon={<SkipForward color="white" size={20} />} text="NEXT" />
                        </Btn>

                        <Btn label="Restart Episode" onPress={restart} flex={1}>
                            <IconWithLabel icon={<RotateCcw color="white" size={20} />} text="RESTART" />
                        </Btn>
                    </View>
                </View>
            </Card>
        </View>
    );
}