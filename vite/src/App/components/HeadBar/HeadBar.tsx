import React from "react";
import {Heading, HStack, Icon, VStack ,Box,Text} from "@chakra-ui/react";
import { FaAnchor } from "react-icons/fa";

type THeadBar = {
	otherElements?: React.ReactNode[]
	children?: React.ReactNode
};

const HeadBar: React.FC<THeadBar> = ({ otherElements, children }) => {
	return (
		<VStack
			w={"100vw"}
			h={"100vh"}
			gap={0}
		>
			<HStack
				w={"100%"}
				px={4}
				py={3}
				justifyContent={"space-between"}
				borderBottomWidth={1}
				shadow={"xs"}
			>
				<VStack gap={0}>
					<HStack
						w={"100%"}
						gap={2}
					>
						<Icon
							size={"xl"}>
							<FaAnchor
								width={"100%"}
								height={"100%"}
							/>
						</Icon>
						<Heading
							size="4xl"
							pb={1}
						>OruCa</Heading>
					</HStack>
					<Text fontFamily={"monospace"} fontSize={"sm"} fontWeight={"semibold"}>FeliCa 在室管理システム</Text>
				</VStack>
				{otherElements?.map((e,index) => (
					<React.Fragment key={`HeadBarOtherElements-${index}`}>
						{e}
					</React.Fragment>
				))}
			</HStack>
			<Box w={"100%"} h={"100%"}>
				{children}
			</Box>
		</VStack>
	);
}

export default HeadBar;