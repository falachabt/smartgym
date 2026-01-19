import { Stack } from "expo-router";

export default function MachineLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[qr_code]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
