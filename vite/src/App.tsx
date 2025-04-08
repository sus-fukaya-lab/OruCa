import './App.css';
import DataForm from './DataForm';
import DataTable from './DataTable';

function App() {
  return (
    <>
      <div style={{overflowY:"auto"}}>
        <h1>ユーザーデータ</h1>
        <DataTable/>
        <DataForm/>
      </div>
    </>
  );
}

export default App
