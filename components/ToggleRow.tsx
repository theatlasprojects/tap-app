import { Pressable, Switch, Text, View } from "react-native";

type Props = {
    title: string;
    subtitle?: string;
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
};

export default function ToggleRow({ title, subtitle, value, onChange, disabled }: Props) {
    return (
        <Pressable
            onPress={() => !disabled && onChange(!value)}
            style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 16,
                backgroundColor: "rgba(20,20,20,0.90)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
            })}
        >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>
                        {title}
                    </Text>
                    {!!subtitle && (
                        <Text style={{ color: "rgba(255,255,255,0.60)", marginTop: 6, fontSize: 12 }}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                <Switch
                    value={value}
                    onValueChange={(v) => onChange(v)}
                    disabled={disabled}
                />
            </View>
        </Pressable>
    );
}