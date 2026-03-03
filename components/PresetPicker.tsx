import type { Preset } from "@/lib/types";
import { Pressable, Text, View } from "react-native";

type Props = {
    presets: Preset[];
    selectedId: string;
    onSelect: (id: string) => void;
};

export default function PresetPicker({ presets, selectedId, onSelect }: Props) {
    return (
        <View style={{ gap: 10 }}>
            {presets.map((p) => {
                const active = p.id === selectedId;
                return (
                    <Pressable
                        key={p.id}
                        onPress={() => onSelect(p.id)}
                        style={({ pressed }) => ({
                            paddingVertical: 14,
                            paddingHorizontal: 14,
                            borderRadius: 16,
                            backgroundColor: active ? "rgba(80,180,255,0.14)" : "rgba(20,20,20,0.9)",
                            borderWidth: 1,
                            borderColor: active ? "rgba(80,180,255,0.35)" : "rgba(255,255,255,0.08)",
                            opacity: pressed ? 0.85 : 1,
                        })}
                    >
                        <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                            {p.name}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.55)", marginTop: 6, fontSize: 12 }}>
                            {p.actions.length} buttons
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}