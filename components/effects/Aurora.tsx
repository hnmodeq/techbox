"use client";

import { Renderer, Program, Mesh, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AuroraProps = {
  colorStops?: [string, string, string] | string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
};

const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform float uBlend;
uniform vec3 uColorStops[3];
varying vec2 vUv;

float wave(vec2 uv, float t) {
  return sin((uv.x * 4.0 + t) + sin(uv.y * 3.0 + t * 0.7)) * 0.5 + 0.5;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.35;
  float w1 = wave(uv + vec2(0.0, sin(t) * 0.05), t);
  float w2 = wave(uv.yx + vec2(cos(t) * 0.08, 0.0), t * 1.25);
  float band = smoothstep(0.18, 0.88, uv.y + (w1 - 0.5) * uAmplitude * 0.45);
  vec3 c1 = mix(uColorStops[0], uColorStops[1], smoothstep(0.0, 1.0, w1));
  vec3 c2 = mix(c1, uColorStops[2], smoothstep(0.0, 1.0, w2));
  float alpha = smoothstep(0.0, 1.0, band) * uBlend;
  alpha *= smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.72, uv.y);
  gl_FragColor = vec4(c2, alpha);
}
`;

function colorToRgb(color: string): [number, number, number] {
  if (typeof window === "undefined") return [0.2, 0.35, 1];
  const el = document.createElement("span");
  el.style.color = color;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  el.remove();
  const nums = computed.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [59, 70, 246];
  return [nums[0] / 255, nums[1] / 255, nums[2] / 255];
}

export default function Aurora({
  colorStops = ["#001aff", "#00025a", "#3b46f6"],
  amplitude = 1,
  blend = 0.5,
  speed = 0.5,
  className,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    gl.canvas.style.pointerEvents = "none";
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uBlend: { value: blend },
        uColorStops: { value: colorStops.slice(0, 3).map(colorToRgb) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 0.016 * speed;
      program.uniforms.uTime.value = frame;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [amplitude, blend, speed, colorStops]);

  return <div ref={containerRef} className={cn("h-full w-full pointer-events-none", className)} aria-hidden="true" />;
}
