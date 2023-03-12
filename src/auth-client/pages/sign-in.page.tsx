import React from "react";
import { Box, Button, Flex, LoadingOverlay, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

interface FormData {
	username: string;
	password: string;
}

export const SignInPage = ({
	loading,
	onCancel,
	onAuthorizeRequest,
}: {
	loading?: boolean;
	onCancel?: () => void;
	onAuthorizeRequest?: (username: string, password: string) => void;
}): React.ReactElement => {
	const form = useForm<FormData>({
		initialValues: {
			username: "",
			password: "",
		},
		validate: {
			username: (username) => (/^\w([\w.]*\w)?$/.test(username) ? null : "Invalid username"),
			password: (password) => (password ? null : "Password cannot be blank"),
		},
	});

	const handleSubmit = async (data: FormData) => onAuthorizeRequest && onAuthorizeRequest(data.username, data.password);

	const BackButton = ({ hidden }: { hidden: boolean }) =>
		hidden ? (
			<Box></Box>
		) : (
			<Button color="dark" disabled={loading} variant="subtle" onClick={onCancel}>
				Back
			</Button>
		);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<LoadingOverlay radius="lg" visible={loading} />
			<TextInput
				autoFocus
				disabled={loading}
				label="Username"
				variant="filled"
				withAsterisk
				{...form.getInputProps("username")}
			/>
			<PasswordInput
				disabled={loading}
				label="Password"
				mt="xs"
				variant="filled"
				withAsterisk
				{...form.getInputProps("password")}
			/>
			<Flex justify="space-between" mt="md">
				<BackButton hidden={loading} />
				<Button disabled={loading} type="submit">
					Register
				</Button>
			</Flex>
		</form>
	);
};
