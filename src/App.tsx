import { ReactFlowProvider } from 'reactflow';
import MindMap from './components/MindMap';
import 'reactflow/dist/style.css';

function App() {
  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <MindMap />
      </ReactFlowProvider>
    </div>
  );
}

export default App;