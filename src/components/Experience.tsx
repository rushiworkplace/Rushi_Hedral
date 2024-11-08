import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import Model from "./Model";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Web3D from "./Web3D";

type ExperienceProps = {
  hovered: boolean;
  setHovered: React.Dispatch<React.SetStateAction<boolean>>;
  color: string;
  pos: number;
  sceneRef: React.RefObject<HTMLDivElement>;
};

// Define the types for the exported variables
export let web3DObj: any | null;
export let threeContainer: any | null;

const Experience: React.FC<ExperienceProps> = ({ hovered, setHovered, color, pos, sceneRef }) => {
  threeContainer = useRef<HTMLDivElement | null>(null);
  web3DObj = useRef<Web3D | null>(null);

  useEffect(() => {
    if (threeContainer.current) return;
    web3DObj.current = new Web3D();
  }, [hovered, color, pos]);

  return <div ref={sceneRef} />;
};

export default Experience;
