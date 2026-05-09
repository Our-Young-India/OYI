import React, { useEffect, useRef, useState } from "react";

export default function CountUp({ end = 0, duration = 1800, suffix = "", prefix = "", testid }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTs = performance.now();
          const animate = (now) => {
            const t = Math.min(1, (now - startTs) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.floor(eased * end));
            if (t < 1) requestAnimationFrame(animate);
            else setValue(end);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = value >= 1000 ? `${Math.floor(value / 1000)}K${value % 1000 >= 500 ? "+" : (end >= 1000 && value === end ? "+" : "")}` : value;

  return (
    <span ref={ref} data-testid={testid} className="font-cinzel font-bold tabular-nums">
      {prefix}{end >= 1000 ? formatted : value}{end < 1000 ? suffix : ""}
    </span>
  );
}
