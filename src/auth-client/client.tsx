import React from "react";
import { createRoot } from "react-dom/client";
import { Center, ColorScheme, MantineProvider, MantineTheme, Paper } from "@mantine/core";

import { LandingPage, RegistrationPage } from "./pages";

enum Page {
	LANDING = "landing",
	REGISTRATION = "registration",
	SIGNIN = "sign-in",
}

const body_style = (theme: MantineTheme) => ({
	background: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1],
});

const Router = ({ page, onPageChange }: { page: Page; onPageChange?: (page: Page) => void }): React.ReactElement => {
	switch (page) {
		case Page.LANDING:
			return (
				<LandingPage onRegister={() => onPageChange(Page.REGISTRATION)} onSignIn={() => onPageChange(Page.SIGNIN)} />
			);
		case Page.REGISTRATION:
			return (
				<RegistrationPage onCancel={() => onPageChange(Page.LANDING)} onSuccess={() => onPageChange(Page.LANDING)} />
			);
		default:
			return null;
	}
};

const Root = (): React.ReactElement => {
	const [theme] = React.useState<ColorScheme>("dark");
	const [page, setPage] = React.useState<Page>(Page.LANDING);

	const getPreferredWidth = (page: Page): string | undefined => {
		switch (page) {
			case Page.LANDING:
				return "250px";
			case Page.REGISTRATION:
				return "380px";
			default:
				return undefined;
		}
	};

	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: theme }}>
			<Center h="100vh" sx={body_style}>
				<Paper p="lg" radius="lg" w={getPreferredWidth(page)}>
					<Router page={page} onPageChange={setPage} />
				</Paper>
			</Center>
		</MantineProvider>
	);
};

createRoot(document.getElementById("root")).render(<Root />);
