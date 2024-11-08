import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import Experience from "./Experience";

type SceneProps = {
  hovered: boolean;
  setHoverred: React.Dispatch<React.SetStateAction<boolean>>;
  color: string;
};

const Scene: React.FC<SceneProps> = ({ hovered, setHoverred, color }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 700);
  const [pos, setPos] = useState<number>(-1);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setPos(isMobile ? -0.5 : -1);
  }, [isMobile]);

  return (
    <div id="3d-container" ref={sceneRef} style={{ width: "100%", height: "100%" }}>
      <Experience
        hovered={hovered}
        setHovered={setHoverred}
        color={color}
        pos={pos}
        sceneRef={sceneRef}
      />
    </div>
  );
};

export default Scene;
