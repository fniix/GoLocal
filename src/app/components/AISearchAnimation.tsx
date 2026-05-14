import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSound from 'use-sound';


const SCAN_SOUND = 'https://actions.google.com/sounds/v1/science_fiction/robot_code_computer_processing.ogg';
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';

interface AISearchAnimationProps {
  isSearching: boolean;
  algorithmStats: { visitedNodes: number; distanceKm: number | null; driverName?: string; found: boolean } | null;
  searchMessage: string;
}

export function AISearchAnimation({ isSearching, algorithmStats, searchMessage }: AISearchAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [displayNodes, setDisplayNodes] = useState(0);

  const [playScan, { stop: stopScan }] = useSound(SCAN_SOUND, { volume: 0.3, loop: true });
  const [playSuccess] = useSound(SUCCESS_SOUND, { volume: 0.6 });

  useEffect(() => {
    try {
      console.log('[AISearch] isSearching state change:', isSearching);
      if (isSearching) {
        playScan();
      } else {
        stopScan();
        if (algorithmStats?.found) {
          playSuccess();
        }
      }
    } catch (err) {
      console.error('[AISearch] Sound playback error:', err);
    }
    return () => {
      try {
        stopScan();
      } catch (err) {}
    };
  }, [isSearching, algorithmStats?.found, playScan, stopScan, playSuccess]);

  useEffect(() => {
    if (isSearching) {
      setDisplayNodes(0);
      const interval = setInterval(() => {
        setDisplayNodes(prev => prev + Math.floor(Math.random() * 100) + 20);
      }, 50);
      return () => clearInterval(interval);
    } else if (algorithmStats) {
      setDisplayNodes(algorithmStats.visitedNodes);
    }
  }, [isSearching, algorithmStats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // بناء شبكة (Grid) كأنها شوارع
    const cols = 25;
    const rows = 18;
    const cellW = width / cols;
    const cellH = height / rows;

    const grid: any[][] = [];
    for (let i = 0; i < cols; i++) {
      grid[i] = [];
      for (let j = 0; j < rows; j++) {
        // إزاحة بسيطة لإعطاء شكل خريطة واقعية غير منتظمة تماماً
        const offsetX = (Math.random() - 0.5) * (cellW * 0.4);
        const offsetY = (Math.random() - 0.5) * (cellH * 0.4);
        grid[i][j] = {
          i, j,
          x: i * cellW + cellW / 2 + offsetX,
          y: j * cellH + cellH / 2 + offsetY,
          neighbors: [],
          visited: false,
          parent: null
        };
      }
    }

    // ربط النقاط لتشكيل خريطة الشوارع (بإلغاء بعض الروابط عشوائياً لمحاكاة حواجز)
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (i < cols - 1 && Math.random() > 0.15) grid[i][j].neighbors.push(grid[i + 1][j]);
        if (i > 0 && Math.random() > 0.15) grid[i][j].neighbors.push(grid[i - 1][j]);
        if (j < rows - 1 && Math.random() > 0.15) grid[i][j].neighbors.push(grid[i][j + 1]);
        if (j > 0 && Math.random() > 0.15) grid[i][j].neighbors.push(grid[i][j - 1]);

        // طرق قطرية
        if (i < cols - 1 && j < rows - 1 && Math.random() > 0.6) grid[i][j].neighbors.push(grid[i + 1][j + 1]);
        if (i > 0 && j > 0 && Math.random() > 0.6) grid[i][j].neighbors.push(grid[i - 1][j - 1]);
      }
    }

    // تحديد نقطة البداية والنهاية
    const start = grid[2][rows - 3];
    const end = grid[cols - 4][3];

    let openSet = [start];
    let closedSet: any[] = [];
    let isDone = false;
    let path: any[] = [];

    start.visited = true;

    // حلقة الرسم
    const draw = () => {
      try {
        ctx.clearRect(0, 0, width, height);

        // رسم شبكة الشوارع الباهتة (الخريطة الخلفية)
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            let node = grid[i][j];
            for (let neighbor of node.neighbors) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(neighbor.x, neighbor.y);
              ctx.stroke();
            }
          }
        }

        // محاكاة خوارزمية البحث أثناء الانتظار
        if (isSearching && openSet.length > 0 && !isDone) {
          // تسريع العرض بمعالجة عدة نقاط في الإطار الواحد
          for (let k = 0; k < 6; k++) {
            if (openSet.length === 0) break;

            // خوارزمية A* (ترتيب حسب المسافة للهدف)
            openSet.sort((a, b) => {
              let distA = Math.hypot(a.x - (end?.x || 0), a.y - (end?.y || 0));
              let distB = Math.hypot(b.x - (end?.x || 0), b.y - (end?.y || 0));
              return distA - distB;
            });

            const current = openSet.shift();
            if (!current || !Array.isArray(current.neighbors)) {
              break;
            }
            closedSet.push(current);

            if (current === end) {
              isDone = true;
            }

            for (let neighbor of current.neighbors) {
              if (!neighbor.visited) {
                neighbor.visited = true;
                neighbor.parent = current;
                openSet.push(neighbor);
              }
            }
          }
        }

        // رسم المسارات المكتشفة (زرقاء)
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
        ctx.beginPath();
        for (let i = 1; i < closedSet.length; i++) {
          let node = closedSet[i];
          if (node.parent) {
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.parent.x, node.parent.y);
          }
        }
        ctx.stroke();

        // رسم النقطة الخضراء (البداية)
        ctx.fillStyle = '#22c55e'; // green-500
        ctx.beginPath();
        ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // رسم النقطة الحمراء (الهدف) في حال البحث
        if (end) {
          ctx.fillStyle = '#ef4444'; // red-500
          ctx.beginPath();
          ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // عند الانتهاء والنجاح في العثور على نتيجة
        if (!isSearching && algorithmStats?.found) {
          if (path.length === 0 && end) {
            // استخراج المسار من النهاية للبداية
            let temp = end;
            while (temp) {
              path.push(temp);
              temp = temp.parent;
            }
          }

          // رسم الخط الأصفر اللامع (المسار الأمثل)
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#eab308'; // yellow-500
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.beginPath();
          if (path.length > 0) {
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
              ctx.lineTo(path[i].x, path[i].y);
            }
          }
          ctx.stroke();

          // نقطة نهاية المسار صفراء (بدلاً من الحمراء)
          if (end) {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(end.x, end.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // تأثير توهج حول الهدف
            ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
            ctx.beginPath();
            ctx.arc(end.x, end.y, 16, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        requestRef.current = requestAnimationFrame(draw);
      } catch (err) {
        console.error('[AISearch] Animation frame error:', err);
      }
    };

    draw();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isSearching, algorithmStats]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#0c1220] border border-white/10 shadow-2xl shadow-black/40 font-sans">
      {/* رأس المكون - معلومات البحث */}
      <div className="p-4 border-b border-white/5 bg-black/40 relative z-10 flex flex-col items-center justify-center">
        <h3 className="text-white font-semibold tracking-wider text-sm uppercase flex items-center gap-2">
          A* Search <span className="text-white/40 capitalize">(Heuristic: Haversine)</span>
        </h3>

        <div className="flex w-full justify-around mt-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/40 font-bold tracking-widest">VISITED NODES</span>
            <span className="text-blue-400 font-mono text-xl mt-1 font-bold">
              {displayNodes.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/40 font-bold tracking-widest">DISTANCE</span>
            <span className="text-blue-400 font-mono text-xl mt-1 font-bold">
              {algorithmStats?.distanceKm ? `${algorithmStats.distanceKm.toFixed(2)} km` : (isSearching ? '---' : '0.00 km')}
            </span>
          </div>
        </div>
      </div>

      {/* الخريطة المتحركة */}
      <div className="relative h-64 w-full bg-[#050505]">
        {/* خلفية نقطية دقيقة */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* رسائل التنبيه فوق الخريطة */}
        <AnimatePresence>
          {!isSearching && algorithmStats?.found && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap backdrop-blur-md shadow-lg shadow-yellow-500/20"
            >
              Found: {algorithmStats.driverName}
            </motion.div>
          )}
          {!isSearching && algorithmStats && !algorithmStats.found && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/50 text-red-300 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap backdrop-blur-md shadow-lg shadow-red-500/20"
            >
              No available driver found
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* شريط الحالة السفلي */}
      <div className="p-4 bg-black/40 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isSearching ? 'bg-blue-500 animate-pulse' : (algorithmStats?.found ? 'bg-green-500' : 'bg-red-500')}`} />
          <p className="text-sm text-white/80">{searchMessage || 'Analyzing data...'}</p>
        </div>
      </div>
    </div>
  );
}
