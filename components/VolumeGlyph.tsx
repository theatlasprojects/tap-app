import { Minus, Plus, Volume as VolumeIcon } from "lucide-react-native";
import { View } from "react-native";

type Props = {
    variant: "plus" | "minus";
};

export default function VolumeGlyph({ variant }: Props) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <VolumeIcon color="white" size={22} />
            <View style={{ marginLeft: -10 }}>
                {variant === "plus" ? (
                    <Plus color="white" size={14} />
                ) : (
                    <Minus color="white" size={14} />
                )}
            </View>
        </View>
    );
}