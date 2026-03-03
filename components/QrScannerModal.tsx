"use client";

import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";
import { sendAction } from "../lib/api";
import type { ServerConfig } from "../lib/types";

type Props = {
    open: boolean;
    onClose: () => void;
    onPaired: (cfg: ServerConfig) => Promise<void> | void;
};

type PairPayload = {
    v: number;
    url: string;
    token: string;
    ts?: number;
};

function normalizeBaseUrl(input: string): string {
    const trimmed = input.trim();
    const withScheme =
        trimmed.startsWith("http://") || trimmed.startsWith("https://")
            ? trimmed
            : `http://${trimmed}`;

    return withScheme.replace(/\/+$/, "");
}

function parsePayload(data: string): ServerConfig {
    let parsed: PairPayload;
    try {
        parsed = JSON.parse(data) as PairPayload;
    } catch {
        throw new Error("QR code is not valid JSON.");
    }

    if (!parsed || parsed.v !== 1) throw new Error("Unsupported QR payload version.");
    if (!parsed.url || typeof parsed.url !== "string") throw new Error("Missing url in QR.");
    if (!parsed.token || typeof parsed.token !== "string") throw new Error("Missing token in QR.");

    const token = parsed.token.trim();
    if (!token) throw new Error("Token in QR is empty.");

    return {
        baseUrl: normalizeBaseUrl(parsed.url),
        token,
    };
}

export default function QrScannerModal({ open, onClose, onPaired }: Props) {
    const [permission, requestPermission] = useCameraPermissions();
    const [busy, setBusy] = useState(false);

    const handledRef = useRef(false);
    const sessionRef = useRef(0);

    useEffect(() => {
        if (open) {
            sessionRef.current += 1;
            handledRef.current = false;
            setBusy(false);
        } else {
            handledRef.current = false;
            setBusy(false);
        }
    }, [open]);

    const canScan = useMemo(() => open && !busy && !handledRef.current, [open, busy]);

    async function handleScan(result: BarcodeScanningResult) {
        if (!canScan) return;

        handledRef.current = true;
        setBusy(true);

        try {
            const cfg = parsePayload(result.data);

            // stop the camera first.
            onClose();

            // perform pairing (this is the only time the token is used).
            await sendAction(cfg, { type: "post", path: "/pair" });

            // save locally after successful pairing.
            await Promise.resolve(onPaired(cfg));

            Alert.alert("Paired", `Connected:\n${cfg.baseUrl}`, [{ text: "OK" }], {
                cancelable: true,
            });
        } catch (e) {
            handledRef.current = false;
            setBusy(false);
            Alert.alert("Pairing failed", (e as Error).message);
        }
    }

    useEffect(() => {
        if (open && !permission?.granted) {
            requestPermission();
        }
    }, [open, permission?.granted, requestPermission]);

    return (
        <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.65)",
                    justifyContent: "center",
                    padding: 18,
                }}
            >
                <View
                    style={{
                        borderRadius: 22,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.10)",
                        backgroundColor: "rgba(15,15,17,0.95)",
                    }}
                >
                    <View
                        style={{
                            padding: 14,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>
                                Scan pairing QR
                            </Text>
                            <Text
                                style={{
                                    color: "rgba(255,255,255,0.60)",
                                    marginTop: 6,
                                    fontSize: 12,
                                }}
                            >
                                Point at the QR on your desktop.
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => ({
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 999,
                                backgroundColor: "rgba(255,255,255,0.06)",
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.10)",
                                opacity: pressed ? 0.85 : 1,
                                alignSelf: "flex-start",
                            })}
                        >
                            <Text style={{ color: "rgba(255,255,255,0.80)", fontWeight: "700" }}>
                                Close
                            </Text>
                        </Pressable>
                    </View>

                    <View style={{ height: 420, backgroundColor: "black" }}>
                        {permission?.granted ? (
                            <>
                                <CameraView
                                    style={{ flex: 1 }}
                                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                                    onBarcodeScanned={canScan ? handleScan : undefined}
                                />

                                {busy && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "rgba(0,0,0,0.35)",
                                        }}
                                    >
                                        <ActivityIndicator />
                                        <Text style={{ color: "white", marginTop: 10, fontWeight: "700" }}>
                                            Pairing…
                                        </Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 18,
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "800" }}>
                                    Camera permission required
                                </Text>
                                <Text
                                    style={{
                                        color: "rgba(255,255,255,0.60)",
                                        marginTop: 8,
                                        textAlign: "center",
                                    }}
                                >
                                    Enable camera access to scan the QR code.
                                </Text>

                                <Pressable
                                    onPress={requestPermission}
                                    style={({ pressed }) => ({
                                        marginTop: 14,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        borderRadius: 16,
                                        backgroundColor: "rgba(80,180,255,0.18)",
                                        borderWidth: 1,
                                        borderColor: "rgba(80,180,255,0.35)",
                                        opacity: pressed ? 0.85 : 1,
                                    })}
                                >
                                    <Text style={{ color: "white", fontWeight: "800" }}>
                                        Grant permission
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}