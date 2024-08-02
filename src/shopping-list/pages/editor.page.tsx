import React from "react";
import {
	ActionIcon,
	Box,
	Button,
	Checkbox,
	Flex,
	Input,
	Modal,
	NumberInput,
	Paper,
	Text,
	TextInput,
	createStyles,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@mantine/form";

import { request } from "../../common/client/api-requests";

// TODO: relocate this
interface ShoppingListItem {
	id: string;
	list_id: string;
	name: string;
	quantity: number;
	checked: boolean;
}

const useStyles = createStyles((theme) => ({
	page: {
		minHeight: "50vh",
		overflowY: "scroll",
	},
	fab: {
		position: "absolute",
		bottom: theme.spacing.md,
		right: theme.spacing.md,
		zIndex: 1000,
	},
}));

const ItemComponent = ({
	checked,
	item_id,
	name,
	quantity,
	onChecked,
	onClick,
}: {
	checked: boolean;
	item_id: string;
	name: string;
	quantity: number;
	onChecked?: (item_id: string, checked: boolean) => void;
	onClick?: (item_id: string) => void;
}): React.ReactElement => {
	const handleCheckboxChange = (event: {
		currentTarget: { checked: boolean };
		preventDefault: () => void;
		stopPropagation: () => void;
	}) => {
		onChecked && onChecked(item_id, event.currentTarget.checked);
	};
	return (
		<Paper withBorder p="xs" sx={{ cursor: "pointer" }} onClick={() => onClick && onClick(item_id)}>
			<Flex align="center">
				<Checkbox
					mr="md"
					checked={checked}
					onChange={handleCheckboxChange}
					onClick={(event) => event.stopPropagation()}
				/>
				<Text sx={{ flexGrow: 1 }}>{name}</Text>
				<Text>x{quantity}</Text>
			</Flex>
		</Paper>
	);
};

const ItemListComponent = ({
	items,
	onChecked,
	onClick,
}: {
	items: ShoppingListItem[];
	onChecked?: (item_id: string, checked: boolean) => void;
	onClick?: (item_id: string) => void;
}): React.ReactElement => (
	<>
		{items.map((item) => (
			<ItemComponent
				key={item.id}
				item_id={item.id}
				checked={item.checked}
				name={item.name}
				quantity={item.quantity}
				onChecked={onChecked}
				onClick={onClick}
			/>
		))}
	</>
);

const ItemEditorModal = ({
	item,
	open,
	onClose,
	onEdited,
}: {
	item?: ShoppingListItem;
	open: boolean;
	onClose?: () => void;
	onEdited?: (item: ShoppingListItem) => void;
}): React.ReactElement => {
	const form = useForm<ShoppingListItem>({
		initialValues: item,
		validate: { name: (name) => (name.trim() === "" ? "Name cannot be blank!" : null) },
	});

	React.useEffect(() => {
		item && form.setValues(item);
	}, [item]);

	return (
		<Modal centered opened={open} title="Edit Item" onClose={onClose || (() => 0)}>
			<form onSubmit={form.onSubmit(onEdited || (() => 0))}>
				<Input type="hidden" {...form.getInputProps("id")} />
				<Input type="hidden" {...form.getInputProps("list_id")} />
				<TextInput withAsterisk mb="xs" placeholder="Name" {...form.getInputProps("name")} />
				<NumberInput withAsterisk hideControls mb="xs" placeholder="Quantity" {...form.getInputProps("quantity")} />
				<Flex justify="space-between">
					<Checkbox label="Obtained" {...form.getInputProps("checked", { type: "checkbox" })} />
					<Button type="submit">Update</Button>
				</Flex>
			</form>
		</Modal>
	);
};

const CreateItemFAB = (): React.ReactElement => {
	const { classes } = useStyles();
	return (
		<ActionIcon className={classes.fab}>
			<IconPlus />
		</ActionIcon>
	);
};

export const EditorPage = ({
	list_id,
	onLoadingChange,
}: {
	list_id: string;
	onLoadingChange?: (loading: boolean) => void;
}): React.ReactElement => {
	const [items, setItems] = React.useState<ShoppingListItem[] | undefined>(undefined);
	const [selectedItem, setSelectedItem] = React.useState<ShoppingListItem | undefined>(undefined);

	const { classes } = useStyles();

	const loadItems = async () => {
		onLoadingChange && onLoadingChange(true);
		setItems(await request<ShoppingListItem[]>(`/api/shopping-list/${list_id}/items`));
		onLoadingChange && onLoadingChange(false);
	};

	React.useEffect(() => {
		loadItems();
	}, []);

	const handleItemChecked = (item_id: string, checked: boolean) => {
		onLoadingChange && onLoadingChange(true);
		request(`/api/shopping-list/${list_id}/items/${item_id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ checked }),
		})
			.then(() => {
				items && setItems(items.map((item) => ({ ...item, checked: item.id === item_id ? checked : item.checked })));
				onLoadingChange && onLoadingChange(false);
			})
			.catch((error) => console.error(error)); // TODO: better exception handling
	};

	const handleItemEdited = (updated_item: ShoppingListItem): void => {
		setSelectedItem(undefined);
		onLoadingChange && onLoadingChange(true);
		request(`/api/shopping-list/${list_id}/items/${updated_item.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updated_item),
		})
			.then(() => {
				items &&
					setItems(items.map((original_item) => (original_item.id === updated_item.id ? updated_item : original_item)));
				onLoadingChange && onLoadingChange(false);
			})
			.catch((error) => console.error(error)); // TODO: better exception handling
	};

	return (
		<Box className={classes.page}>
			<ItemListComponent
				items={items ?? []}
				onChecked={handleItemChecked}
				onClick={(item_id) => setSelectedItem((items ?? []).find((item) => item.id === item_id) ?? undefined)}
			/>
			<ItemEditorModal
				open={Boolean(selectedItem)}
				item={selectedItem}
				onClose={() => setSelectedItem(undefined)}
				onEdited={handleItemEdited}
			/>
			<CreateItemFAB />
		</Box>
	);
};
