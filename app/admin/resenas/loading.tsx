export default function AdminResenasLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-foeg-border/60 pb-6">
        <div>
          <div className="h-8 w-64 bg-[#EBE7DF] rounded-none mb-2" />
          <div className="h-4 w-96 bg-[#EBE7DF] rounded-none" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-[#EBE7DF] rounded-none" />
        </div>
      </div>

      {/* Métricas / Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-[#F7F5F0] border border-foeg-border/60 space-y-3">
            <div className="h-3 w-24 bg-[#EBE7DF]" />
            <div className="h-7 w-16 bg-[#EBE7DF]" />
          </div>
        ))}
      </div>

      {/* Tabla de Reseñas */}
      <div className="border border-foeg-border/60 bg-white">
        <div className="p-4 border-b border-foeg-border/60 bg-[#F7F5F0] flex justify-between">
          <div className="h-4 w-32 bg-[#EBE7DF]" />
          <div className="h-4 w-20 bg-[#EBE7DF]" />
        </div>
        <div className="divide-y divide-foeg-border/40">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-[#EBE7DF]" />
                  <div className="h-4 w-32 bg-[#EBE7DF]" />
                </div>
                <div className="h-3 w-3/4 bg-[#EBE7DF]" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-20 bg-[#EBE7DF]" />
                <div className="h-8 w-8 bg-[#EBE7DF]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
