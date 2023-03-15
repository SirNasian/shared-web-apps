import React from "react";
import { Box, Button, Card, Checkbox, Divider, Flex, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { request } from "../../common/client/api-requests";

// TODO: relocate this
interface ShoppingList {
	id: string;
	name: string;
	owner: string;
	public: boolean;
}

const ShoppingListComponents = ({
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
				((search ?? "").trim() === "" || list.name.toLowerCase().includes((search ?? "").trim().toLowerCase())) && (
					<Card key={list.id} mb="md" sx={{ cursor: "pointer" }} onClick={() => onSelectList && onSelectList(list.id)}>
						{list.name}
					</Card>
				)
		)}
	</Box>
);

const CreateShoppingListModal = ({
	open,
	onClose,
	onListCreated,
	onLoadingChange,
}: {
	open: boolean;
	onClose?: () => void;
	onListCreated?: (list_id: string) => void;
	onLoadingChange?: (loading: boolean) => void;
}) => {
	const form = useForm<{ name: string; public: boolean }>({
		initialValues: {
			name: "",
			public: true,
		},
		validate: {
			name: (name) => (name.trim() === "" ? "Name cannot be blank!" : null),
		},
	});

	const handleSubmit = async (data: { name: string; public: boolean }) => {
		onLoadingChange && onLoadingChange(true);
		const list_ids = await request<string[]>("/api/shopping-list", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify([data]),
		});
		if (list_ids.length !== 1) throw new Error("Unexpected response");
		onLoadingChange && onLoadingChange(false);
		onListCreated && onListCreated(list_ids[0]);
		onClose && onClose();
		form.reset();
	};

	return (
		<Modal centered opened={open} title="Create Shopping List" onClose={onClose || (() => 0)}>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<TextInput placeholder="Name" withAsterisk {...form.getInputProps("name")} />
				<Flex mt="xs" justify="space-between">
					<Checkbox label="Public" {...form.getInputProps("public", { type: "checkbox" })} />
					<Button type="submit">Create</Button>
				</Flex>
			</form>
		</Modal>
	);
};

export const OverviewPage = ({
	onLoadingChange,
	onSelectList,
}: {
	onLoadingChange?: (loading: boolean) => void;
	onSelectList?: (list_id: string) => void;
}): React.ReactElement => {
	const [lists, setLists] = React.useState<ShoppingList[] | undefined>(undefined);
	const [search, setSearch] = React.useState<string>("");
	const [modalOpen, setModalOpen] = React.useState<boolean>(false);

	const loadShoppingLists = async () => {
		onLoadingChange && onLoadingChange(true);
		setLists(await request<ShoppingList[]>("/api/shopping-list"));
		onLoadingChange && onLoadingChange(false);
	};

	React.useEffect(() => {
		loadShoppingLists();
	}, []);

	const handleSearchChange = ({ currentTarget: { value } }: { currentTarget: { value: string } }) => setSearch(value);

	return (
		<>
			<ShoppingListComponents lists={lists ?? []} search={search} onSelectList={onSelectList} />
			<Divider hidden={!lists || lists.length === 0} mb="md" />
			<Flex>
				<TextInput placeholder="Search..." sx={{ flexGrow: 1 }} value={search} onChange={handleSearchChange} />
				<Button ml="sm" onClick={() => setModalOpen(true)}>
					Create
				</Button>
			</Flex>
			<CreateShoppingListModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onListCreated={loadShoppingLists}
				onLoadingChange={onLoadingChange}
			/>
		</>
	);
};
