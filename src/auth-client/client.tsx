import React from "react";
import { createRoot } from "react-dom/client";
import { Center, ColorScheme, MantineProvider, MantineTheme, Paper } from "@mantine/core";
import { notifications, Notifications } from "@mantine/notifications";

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
	onError,
	onPageChange,
}: {
	loading?: boolean;
	page: Page;
	onAuthorizeRequest?: (email: string, password: string) => void;
	onError?: (error: Error) => void;
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
					onError={onError}
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
			setTimeout(() => (window.location.href = redirect_url.toString()), 3000);
			notifications.show({
				title: "Redirecting...",
				message: `You are being redirected to ${redirect_url.origin}`,
				color: "blue",
				loading: true,
				autoClose: false,
				withCloseButton: false,
			});
		} catch (error: unknown) {
			setLoading(false);
			if (error instanceof Error) handleError(error);
			else throw error;
		}
	};

	const handleError = (error: Error) =>
		notifications.show({ title: "Error", message: error.message, color: "red" });

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
			<Notifications />
			<Center h="100vh" sx={body_style}>
				<Paper p="lg" pos="relative" radius="lg" w={getPreferredWidth(page)}>
					<Router
						loading={loading}
						page={page}
						onAuthorizeRequest={handleAuthorizeRequest}
						onError={handleError}
						onPageChange={setPage}
					/>
				</Paper>
			</Center>
		</MantineProvider>
	);
};

createRoot(document.getElementById("root")).render(<Root />);
