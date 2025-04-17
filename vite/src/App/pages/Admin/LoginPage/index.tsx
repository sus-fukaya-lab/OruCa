import HeadBar from "@components/HeadBar/HeadBar";
import ReturnButton from "@components/ReturnButton";
import LoginForm from "./LoginForm";

function LoginPage(){
	
	return (
		<HeadBar otherElements={[
			<ReturnButton address={"/"}/>
		]}>
			<LoginForm/>
		</HeadBar>
	);
}
export default LoginPage;