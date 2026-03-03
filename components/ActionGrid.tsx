import type { PresetAction } from "@/lib/types";
import { Pressable, Text, View } from "react-native";

type Props = {
    actions: PresetAction[];
    disabled?: boolean;
    onPress: (a: PresetAction) => void;
};

export default function ActionGrid({ actions, disabled, onPress }: Props) {
    return (
        <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {actions.map((a) => (
                    <Pressable
                        key={a.id}
                        disabled={disabled}
                        onPress={() => onPress(a)}
                        style={({ pressed }) => ({
                            width: "48%",
                            paddingVertical: 14,
                            paddingHorizontal: 14,
                            borderRadius: 16,
                            backgroundColor: "rgba(20,20,20,0.9)",
                            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.08)",
                        })}
                    >
                        <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                            {a.label}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.55)", marginTop: 6, fontSize: 12 }}>
                            {a.request.type === "keypress" ? `key: ${a.request.key}` : `POST ${a.request.path}`}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}