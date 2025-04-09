import './App.css';
import DataForm from '../DataForm/DataForm';
import DataTable from '../DataTable/DataTable';

function App() {
  return (
    <>
      <div style={{overflowY:"auto",height:"100%"}}>
        <h1>FeliCa読み取り記録</h1>
        <DataTable/>
        {/* <DataForm/> */}
      </div>
    </>
  );
}

export default App
