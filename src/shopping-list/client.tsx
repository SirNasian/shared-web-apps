import React from "react";
import { createRoot } from "react-dom/client";
import { Center, LoadingOverlay, MantineProvider, Paper } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { authorize } from "../common/client/api-requests";
import { root_style, theme } from "../common/styles";
import { EditorPage, OverviewPage } from "./pages";

enum Page {
	OVERVIEW = "overview",
	EDITOR = "editor",
}

const Router = ({
	page,
	onLoadingChange,
	onPageChange,
}: {
	page?: Page;
	onLoadingChange?: (loading: boolean) => void;
	onPageChange?: (page: Page) => void;
}): React.ReactElement => {
	const [list_id, setListID] = React.useState<string | undefined>(undefined);
	const handleSelectList = (list_id: string) => {
		setListID(list_id);
		onPageChange && onPageChange(Page.EDITOR);
	};
	switch (page) {
		case Page.OVERVIEW:
			return <OverviewPage onLoadingChange={onLoadingChange} onSelectList={handleSelectList} />;
		case Page.EDITOR:
			return <EditorPage list_id={list_id ?? ""} onLoadingChange={onLoadingChange} />;
		default:
			return <></>;
	}
};

const Root = (): React.ReactElement => {
	const [page, setPage] = React.useState<Page | undefined>(undefined);
	const [loading, setLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		setLoading(true);
		authorize().then(() => {
			setPage(Page.OVERVIEW);
			setLoading(false);
		});
	}, []);

	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
			<Notifications />
			<Center h="100%" sx={root_style}>
				<Paper
					mih="50%"
					mah="100%"
					p="lg"
					pos="relative"
					radius="lg"
					sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
					w="480px"
				>
					<LoadingOverlay visible={loading} />
					<Router page={page} onLoadingChange={setLoading} onPageChange={setPage} />
				</Paper>
			</Center>
		</MantineProvider>
	);
};

const root = document.getElementById("root");
root && createRoot(root).render(<Root />);
