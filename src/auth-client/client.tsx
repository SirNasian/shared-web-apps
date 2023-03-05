import React from "react";
import { createRoot } from "react-dom/client";
import { Center, ColorScheme, MantineProvider, MantineTheme, Paper } from "@mantine/core";

import config from "./config";
import { throwError } from "../common/errors";
import { LandingPage, RegistrationPage, SignInPage } from "./pages";
import "./polyfill";

enum Page {
	LANDING = "landing",
	REGISTRATION = "registration",
	SIGN_IN = "sign-in",
	SCOPE_APPROVAL = "scope-approval",
}

const body_style = (theme: MantineTheme) => ({
	background: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1],
});

const Router = ({
	loading,
	page,
	onAuthorizeRequest,
	onPageChange,
}: {
	loading?: boolean;
	page: Page;
	onAuthorizeRequest?: (email: string, password: string) => void;
	onPageChange?: (page: Page) => void;
}): React.ReactElement => {
	switch (page) {
		case Page.LANDING:
			return (
				<LandingPage onRegister={() => onPageChange(Page.REGISTRATION)} onSignIn={() => onPageChange(Page.SIGN_IN)} />
			);
		case Page.REGISTRATION:
			return (
				<RegistrationPage
					loading={loading}
					onCancel={() => onPageChange(Page.LANDING)}
					onSuccess={onAuthorizeRequest}
				/>
			);
		case Page.SIGN_IN:
			return (
				<SignInPage
					loading={loading}
					onAuthorizeRequest={onAuthorizeRequest}
					onCancel={() => onPageChange(Page.LANDING)}
				/>
			);
		default:
			return null;
	}
};

const Root = (): React.ReactElement => {
	const [theme] = React.useState<ColorScheme>("dark");
	const [page, setPage] = React.useState<Page>(Page.LANDING);
	const [loading, setLoading] = React.useState<boolean>(false);

	const handleAuthorizeRequest = async (username: string, password: string) => {
		setLoading(true);
		try {
			const url = new URL(window.location.href);
			const code = await window
				.fetch(new URL(`/authorize`, config.API_URL).toString(), {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`,
					},
					body: `response_type=${url.searchParams.get("response_type") ?? ""}`,
				})
				.then((response) => response.text().then((message) => ({ status: response.status, message })))
				.then(({ status, message }) => (status === 200 ? message : throwError(message)));
			const redirect_url = new URL(url.searchParams.get("redirect_uri") ?? window.location.href);
			redirect_url.searchParams.append("code", code);
			url.searchParams.has("state") && redirect_url.searchParams.append("state", url.searchParams.get("state"));
			window.location.href = redirect_url.toString();
		} catch (error: unknown) {
			setLoading(false);
			throw error;
		}
	};

	const getPreferredWidth = (page: Page): string | undefined => {
		switch (page) {
			case Page.LANDING:
				return "250px";
			case Page.REGISTRATION:
			case Page.SIGN_IN:
				return "380px";
			default:
				return undefined;
		}
	};

	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: theme, loader: "dots" }}>
			<Center h="100vh" sx={body_style}>
				<Paper p="lg" pos="relative" radius="lg" w={getPreferredWidth(page)}>
					<Router loading={loading} page={page} onAuthorizeRequest={handleAuthorizeRequest} onPageChange={setPage} />
				</Paper>
			</Center>
		</MantineProvider>
	);
};

createRoot(document.getElementById("root")).render(<Root />);
