function HorizontalParkingSpot({ spotNumber, status, showLabel = true }) {
  const statusColors = {
    available: 'bg-[#22C55E] border-[#22C55E]',
    occupied: 'bg-[#EF4444] border-[#EF4444]',
    unknown: 'bg-[#9CA3AF] border-[#9CA3AF]',
  };

  return (
    <div
      className={`
        w-20 h-10 rounded-lg border-2 flex items-center justify-center
        ${statusColors[status]} text-white shadow-sm transition-all hover:scale-105
      `}
    >
      {showLabel && (
        <span className="text-xs font-medium">{spotNumber}</span>
      )}
    </div>
  );
}

export { HorizontalParkingSpot };

