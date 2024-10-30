import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import Toolbar from './Toolbar/Toolbar';
import NodeSettings from './Toolbar/NodeSettings';
import { NodeData } from '../types';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'custom',
    data: { 
      label: 'Main Topic',
      shape: 'rectangle',
      backgroundColor: 'white',
      textColor: 'black',
      size: 'medium'
    },
    position: { x: 250, y: 250 },
  },
];

export default function MindMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addChildNode = useCallback(() => {
    const parentNode = selectedNodes[0] || nodes[0];
    const newNode = {
      id: `${Date.now()}`,
      type: 'custom',
      data: { 
        label: 'New Topic',
        shape: 'rectangle',
        backgroundColor: 'white',
        textColor: 'black',
        size: 'medium'
      },
      position: {
        x: parentNode.position.x + 250,
        y: parentNode.position.y,
      },
    };

    const newEdge = {
      id: `e${parentNode.id}-${newNode.id}`,
      source: parentNode.id,
      target: newNode.id,
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  }, [nodes, selectedNodes, setNodes, setEdges]);

  const onSelectionChange = useCallback(
    (params: { nodes: Node<NodeData>[] }) => {
      setSelectedNodes(params.nodes);
      if (params.nodes.length === 0) {
        setShowSettings(false);
      }
    },
    []
  );

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    setNodes((nds) => nds.filter((node) => !selectedNodes.find((n) => n.id === node.id)));
    setEdges((eds) => 
      eds.filter((edge) => 
        !selectedNodes.find((node) => 
          node.id === edge.source || node.id === edge.target
        )
      )
    );
    setSelectedNodes([]);
    setShowSettings(false);
  }, [selectedNodes, setNodes, setEdges]);

  const updateSelectedNodes = useCallback((updates: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        selectedNodes.find((n) => n.id === node.id)
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            }
          : node
      )
    );
  }, [selectedNodes, setNodes]);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (selectedNodes.length === 0) return;
      
      // Handle image paste
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onloadend = () => {
            updateSelectedNodes({ image: reader.result as string });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [selectedNodes, updateSelectedNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <Toolbar 
            onAddNode={addChildNode}
            onDeleteSelected={deleteSelectedNodes}
            selectedNodes={selectedNodes}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
          />
        </Panel>
        {showSettings && (
          <Panel position="top-left" className="top-20">
            <NodeSettings
              selectedNodes={selectedNodes}
              onUpdateNodes={updateSelectedNodes}
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}