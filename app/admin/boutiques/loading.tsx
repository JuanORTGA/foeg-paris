import React from 'react';

export default function AdminBoutiquesLoading() {
  return (
    <div className="space-y-8 animate-pulse p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-[#EBE7DF]" />
        <div className="h-8 w-64 bg-[#EBE7DF]" />
        <div className="h-4 w-96 bg-[#EBE7DF]" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-[#EBE7DF] border border-foeg-border/40" />
        ))}
      </div>
    </div>
  );
}
