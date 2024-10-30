import { 
  PlusCircleIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  DocumentTextIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  SwatchIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteSelected: () => void;
  selectedNodes: Node[];
  showSettings: boolean;
  onToggleSettings: () => void;
}

export default function Toolbar({ 
  onAddNode, 
  onDeleteSelected, 
  selectedNodes,
  showSettings,
  onToggleSettings
}: ToolbarProps) {
  const { zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();

  const downloadImage = useCallback(async (type: 'png' | 'svg') => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      const dataUrl = await (type === 'png' ? toPng(element) : toSvg(element));
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `mindmap.${type}`;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, []);

  const downloadPDF = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      const dataUrl = await toPng(element);
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('mindmap.pdf');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }, []);

  const downloadJSON = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const data = { nodes, edges };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={onAddNode}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Add Node"
      >
        <PlusCircleIcon className="w-5 h-5" />
      </button>

      <button
        onClick={onDeleteSelected}
        disabled={selectedNodes.length === 0}
        className={`p-2 rounded-lg ${
          selectedNodes.length === 0 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'hover:bg-gray-100'
        }`}
        title="Delete Selected"
      >
        <TrashIcon className="w-5 h-5" />
      </button>

      <button
        onClick={onToggleSettings}
        disabled={selectedNodes.length === 0}
        className={`p-2 rounded-lg ${
          selectedNodes.length === 0 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'hover:bg-gray-100'
        } ${showSettings ? 'bg-blue-50' : ''}`}
        title="Node Settings"
      >
        <SwatchIcon className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-200 my-auto mx-1" />

      <button
        onClick={() => downloadImage('png')}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Export as PNG"
      >
        <PhotoIcon className="w-5 h-5" />
      </button>

      <button
        onClick={() => downloadImage('svg')}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Export as SVG"
      >
        <DocumentDuplicateIcon className="w-5 h-5" />
      </button>

      <button
        onClick={downloadPDF}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Export as PDF"
      >
        <DocumentTextIcon className="w-5 h-5" />
      </button>

      <button
        onClick={downloadJSON}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Export as JSON"
      >
        <CodeBracketIcon className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-200 my-auto mx-1" />

      <button
        onClick={() => zoomIn()}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Zoom In"
      >
        <MagnifyingGlassPlusIcon className="w-5 h-5" />
      </button>

      <button
        onClick={() => zoomOut()}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Zoom Out"
      >
        <MagnifyingGlassMinusIcon className="w-5 h-5" />
      </button>
    </div>
  );
}