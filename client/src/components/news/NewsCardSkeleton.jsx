// Displayed while news is loading — matches the NewsCard layout exactly
export default function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-[16/9] skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="flex justify-between pt-3 border-t border-ink-50">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}
