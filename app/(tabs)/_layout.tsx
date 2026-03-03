import { Tabs } from "expo-router";
import { Home, SquareChevronUp } from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: "rgba(255,255,255,0.92)",
                tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
                tabBarStyle: {
                    backgroundColor: "#0b0b0d",
                    borderTopColor: "rgba(255,255,255,0.08)",
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Home color={color} size={size ?? 22} />
                    ),
                }}
            />
            <Tabs.Screen
                name="remote"
                options={{
                    title: "Remote",
                    tabBarIcon: ({ color, size }) => (
                        <SquareChevronUp color={color} size={size ?? 22} />
                    ),
                }}
            />
        </Tabs>
    );
}