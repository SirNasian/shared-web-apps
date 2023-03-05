import React from "react";
import { Box, Button, Flex, LoadingOverlay, PasswordInput, TextInput } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import config from "../config";
import { throwError } from "../../common/errors";

interface FormData {
	email: string;
	name: string;
	password: string;
}

export const RegistrationPage = ({
	loading: externalLoading,
	onCancel,
	onError,
	onSuccess,
}: {
	loading?: boolean;
	onCancel?: () => void;
	onError?: (error: Error) => void;
	onSuccess?: (email: string, password: string) => void;
}): React.ReactElement => {
	const [internalLoading, setInternalLoading] = React.useState<boolean>(false);
	const form: UseFormReturnType<FormData> = useForm({
		initialValues: {
			email: "",
			name: "",
			password: "",
		},
		validate: {
			email: (email) => (/^\S+@\S+$/.test(email) ? null : "Invalid email"),
			name: (name) => (/^\w([\w ]+\w)?$/.test(name) ? null : "Invalid display name"),
			password: (password) => (password ? null : "Password cannot be blank"),
		},
	});

	const loading = internalLoading || externalLoading;

	const handleSubmit = async (data: FormData) => {
		setInternalLoading(true);
		try {
			const count = Number(
				await window
					.fetch(new URL(`/api/user/count?email=${encodeURIComponent(data.email)}`, config.API_URL).toString())
					.then((response) => response.text().then((message) => ({ status: response.status, message: message })))
					.then(({ status, message }) => (status === 200 ? message : throwError(message)))
					.catch(onError)
			);
			if (count > 0) {
				form.setErrors({ email: "This email is already taken by another user" });
				return;
			}

			await window
				.fetch(new URL("/api/user/register", config.API_URL).toString(), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				})
				.then((response) => response.status === 200 || response.text().then((message) => throwError(message)))
				.catch(onError);

			notifications.show({
				title: "Success!",
				message: "You have been registered successfully!",
				color: "green",
			});

			onSuccess && onSuccess(data.email, data.password);
		} finally {
			setInternalLoading(false);
		}
	};

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
			<TextInput
				disabled={loading}
				label="Display Name"
				mt="xs"
				variant="filled"
				withAsterisk
				{...form.getInputProps("name")}
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
