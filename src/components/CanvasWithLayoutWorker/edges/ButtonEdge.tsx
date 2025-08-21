
import React from 'react';
import { getBezierPath, EdgeProps, useReactFlow } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useFlowStore } from '@/store/flow';
import styles from '../canvas-layout.module.css';

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const { deleteEdge } = useFlowStore.getState();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    deleteEdge(id);
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={24}
        height={24}
        x={labelX - 12}
        y={labelY - 12}
        className={styles.edgebuttonWrapper}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button className={styles.edgebutton} onClick={onEdgeClick}>
          <Trash2 size={12} />
        </button>
      </foreignObject>
    </>
  );
}
