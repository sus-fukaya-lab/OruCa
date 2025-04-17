import HeadBar from "@components/HeadBar/HeadBar";
import HomeButton from "@components/HomeButton";
import LoginForm from "./LoginForm";

function LoginPage(){
	
	return (
		<HeadBar otherElements={[
			<HomeButton address={"/"}/>
		]}>
			<LoginForm/>
		</HeadBar>
	);
}
export default LoginPage;