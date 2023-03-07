import { MantineTheme, MantineThemeOverride } from "@mantine/core";

export const root_style = (theme: MantineTheme) => ({
	background: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1],
});

export const theme: MantineThemeOverride = { colorScheme: "dark", loader: "dots" };
