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

    // Dynamic radius calculation: strictly adapts for 150% scale while preserving 100%, 125%, 4K, tablet, and mobile
    const getBaseRadius = () => {
      const currentWidth = container.clientWidth || window.innerWidth || width;
      const currentHeight = window.innerHeight || height;
      const currentDpr = window.devicePixelRatio || 1;

      // 1. Mobile phone devices (< 640px)
      if (currentWidth < 640) return 15;

      // 2. Strict check for 100% desktop scale (1080p @ 100%: dpr ~ 1.0, width >= 1500, height >= 800)
      const is100Scale =
        (Math.abs(currentDpr - 1.0) < 0.12 && currentWidth >= 1500) ||
        (currentWidth >= 1700 && currentHeight >= 820);

      // 3. Strict check for 125% desktop scale (1080p @ 125%: dpr ~ 1.25, width ~1536, height ~760)
      const is125Scale =
        Math.abs(currentDpr - 1.25) < 0.08 ||
        (currentWidth >= 1400 && currentWidth < 1700 && currentHeight >= 740);

      if (is100Scale || is125Scale) {
        return 26; // Default desktop size strictly preserved for 100% and 125% screens
      }

      // 4. Strict check for 150% scale:
      // - devicePixelRatio is ~1.5 (1.35 to 1.65)
      // - OR compact viewport height on 1080p displays at 150% Windows scaling (height <= 720px)
      const is150Scale =
        (currentDpr >= 1.35 && currentDpr <= 1.65) ||
        (currentHeight > 0 && currentHeight <= 720);

      if (is150Scale) {
        return 12; // Noticeably smaller tool size for 150% scale (diameter ~24px vs 52px)
      }

      // Tablet fallback (< 1024px at standard DPI)
      if (currentWidth < 1024) return 20;

      return 26; // Default desktop size
    };

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

    // Interactive Mouse & Touch Dragging + Cursor Scatter
    const syncMouseScale = (targetMouse: Matter.Mouse) => {
      const scaleX = canvas.clientWidth && canvas.width ? canvas.clientWidth / canvas.width : 1 / dpr;
      const scaleY = canvas.clientHeight && canvas.height ? canvas.clientHeight / canvas.height : 1 / dpr;
      Mouse.setScale(targetMouse, { x: scaleX, y: scaleY });
    };

    const mouse = Mouse.create(canvas);
    syncMouseScale(mouse);

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
    let lastPointerX: number | null = null;
    let lastPointerY: number | null = null;

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
        const hitRadius = activeBodies[i].radius + 8;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return true;
        }
      }
      return false;
    };

    const isInteractiveElement = (clientX: number, clientY: number) => {
      const target = document.elementFromPoint(clientX, clientY);
      if (!target) return false;
      if (target === canvas) return false;
      return Boolean(
        target.closest("a, button, input, textarea, select, form, label, [role='button']")
      );
    };

    Matter.Events.on(mouseConstraint, "startdrag", () => {
      isDragging = true;
      canvas.style.zIndex = "40";
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

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (isInteractiveElement(e.clientX, e.clientY)) return;

      if (isPointOverTool(e.clientX, e.clientY)) {
        syncMouseScale(mouse);
        canvas.style.zIndex = "40";
        canvas.style.pointerEvents = "auto";
        canvas.style.cursor = "grabbing";

        // If pointerdown started before pointermove lifted the canvas above footer wrapper, forward mousedown to Matter.Mouse
        if (e.target !== canvas && (mouse as any).mousedown) {
          (mouse as any).mousedown({
            pageX: e.pageX,
            pageY: e.pageY,
            button: e.button,
            preventDefault: () => {},
          });
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        lastPointerX = null;
        lastPointerY = null;
        if (canvas.style.pointerEvents !== "none") {
          canvas.style.zIndex = "10";
          canvas.style.pointerEvents = "none";
          canvas.style.cursor = "default";
        }
        return;
      }

      // Always prioritize navigation links, inputs, and buttons so user can click & type seamlessly
      if (isInteractiveElement(e.clientX, e.clientY)) {
        lastPointerX = null;
        lastPointerY = null;
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
        return;
      }

      // Apply responsive cursor-hover scatter & spin whenever moving the cursor across tools (without holding)
      if (lastPointerX !== null && lastPointerY !== null) {
        const vxCursor = x - lastPointerX;
        const vyCursor = y - lastPointerY;
        const speed = Math.hypot(vxCursor, vyCursor);

        if (speed >= 0.4) {
          const clampedVx = Math.max(-20, Math.min(20, vxCursor));
          const clampedVy = Math.max(-20, Math.min(20, vyCursor));

          for (let i = 0; i < activeBodies.length; i++) {
            const item = activeBodies[i];
            const b = item.body;
            const dx = b.position.x - x;
            const dy = b.position.y - y;
            const interactRadius = item.radius + 34;
            const distSq = dx * dx + dy * dy;

            if (distSq <= interactRadius * interactRadius) {
              const dist = Math.sqrt(distSq);
              const nx = dist > 0.01 ? dx / dist : clampedVx >= 0 ? 1 : -1;
              const ny = dist > 0.01 ? dy / dist : -1;
              const falloff = Math.max(0.25, 1 - dist / interactRadius);

              const pushX = nx * (3.2 * falloff) + clampedVx * 0.55 * falloff;
              const pushY = ny * (3.2 * falloff) + clampedVy * 0.55 * falloff - 2.2 * falloff;

              Body.setVelocity(b, {
                x: Math.max(-18, Math.min(18, b.velocity.x + pushX)),
                y: Math.max(-18, Math.min(18, b.velocity.y + pushY)),
              });
              Body.setAngularVelocity(
                b,
                Math.max(-0.25, Math.min(0.25, b.angularVelocity + (clampedVx * 0.008 + nx * 0.04) * falloff))
              );
            }
          }
        }
      }
      lastPointerX = x;
      lastPointerY = y;

      if (isPointOverTool(e.clientX, e.clientY)) {
        syncMouseScale(mouse);
        canvas.style.zIndex = "40";
        canvas.style.pointerEvents = "auto";
        canvas.style.cursor = "grab";
      } else {
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
      }
    };

    const onPointerLeave = () => {
      lastPointerX = null;
      lastPointerY = null;
      if (!isDragging && canvas) {
        canvas.style.zIndex = "10";
        canvas.style.pointerEvents = "none";
        canvas.style.cursor = "default";
      }
    };

    container.addEventListener("pointerdown", onPointerDownCapture, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    // Responsive touch interaction: allows dragging physics tools while preserving native page touch & typing
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Never block touches on navigation links, inputs, or buttons
      if (isInteractiveElement(touch.clientX, touch.clientY)) {
        return;
      }

      if (isPointOverTool(touch.clientX, touch.clientY)) {
        isDragging = true;
        syncMouseScale(mouse);
        canvas.style.zIndex = "40";
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
        const currentRadius = getBaseRadius();
        const r = currentRadius * (0.92 + Math.random() * 0.16);
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

          // Soft drop shadow scaled to tool radius
          ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
          ctx.shadowBlur = r < 18 ? 6 : 10;
          ctx.shadowOffsetY = r < 18 ? 2.5 : 4;

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
        if (entry.isIntersecting && entry.intersectionRatio >= 0.05) {
          if (!hasSpawned) {
            spawnTools();
          }
        } else if (entry.intersectionRatio === 0) {
          // Scrolled completely away from footer: reset so it falls again next time
          clearTools();
          hasSpawned = false;
        }
      },
      { threshold: [0, 0.05, 0.2] }
    );
    observer.observe(container);

    // Responsive window resize & dynamic scale adaptation
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (isDisposed || !container || !canvas) return;
        width = container.clientWidth;
        height = container.clientHeight;
        const nextDpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * nextDpr);
        canvas.height = Math.round(height * nextDpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(nextDpr, nextDpr);
        }

        syncMouseScale(mouse);

        Body.setPosition(floor, {
          x: width / 2,
          y: height + floorThickness / 2 - 8,
        });
        Body.setPosition(rightWall, {
          x: width + wallThickness / 2,
          y: height / 2,
        });

        // Automatically respawn tools if window scale or target tool size changes
        const currentTargetRadius = getBaseRadius();
        if (activeBodies.length > 0 && Math.abs(activeBodies[0].radius - currentTargetRadius) > 3) {
          clearTools();
          hasSpawned = false;
          spawnTools();
        }
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
      container.removeEventListener("pointerdown", onPointerDownCapture, { capture: true });
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
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
      {/* Footer Content: Top 5-columns navigation (z-30) + Giant NETOPSYS AI text (z-0) */}
      <div className="w-full relative pointer-events-none">{children}</div>

      {/* Foreground Canvas: Falling & Stacked 2D Physics Tools */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-10"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}

