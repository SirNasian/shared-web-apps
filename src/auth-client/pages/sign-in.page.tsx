import React from "react";
import { Box, Button, Flex, LoadingOverlay, PasswordInput, TextInput } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";

interface FormData {
	email: string;
	password: string;
}

export const SignInPage = ({
	loading,
	onCancel,
	onAuthorizeRequest,
}: {
	loading?: boolean;
	onCancel?: () => void;
	onAuthorizeRequest?: (email: string, password: string) => void;
}): React.ReactElement => {
	const form: UseFormReturnType<FormData> = useForm({
		initialValues: {
			email: "",
			password: "",
		},
		validate: {
			email: (email) => (/^\S+@\S+$/.test(email) ? null : "Invalid email"),
			password: (password) => (password ? null : "Password cannot be blank"),
		},
	});

	const handleSubmit = async (data: FormData) => onAuthorizeRequest && onAuthorizeRequest(data.email, data.password);

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
				label="Email"
				variant="filled"
				withAsterisk
				{...form.getInputProps("email")}
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
