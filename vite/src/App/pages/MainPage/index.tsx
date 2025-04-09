import DataTable from "@components/DataTable";
import { Box,VStack,Text} from "@chakra-ui/react";
import HeadBar from "@components/HeadBar/HeadBar";
import SettingButton from "@components/SettingButton";

function MainPage() {
	return (
		<>
			<HeadBar otherElements={[
				<SettingButton address="/admin"/>
			]}>
				<Box>
					<DataTable />
				</Box>
			</HeadBar>
		</>
	);
}

export default MainPage
