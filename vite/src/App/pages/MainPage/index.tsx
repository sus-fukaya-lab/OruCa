import { Box } from "@chakra-ui/react";
import HeadBar from "@components/HeadBar/HeadBar";
import SettingButton from "@components/SettingButton";
import DataTable from "@pages/MainPage/DataTable";

function MainPage() {
	return (
		<>
			<HeadBar otherElements={[
				<SettingButton address="/admin" />
			]}>
				<Box
					w={"100%"}
					h={"100%"}
					p={4}
					px={"5%"}
					pt={"10%"}
				>
					<DataTable />
				</Box>
			</HeadBar>
		</>
	);
}

export default MainPage
