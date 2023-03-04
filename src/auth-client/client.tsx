import React from "react";
import { createRoot } from "react-dom/client";
import { Button, Center, ColorScheme, Divider, MantineProvider, MantineTheme, Paper } from "@mantine/core";

const body_style = (theme: MantineTheme) => ({
	background: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1],
});

const Root = (): React.ReactElement => {
	const [theme] = React.useState<ColorScheme>("dark");
	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: theme }}>
			<Center h="100vh" sx={body_style}>
				<Paper p="lg" radius="lg" w="250px">
					<Button fullWidth variant="filled" color="blue">
						Sign In
					</Button>
					<Divider mb="sm" mt="sm" />
					<Button fullWidth variant="filled" color="dark">
						Register
					</Button>
				</Paper>
			</Center>
		</MantineProvider>
	);
};

createRoot(document.getElementById("root")).render(<Root />);
