import React from "react";
import { Box, Button, Card, Divider, Flex, TextInput } from "@mantine/core";

import config from "../config";

// TODO: relocate this
interface ShoppingList {
	id: string;
	name: string;
	owner: string;
	public: boolean;
}

const ShoppingListsComponent = ({
	lists,
	search,
	onSelectList,
}: {
	lists: ShoppingList[];
	search?: string;
	onSelectList?: (list_id: string) => void;
}): React.ReactElement => (
	<Box sx={{ overflowY: "auto", scrollbarWidth: "none" }}>
		{lists.map(
			(list) =>
				((search ?? "").trim() === "" || list.name.toLowerCase().includes(search.trim().toLowerCase())) && (
					<Card key={list.id} mb="md" sx={{ cursor: "pointer" }} onClick={() => onSelectList(list.id)}>
						{list.name}
					</Card>
				)
		)}
	</Box>
);

export const OverviewPage = ({
	onLoadingChange,
	onSelectList,
}: {
	onLoadingChange?: (loading: boolean) => void;
	onSelectList?: (list_id: string) => void;
}): React.ReactElement => {
	const [lists, setLists] = React.useState<ShoppingList[]>([]);
	const [search, setSearch] = React.useState<string>("");
	React.useEffect(() => {
		(async () => {
			onLoadingChange(true);
			const response = await window.fetch(new URL("/api/shopping-list", config.API_URL));
			if (response.status !== 200) throw new Error(await response.text());
			setLists(await response.json());
			onLoadingChange(false);
		})();
	}, []);

	const handleSearchChange = ({ currentTarget: { value } }: { currentTarget: { value: string } }) => setSearch(value);

	return (
		<Flex direction="column" w="100%">
			<ShoppingListsComponent lists={lists ?? []} search={search} onSelectList={onSelectList} />
			<Divider hidden={!lists || lists.length === 0} mb="md" />
			<Flex justify="flex-end">
				<TextInput mr="sm" placeholder="Search..." sx={{ flexGrow: 1 }} value={search} onChange={handleSearchChange} />
				<Button>Create</Button>
			</Flex>
		</Flex>
	);
};
