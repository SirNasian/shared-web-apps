import React from "react";
import { Button, Flex, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

interface FormData {
	email: string;
	display_name: string;
	password: string;
}

export const RegistrationPage = ({
	onCancel,
	onSuccess,
}: {
	onCancel?: () => void;
	onSuccess?: () => void;
}): React.ReactElement => {
	const form = useForm({
		initialValues: {
			email: "",
			display_name: "",
			password: "",
		},
		validate: {
			email: (email) => (/^\S+@\S+$/.test(email) ? null : "Invalid email"),
			display_name: (display_name) => (/^\w([\w ]+\w)?$/.test(display_name) ? null : "Invalid display name"),
			password: (password) => (password ? null : "Password cannot be blank"),
		},
	});

	const handleSubmit = (form: FormData) => {
		// TODO: implement this
		console.log(form);
		onSuccess();
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<TextInput label="Email" variant="filled" withAsterisk {...form.getInputProps("email")} />
			<TextInput label="Display Name" mt="xs" variant="filled" withAsterisk {...form.getInputProps("display_name")} />
			<PasswordInput label="Password" mt="xs" variant="filled" withAsterisk {...form.getInputProps("password")} />
			<Flex justify="space-between" mt="md">
				<Button color="dark" variant="subtle" onClick={onCancel}>
					Back
				</Button>
				<Button type="submit">Register</Button>
			</Flex>
		</form>
	);
};
