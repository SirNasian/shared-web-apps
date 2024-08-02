import React from "react";
import { createRoot } from "react-dom/client";
import { Center, MantineProvider, Paper } from "@mantine/core";
import { notifications, Notifications } from "@mantine/notifications";

import config from "../common/client/config";
import { TokenResponse } from "../common/models";
import { root_style, theme } from "../common/styles";
import { LandingPage, RegistrationPage, SignInPage } from "./pages";
import "./polyfill";

enum Page {
	LANDING = "landing",
	REGISTRATION = "registration",
	SIGN_IN = "sign-in",
	SCOPE_APPROVAL = "scope-approval",
}

const Router = ({
	loading,
	page,
	onAuthorizeRequest,
	onError,
	onPageChange,
}: {
	loading?: boolean;
	page: Page;
	onAuthorizeRequest?: (username: string, password: string) => void;
	onError?: (error: Error) => void;
	onPageChange?: (page: Page) => void;
}): React.ReactElement => {
	switch (page) {
		case Page.LANDING:
			return (
				<LandingPage
					onRegister={() => onPageChange && onPageChange(Page.REGISTRATION)}
					onSignIn={() => onPageChange && onPageChange(Page.SIGN_IN)}
				/>
			);
		case Page.REGISTRATION:
			return (
				<RegistrationPage
					loading={loading}
					onCancel={() => onPageChange && onPageChange(Page.LANDING)}
					onError={onError}
					onSuccess={onAuthorizeRequest}
				/>
			);
		case Page.SIGN_IN:
			return (
				<SignInPage
					loading={loading}
					onAuthorizeRequest={onAuthorizeRequest}
					onCancel={() => onPageChange && onPageChange(Page.LANDING)}
				/>
			);
		default:
			return <></>;
	}
};

const Root = (): React.ReactElement => {
	const [page, setPage] = React.useState<Page>(Page.LANDING);
	const [loading, setLoading] = React.useState<boolean>(false);

	const handleAuthorizeRequest = async (username: string, password: string) => {
		setLoading(true);
		try {
			const url = new URL(window.location.href);
			const response_type: "code" | "token" = (url.searchParams.get("response_type") ?? "") as "code" | "token";
			const response: string | TokenResponse = await window
				.fetch(new URL(`/authorize`, config.API_URL).toString(), {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`,
					},
					body: `response_type=${response_type}`,
				})
				.then(async (response) => {
					if (response.status !== 200) throw new Error(await response.text());
					else if (response_type === "code") return await response.text();
					else if (response_type === "token") return await response.json();
					else return "";
				});

			const redirect_uri = new URL(url.searchParams.get("redirect_uri") ?? window.location.href);
			url.searchParams.has("state") && redirect_uri.searchParams.append("state", url.searchParams.get("state") ?? "");
			if (response_type === "code") redirect_uri.searchParams.append("code", response as string);
			else if (response_type === "token") {
				const { access_token, refresh_token, expires_in } = response as TokenResponse;
				redirect_uri.searchParams.append("access_token", access_token);
				redirect_uri.searchParams.append("refresh_token", refresh_token);
				redirect_uri.searchParams.append("expires_in", String(expires_in));
			}

			setTimeout(() => (window.location.href = redirect_uri.toString()), 3000);
			notifications.show({
				title: "Redirecting...",
				message: `You are being redirected to ${redirect_uri.origin}`,
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

	const handleError = (error: Error) => notifications.show({ title: "Error", message: error.message, color: "red" });

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
		<MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
			<Notifications />
			<Center h="100%" sx={root_style}>
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

const root = document.getElementById("root");
root && createRoot(root).render(<Root />);
