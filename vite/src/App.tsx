import './App.css';
import DataForm from './DataForm';
import DataTable from './DataTable';

function App() {
  return (
    <>
      <div style={{overflowY:"auto"}}>
        <h1>FeliCa読み取り記録</h1>
        <DataTable/>
        {/* <DataForm/> */}
      </div>
    </>
  );
}

export default App
