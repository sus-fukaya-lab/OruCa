import DataTable from "@pages/MainPage/DataTable";
import HeadBar from "@components/HeadBar/HeadBar";
import SettingButton from "@components/SettingButton";

function MainPage() {
	return (
		<>
			<HeadBar otherElements={[
				<SettingButton address="/admin"/>
			]}>
				<DataTable />
			</HeadBar>
		</>
	);
}

export default MainPage
