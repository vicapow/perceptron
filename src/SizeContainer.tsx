import React, { useRef, useEffect, useState } from "react";

interface SizeProps {
  width: number;
  height: number;
}

interface ContainerProps {
  children: (size: SizeProps) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SizeContainer: React.FC<ContainerProps> = ({
  children,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<SizeProps>({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setSize({ width: offsetWidth, height: offsetHeight });
      }
    };

    handleResize(); // Initial measurement

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={className} style={style} ref={containerRef}>
      {children(size)}
    </div>
  );
};

export default SizeContainer;
