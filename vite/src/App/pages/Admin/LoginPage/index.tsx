import CrossButton from "@components/CrossButton";
import HeadBar from "@components/HeadBar/HeadBar";
import LoginForm from "./LoginForm";

function LoginPage(){
	
	return (
		<HeadBar otherElements={[
			<CrossButton address={"/"}/>
		]}>
			<LoginForm/>
		</HeadBar>
	);
}
export default LoginPage;