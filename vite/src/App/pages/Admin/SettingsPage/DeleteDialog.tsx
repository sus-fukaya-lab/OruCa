import { Box, Button, CloseButton, Dialog, Portal, Text, VStack } from "@chakra-ui/react";
import React from "react";

type DeleteDialogProps = {
	trigger:React.ReactElement<HTMLButtonElement>;
	student_ID:string;
	student_Name:string|undefined;
	onApproved?:()=>void;
	onCanceled?:()=>void
}


const DeleteDialog:React.FC<DeleteDialogProps> = ({trigger,student_ID,student_Name,onApproved,onCanceled})=>{
	return (
		<Dialog.Root size={"sm"}>
			<Dialog.Trigger asChild>
				{trigger}
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>ユーザー削除の確認</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<VStack p={4} gapY={2} align={"flex-start"}>
								<Text fontWeight="bold" fontSize="lg" mb={2}>
									ユーザー
								</Text>
								<Box pl={6} mb={1}>
									<Text>ID: {student_ID}</Text>
									<Text>Name: {student_Name}</Text>
								</Box>
								<Text color="red.600" fontWeight="medium">
									以上を削除します。よろしいですか？
								</Text>
							</VStack>
						</Dialog.Body>
						<Dialog.Footer>
							<Button 
								variant="surface" 
								onClick={onApproved} 
								colorPalette={"red"}
							>DELETE</Button>
						</Dialog.Footer>
						<Dialog.CloseTrigger asChild>
							<CloseButton size="sm" onClick={onCanceled} />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

export default DeleteDialog;