import React, { useState, useEffect, useRef } from 'react';
import { GraphNode, GraphEdge, RelationshipGraphData } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Building2, FileText, UserCheck, Scale, FolderGit2 } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface RelationshipGraphProps {
  data: RelationshipGraphData;
  onSelectNode?: (node: GraphNode) => void;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ data, onSelectNode }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initial layout calculation (Circle force distribution)
  useEffect(() => {
    if (!data || !data.nodes) return;

    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const totalNodes = data.nodes.length;
    const layoutNodes = data.nodes.map((node, index) => {
      // Center tender node in middle
      if (node.type === 'TENDER') {
        return { ...node, x: centerX, y: centerY };
      }
      // Put companies in inner ring
      if (node.type === 'COMPANY') {
        const compNodes = data.nodes.filter((n) => n.type === 'COMPANY');
        const cIndex = compNodes.findIndex((n) => n.id === node.id);
        const angle = (cIndex / compNodes.length) * 2 * Math.PI;
        const radius = 170;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }
      // Put directors, projects, cases on outer ring
      const angle = (index / totalNodes) * 2 * Math.PI + 0.3;
      const radius = 260 + (index % 3) * 25;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    setNodes(layoutNodes);
    setEdges(data.edges || []);
    if (layoutNodes.length > 0 && !selectedNode) {
      setSelectedNode(layoutNodes[0]);
    }
  }, [data]);

  const filteredNodes = nodes.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const nodePosMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => {
    if (n.x !== undefined && n.y !== undefined) {
      nodePosMap.set(n.id, { x: n.x, y: n.y });
    }
  });

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'TENDER') return '#3b82f6'; // Blue
    if (node.type === 'DEPARTMENT') return '#6366f1'; // Indigo
    if (node.type === 'DIRECTOR') return '#8b5cf6'; // Purple
    if (node.type === 'PROJECT') return '#10b981'; // Emerald
    if (node.type === 'CASE') return '#ef4444'; // Red
    if (node.type === 'COMPANY') {
      if (node.riskLevel === 'CRITICAL') return '#e11d48'; // Rose
      if (node.riskLevel === 'HIGH') return '#ea580c'; // Orange
      if (node.riskLevel === 'MEDIUM') return '#d97706'; // Amber
      return '#059669'; // Emerald
    }
    return '#64748b';
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* Graph Toolbar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter Nodes:</span>
          <div className="flex flex-wrap items-center gap-1">
            {['ALL', 'COMPANY', 'DIRECTOR', 'PROJECT', 'CASE'].map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  filterType === ft
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ft === 'ALL' ? 'All Entities' : ft}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
        {/* Interactive SVG Canvas */}
        <div
          className="lg:col-span-3 bg-slate-950 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            className="w-full h-full min-h-[480px]"
            viewBox="0 0 800 500"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Edges */}
            {edges.map((edge) => {
              const src = nodePosMap.get(edge.source);
              const tgt = nodePosMap.get(edge.target);
              if (!src || !tgt) return null;

              const isSuspicious = edge.isSuspicious;
              const isCollusionEdge = edge.label === 'REPEATED_WITH';

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isCollusionEdge ? '#f43f5e' : isSuspicious ? '#fb923c' : '#475569'}
                    strokeWidth={isCollusionEdge ? 3 : isSuspicious ? 2 : 1.2}
                    strokeDasharray={isCollusionEdge ? '5 3' : isSuspicious ? '4 2' : undefined}
                    opacity={0.8}
                  />
                  {isCollusionEdge && (
                    <circle
                      cx={(src.x + tgt.x) / 2}
                      cy={(src.y + tgt.y) / 2}
                      r={7}
                      fill="#f43f5e"
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node);
              const isTender = node.type === 'TENDER';
              const radius = isTender ? 22 : node.type === 'COMPANY' ? 16 : 10;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Selection Ripple */}
                  {isSelected && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      className="animate-spin"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={radius}
                    fill={color}
                    stroke={isSelected ? '#ffffff' : '#1e293b'}
                    strokeWidth={2}
                    className="transition-all hover:scale-110 shadow-lg"
                  />

                  {/* Icon / Glyph */}
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill="#ffffff"
                    fontSize={isTender ? 11 : 9}
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {node.type === 'TENDER'
                      ? '🏛️'
                      : node.type === 'COMPANY'
                      ? '🏢'
                      : node.type === 'DIRECTOR'
                      ? '👤'
                      : node.type === 'PROJECT'
                      ? '🏗️'
                      : '⚖️'}
                  </text>

                  {/* Node Label */}
                  <text
                    y={radius + 12}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={10}
                    fontWeight="500"
                    className="drop-shadow-md pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-300 space-y-1">
            <div className="font-semibold text-slate-100 uppercase tracking-wider text-[9px]">Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Risk Co.
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical/High
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-rose-500" /> Collusion Syndicate Link
            </div>
          </div>
        </div>

        {/* Selected Entity Inspector Panel */}
        <div className="p-4 border-l border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Entity Inspector
            </div>

            {selectedNode ? (
              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {selectedNode.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                    {selectedNode.label}
                  </h3>
                </div>

                {selectedNode.riskLevel && (
                  <div className="pt-1">
                    <RiskBadge
                      score={
                        selectedNode.riskLevel === 'CRITICAL'
                          ? 88
                          : selectedNode.riskLevel === 'HIGH'
                          ? 74
                          : selectedNode.riskLevel === 'MEDIUM'
                          ? 45
                          : 18
                      }
                      level={selectedNode.riskLevel}
                    />
                  </div>
                )}

                {selectedNode.details && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 font-sans">
                    {Object.entries(selectedNode.details).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-slate-600">
                        <span className="capitalize text-slate-500">{key}:</span>
                        <span className="font-semibold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Specific Alerts if Suspicious Cluster Node */}
                {(selectedNode.id === 'comp_buildtech' || selectedNode.id === 'comp_construma') && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs text-rose-800 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-rose-900">
                      <AlertTriangle className="w-3.5 h-3.5" /> Collusive Pair Alert
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Tight co-participation with paired competitor. Synchronized submission within 114 seconds.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 text-center text-xs text-slate-400">
                Click on any node in the graph to inspect relationships and risk indicators.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            Total Entities: {nodes.length} | Relationships: {edges.length}
          </div>
        </div>
      </div>
    </div>
  );
};
