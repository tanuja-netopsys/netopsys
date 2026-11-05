import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

// List of actual company tools & technologies used at Netopsys AI
const TOOL_IMAGES = [
  { name: "OpenAI", src: "/tools/openai.svg" },
  { name: "Python", src: "/tools/tool-7.png" },
  { name: "TensorFlow", src: "/tools/tensorflow.svg" },
  { name: "PyTorch", src: "/tools/pytorch.svg" },
  { name: "React", src: "/tools/tool-19.png" },
  { name: "Next.js", src: "/tools/nextjs.svg" },
  { name: "TypeScript", src: "/tools/tool-22.png" },
  { name: "JavaScript", src: "/tools/tool-20.png" },
  { name: "Docker", src: "/tools/tool-4.png" },
  { name: "Kubernetes", src: "/tools/tool-9.png" },
  { name: "AWS", src: "/tools/tool-16.png" },
  { name: "Google Cloud", src: "/tools/tool-5.png" },
  { name: "Azure", src: "/tools/tool-23.png" },
  { name: "PostgreSQL", src: "/tools/postgresql.svg" },
  { name: "MongoDB", src: "/tools/tool-3.png" },
  { name: "Redis", src: "/tools/redis.svg" },
  { name: "Node.js", src: "/tools/tool-17.png" },
  { name: "GitHub", src: "/tools/github.svg" },
  { name: "C#", src: "/tools/tool-6.png" },
  { name: ".NET", src: "/tools/tool-8.png" },
  { name: "GraphQL", src: "/tools/graphql.svg" },
  { name: "Apache Kafka", src: "/tools/kafka.svg" },
  { name: "Tailwind CSS", src: "/tools/tailwind.svg" },
  { name: "Tool 1", src: "/tools/tool-1.png" },
  { name: "Tool 2", src: "/tools/tool-2.png" },
  { name: "Tool 10", src: "/tools/tool-10.png" },
  { name: "Tool 11", src: "/tools/tool-11.png" },
  { name: "Tool 12", src: "/tools/tool-12.png" },
  { name: "Tool 13", src: "/tools/tool-13.png" },
  { name: "Tool 14", src: "/tools/tool-14.png" },
  { name: "Tool 15", src: "/tools/tool-15.png" },
  { name: "Tool 18", src: "/tools/tool-18.png" },
  { name: "Tool 21", src: "/tools/tool-21.png" },
];

interface FallingToolsPhysicsProps {
  children?: React.ReactNode;
}

interface ActiveToolBody {
  body: Matter.Body;
  img: HTMLImageElement;
  radius: number;
}

export default function FallingToolsPhysics({ children }: FallingToolsPhysicsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isDisposed = false;
    let spawnTimer: number | null = null;
    let animId: number | null = null;

    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body } = Matter;

    // Create 2D Physics Engine with gentle, graceful gravity
    const engine = Engine.create();
    engine.gravity.y = 0.9;
    engine.gravity.scale = 0.001;

    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 700;
    const isMobile = width < 640;
    const isTablet = width < 1024;
    const baseRadius = isMobile ? 16 : isTablet ? 22 : 26;

    // High DPI setup for crystal crisp logos on Retina/4K
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Static physics boundaries: Floor & Side Walls
    const floorThickness = 60;
    const wallThickness = 60;
    const floor = Bodies.rectangle(
      width / 2,
      height + floorThickness / 2 - 8,
      width * 2,
      floorThickness,
      {
        isStatic: true,
        friction: 0.6,
        restitution: 0.32,
      }
    );
    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height * 4,
      { isStatic: true }
    );
    const rightWall = Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height * 4,
      { isStatic: true }
    );

    Composite.add(engine.world, [floor, leftWall, rightWall]);

    // Preload tool images
    const toolPool = [...TOOL_IMAGES, ...TOOL_IMAGES];
    const totalToSpawn = isMobile ? 24 : isTablet ? 36 : 50;
    const selectedTools = toolPool.slice(0, totalToSpawn).sort(() => Math.random() - 0.5);

    const loadedImages: HTMLImageElement[] = [];
    let imagesReady = false;

    Promise.all(
      selectedTools.map((tool) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = tool.src;
        });
      })
    ).then((imgs) => {
      if (isDisposed) return;
      loadedImages.push(...imgs);
      imagesReady = true;
    });

    const activeBodies: ActiveToolBody[] = [];

    // Interactive Mouse & Touch Dragging
    const mouse = Mouse.create(canvas);
    // Correct mouse position for High DPI and Windows Display Scaling
    Mouse.setScale(mouse, { x: 1 / dpr, y: 1 / dpr });

    // Remove wheel event listeners so page scrolling is never blocked
    canvas.removeEventListener("wheel", (mouse as any).mousewheel);
    canvas.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);
    canvas.removeEventListener("touchmove", (mouse as any).mousemove);
    canvas.removeEventListener("touchstart", (mouse as any).mousedown);
    canvas.removeEventListener("touchend", (mouse as any).mouseup);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.25,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    let isDragging = false;

    // Fast distance hit-test to check if cursor/touch is directly over an active physics tool
    const isPointOverTool = (clientX: number, clientY: number) => {
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return false;

      for (let i = 0; i < activeBodies.length; i++) {
        const b = activeBodies[i].body;
        const dx = x - b.position.x;
        const dy = y - b.position.y;
        const hitRadius = activeBodies[i].radius + 6;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return true;
        }
      }
      return false;
    };

    Matter.Events.on(mouseConstraint, "startdrag", () => {
      isDragging = true;
      canvas.style.zIndex = "30";
      canvas.style.pointerEvents = "auto";
      canvas.style.cursor = "grabbing";
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      isDragging = false;
      canvas.style.cursor = "grab";
      setTimeout(() => {
        if (!isDragging && canvas) {
          canvas.style.zIndex = "10";
          canvas.style.pointerEvents = "none";
          canvas.style.cursor = "default";
        }
      }, 40);
    });

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) return;

      // Always prioritize navigation links, inputs, and buttons so user can click & type seamlessly
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (
        target &&
        (target.closest("a, button, input, textarea, form, label") ||
          target.tagName === "INPUT" ||
          target.tagName === "BUTTON" ||
          target.tagName === "A")
      ) {
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
        return;
      }

      if (isPointOverTool(e.clientX, e.clientY)) {
        canvas.style.zIndex = "25";
        canvas.style.pointerEvents = "auto";
        canvas.style.cursor = "grab";
      } else {
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
      }
    };

    const onPointerLeave = () => {
      if (!isDragging && canvas) {
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
      }
    };

    container.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerleave", onPointerLeave);

    // Responsive touch interaction: allows dragging physics tools while preserving native page touch & typing
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Never block touches on navigation links, inputs, or buttons
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (
        target &&
        (target.closest("a, button, input, textarea, form, label") ||
          target.tagName === "INPUT" ||
          target.tagName === "BUTTON" ||
          target.tagName === "A")
      ) {
        return;
      }

      if (isPointOverTool(touch.clientX, touch.clientY)) {
        isDragging = true;
        canvas.style.zIndex = "25";
        canvas.style.pointerEvents = "auto";

        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        (mouse as any).position.x = x;
        (mouse as any).position.y = y;
        (mouse as any).mousedownPosition.x = x;
        (mouse as any).mousedownPosition.y = y;
        (mouse as any).button = 0;

        if ((mouse as any).mousedown) {
          (mouse as any).mousedown({
            pageX: touch.pageX,
            pageY: touch.pageY,
            button: 0,
            preventDefault: () => {},
          });
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      if (e.cancelable) {
        e.preventDefault();
      }

      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      (mouse as any).position.x = x;
      (mouse as any).position.y = y;

      if ((mouse as any).mousemove) {
        (mouse as any).mousemove({
          pageX: touch.pageX,
          pageY: touch.pageY,
          preventDefault: () => {},
        });
      }
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      if (canvas) {
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
      }
      if ((mouse as any).mouseup) {
        (mouse as any).mouseup({
          preventDefault: () => {},
        });
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const runner = Runner.create();
    Runner.run(runner, engine);

    // Spawning cascade: tools drop from above NETOPSYS AI text one by one
    let hasSpawned = false;

    const clearTools = () => {
      if (spawnTimer) {
        window.clearInterval(spawnTimer);
        spawnTimer = null;
      }
      if (activeBodies.length > 0) {
        Composite.remove(
          engine.world,
          activeBodies.map((a) => a.body)
        );
        activeBodies.length = 0;
      }
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };

    const spawnTools = () => {
      if (hasSpawned) return;
      if (!imagesReady) {
        setTimeout(spawnTools, 80);
        return;
      }
      hasSpawned = true;
      clearTools();

      // Distribute spawn points across the entire width
      const slotCount = selectedTools.length;
      const slots = Array.from({ length: slotCount }, (_, i) => (i + 0.5) / slotCount).sort(
        () => Math.random() - 0.5
      );

      let spawnIndex = 0;
      const spawnInterval = isMobile ? 75 : 60; // ms interval between falling tools

      spawnTimer = window.setInterval(() => {
        if (isDisposed || spawnIndex >= selectedTools.length) {
          if (spawnTimer) window.clearInterval(spawnTimer);
          return;
        }

        const img = loadedImages[spawnIndex % loadedImages.length];
        const r = baseRadius * (0.92 + Math.random() * 0.16);
        const padding = r + 20;
        const targetX =
          padding + slots[spawnIndex] * Math.max(1, width - padding * 2) + (Math.random() - 0.5) * r;
        const startY = -r - 10; // Spawns from top above NETOPSYS AI letters

        const body = Bodies.circle(targetX, startY, r, {
          restitution: 0.32, // Bouncy when landing on floor or other tools
          friction: 0.5,
          frictionAir: 0.02, // Gentle slow fall through gravity like pengwinsolutions
          density: 0.002,
        });

        // Slight natural drift & rotation
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 1.2,
          y: 1.6,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);

        Composite.add(engine.world, body);
        activeBodies.push({ body, img, radius: r });

        spawnIndex++;
      }, spawnInterval);
    };

    // Physics render loop
    const renderLoop = () => {
      if (isDisposed) return;

      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < activeBodies.length; i++) {
          const item = activeBodies[i];
          const { x, y } = item.body.position;
          const angle = item.body.angle;
          const r = item.radius;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);

          // Soft drop shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 4;

          // Draw tool icon
          if (item.img && item.img.complete && item.img.naturalWidth > 0) {
            ctx.drawImage(item.img, -r, -r, r * 2, r * 2);
          } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Intersection observer triggers tool rain EVERY TIME footer scrolls into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          if (!hasSpawned) {
            spawnTools();
          }
        } else if (entry.intersectionRatio === 0) {
          // Scrolled completely away from footer: reset so it falls again next time
          clearTools();
          hasSpawned = false;
        }
      },
      { threshold: [0, 0.2] }
    );
    observer.observe(container);

    // Responsive window resize
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (isDisposed || !container || !canvas) return;
        width = container.clientWidth;
        height = container.clientHeight;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }

        Mouse.setScale(mouse, { x: 1 / dpr, y: 1 / dpr });

        Body.setPosition(floor, {
          x: width / 2,
          y: height + floorThickness / 2 - 8,
        });
        Body.setPosition(rightWall, {
          x: width + wallThickness / 2,
          y: height / 2,
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      if (spawnTimer) window.clearInterval(spawnTimer);
      if (animId) cancelAnimationFrame(animId);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden pb-2"
    >
      {/* Footer Content: Top 5-columns navigation + Giant NETOPSYS AI text */}
      <div className="w-full relative z-30 pointer-events-auto">{children}</div>

      {/* Foreground Canvas: Falling & Stacked 2D Physics Tools */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-10 transition-[z-index] duration-75"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}

