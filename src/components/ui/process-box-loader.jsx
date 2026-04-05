const BOX_COUNT = Array.from({ length: 8 }, (_, index) => index);

const ProcessBoxLoader = ({ className = '' }) => (
  <div className={`process-box-loader ${className}`.trim()} aria-hidden="true">
    {BOX_COUNT.map((index) => (
      <div key={index} className={`process-box process-box-${index}`}>
        <div />
      </div>
    ))}
    <div className="process-box-ground">
      <div />
    </div>
  </div>
);

export default ProcessBoxLoader;
