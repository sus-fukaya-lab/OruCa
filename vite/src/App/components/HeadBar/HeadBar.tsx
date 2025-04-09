import React from "react";
import {Heading, HStack, Icon, VStack ,Box} from "@chakra-ui/react";
import { FaAnchor } from "react-icons/fa";

type THeadBar = {
	otherElements?: React.ReactNode[]
	children?: React.ReactNode
};

const HeadBar: React.FC<THeadBar> = ({ otherElements, children }) => {
	return (
		<VStack
			pl={8}
			pr={8}
			w={"100vw"}
			h={"100vh"}
			gap={3}
		>
			<HStack
				w={"100%"}
				pt={3}
				justifyContent={"space-between"}
			>
				<VStack gapY={0}>
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
					<Heading size="md">FeliCa 在室管理システム</Heading>
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