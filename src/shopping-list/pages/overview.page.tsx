import React from "react";

export const OverviewPage = ({
	onLoadingChange,
	onSelectList,
}: {
	onLoadingChange?: (loading: boolean) => void;
	onSelectList?: (list_id: string) => void;
}): React.ReactElement => {
	return <>Overview Page</>;
};
