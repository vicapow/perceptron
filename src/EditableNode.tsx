import * as React from "react";
import { Point } from "./bezier";
import { pad } from "./format";

export function EditableNode({
  value,
  editable,
  minValue,
  maxValue,
  onChange,
  fontSize,
  cx,
  cy,
  r,
  className,
  textClassName,
  showTease,
  label,
}: {
  value: number;
  editable: boolean;
  minValue: number;
  maxValue: number;
  onChange: (details: { value: number }) => void;
  fontSize: number;
  radius?: number;
  cx: number;
  cy: number;
  r: number;
  className: string;
  textClassName: string;
  showTease: boolean;
  label?: string;
}) {
  const elementRef = React.useRef<SVGCircleElement>(null);
  const mouseStartRef = React.useRef<Point | undefined>(undefined);
  const [mouseStart, setMouseStart] = React.useState<Point | undefined>(
    undefined,
  );
  const originalValueRef = React.useRef<number | undefined>(undefined);
  const onChangeRef =
    React.useRef<(details: { value: number }) => void>(onChange);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    mouseStartRef.current = mouseStart;
  }, [mouseStart]);

  React.useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    function moveWindow(e: MouseEvent) {
      moveMouse(e);
    }
    function touchMoveWindow(e: TouchEvent) {
      touchMove(e);
    }
    function mouseUp(e: MouseEvent) {
      window.removeEventListener("mousemove", moveWindow, false);
      window.removeEventListener("mouseup", mouseUp, false);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    function touchEnd(e: TouchEvent) {
      window.removeEventListener("touchmove", touchMoveWindow, false);
      window.removeEventListener("touchend", touchEnd, false);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    function mouseDown(e: MouseEvent) {
      e.preventDefault();
      window.addEventListener("mousemove", moveWindow, false);
      window.addEventListener("mouseup", mouseUp, false);
    }
    function touchStart(e: TouchEvent) {
      e.preventDefault();
      window.addEventListener("touchmove", touchMoveWindow, false);
      window.addEventListener("touchend", touchEnd, false);
    }
    elementRef.current.addEventListener("mousedown", mouseDown);
    elementRef.current.addEventListener("touchstart", touchStart);
    return () => {
      elementRef.current?.removeEventListener("mousedown", mouseDown);
      elementRef.current?.removeEventListener("touchstart", touchStart);
    };
  }, [elementRef.current]);

  function start(point: Point, e: React.UIEvent) {
    if (!editable) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setMouseStart(point);
    originalValueRef.current = value;
    return false;
  }

  function touchStart(e: React.TouchEvent<SVGCircleElement>) {
    const touch: React.Touch | undefined = e.touches[0];
    if (!touch) {
      return false;
    }
    return start([touch.clientX, touch.clientY], e);
  }

  function startMouse(e: React.MouseEvent<SVGElement, MouseEvent>) {
    return start([e.clientX, e.clientY], e);
  }

  function move(mousePos: Point, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!mouseStartRef.current || originalValueRef.current === undefined) {
      return false;
    }
    let oVal = originalValueRef.current;
    const mouseStart = mouseStartRef.current;
    const mouseEnd = mousePos;
    const dx = mouseEnd[0] - mouseStart![0];
    const dy = mouseEnd[1] - mouseStart![1];
    let sign = dx !== 0 ? dx / Math.abs(dx) : 1;
    const multiplier = ((Math.sqrt(dx * dx + dy * dy) / r) * sign) / 20;
    if (oVal === 0) {
      oVal = 0.01;
    }
    let newValue = oVal + multiplier;
    if (newValue > maxValue) {
      newValue = maxValue;
    }
    if (newValue < minValue) {
      newValue = minValue;
    }
    if (onChangeRef.current) {
      onChangeRef.current({ value: newValue });
    }
    return false;
  }

  function moveMouse(e: MouseEvent) {
    return move([e.clientX, e.clientY], e);
  }

  function touchMove(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) {
      return false;
    }
    return move([touch.clientX, touch.clientY], e);
  }

  return (
    <g transform={`translate(${cx},${cy})`}>
      {editable ? (
        <circle
          fill="rgba(0, 0, 0, 0.1)"
          className={`${showTease ? "animate-ping" : ""}`}
          ref={elementRef}
          r={r * 0.8}
          style={{ touchAction: "none", pointerEvents: "none" }}
        />
      ) : null}
      <circle
        className={className}
        ref={elementRef}
        r={r}
        onMouseDown={startMouse}
        onTouchStart={touchStart}
        style={{
          cursor: editable ? "ew-resize" : "not-allowed",
          touchAction: "none",
        }}
      />
      <text
        y={fontSize * 0.4}
        fontSize={fontSize}
        className={textClassName}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          textDecoration: editable ? "underline" : "none",
        }}
        textAnchor="middle"
      >
        {pad(value)}
      </text>
      {label && (
        <text
          x={-fontSize * 2 + 5}
          y={fontSize * 0.4}
          fontSize={fontSize}
          className={textClassName}
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
          textAnchor="end"
        >
          {label}
        </text>
      )}
    </g>
  );
}
