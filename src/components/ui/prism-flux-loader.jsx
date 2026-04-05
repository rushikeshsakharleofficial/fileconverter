import { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';

const DEFAULT_STATUSES = ['Uploading', 'Parsing', 'Processing', 'Syncing', 'Preparing', 'Placing'];

export const PrismFluxLoader = ({
  size = 30,
  speed = 5,
  textSize = 13,
  statuses = DEFAULT_STATUSES,
}) => {
  const [time, setTime] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const items = useMemo(() => (statuses.length ? statuses.slice(0, 6) : DEFAULT_STATUSES), [statuses]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime((prev) => prev + 0.02 * speed);
    }, 16);

    return () => window.clearInterval(interval);
  }, [speed]);

  useEffect(() => {
    const statusInterval = window.setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % items.length);
    }, 600);

    return () => window.clearInterval(statusInterval);
  }, [items]);

  const half = size / 2;
  const currentStatus = items[statusIndex] || DEFAULT_STATUSES[0];
  const faceTransforms = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div className="prism-flux-loader">
      <div
        className="prism-flux-cube"
        style={{
          width: size,
          height: size,
          transform: `rotateY(${time * 30}deg) rotateX(${time * 30}deg)`,
        }}
      >
        {items.map((text, i) => (
          <div
            key={`${text}-${i}`}
            className="prism-flux-face"
            style={{
              width: size,
              height: size,
              transform: faceTransforms[i],
            }}
          >
            <PlusIcon size={Math.max(14, size * 0.45)} strokeWidth={2} />
          </div>
        ))}
      </div>

      <div className="prism-flux-status" style={{ fontSize: `${textSize}px` }}>
        {currentStatus}...
      </div>
    </div>
  );
};

export default PrismFluxLoader;
