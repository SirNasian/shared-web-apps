import React from "react";
import { createRoot } from "react-dom/client";
import { Center, LoadingOverlay, MantineProvider, Paper } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { root_style, theme } from "../common/styles";

enum Page {
	OVERVIEW = "overview",
	EDITOR = "editor",
}

const Router = ({
	page,
	onLoadingChange,
	onPageChange,
}: {
	page: Page;
	onLoadingChange?: (loading: boolean) => void;
	onPageChange?: (page: Page) => void;
}): React.ReactElement => {
	switch (page) {
		case Page.OVERVIEW:
		case Page.EDITOR:
		default:
			return null;
	}
};

const Root = (): React.ReactElement => {
	const [page, setPage] = React.useState<Page>(Page.EDITOR);
	const [loading, setLoading] = React.useState<boolean>(false);

	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
			<Notifications />
			<Center h="100vh" sx={root_style}>
				<Paper p="lg" pos="relative" radius="lg" w="480px">
					<LoadingOverlay visible={loading} />
					<Router page={page} onLoadingChange={setLoading} onPageChange={setPage} />
				</Paper>
			</Center>
		</MantineProvider>
	);
};

createRoot(document.getElementById("root")).render(<Root />);
