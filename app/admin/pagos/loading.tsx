export default function AdminPagosLoading() {
  return (
    <div className="space-y-10 max-w-5xl animate-pulse pb-20">
      {/* Header */}
      <div className="border-b border-foeg-border/60 pb-6 flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-3 w-48 bg-[#EBE7DF]" />
          <div className="h-8 w-80 bg-[#EBE7DF]" />
          <div className="h-4 w-96 bg-[#EBE7DF]" />
        </div>
        <div className="h-8 w-40 bg-[#EBE7DF]" />
      </div>

      {/* 3 Blocks */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-foeg-border/70 p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-foeg-border/50 pb-4">
            <div className="w-8 h-8 bg-[#EBE7DF]" />
            <div className="space-y-2">
              <div className="h-5 w-60 bg-[#EBE7DF]" />
              <div className="h-3 w-80 bg-[#EBE7DF]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-36 bg-[#EBE7DF]" />
                <div className="h-10 w-full bg-[#F7F5F0] border border-[#EBE7DF]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
