export function StickyFooter({ className }: { className?: string }) {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-30 flex h-8 items-center justify-center border-t border-indigo-900 bg-indigo-950 dark:border-gray-800 dark:bg-gray-950 ${className ?? ''}`}>
      <p className="text-xs text-indigo-300 dark:text-gray-500">
        © {new Date().getFullYear()} ShopFlow · Elaborada por{' '}
        <span className="font-semibold text-white dark:text-gray-300">Sherlock</span>
      </p>
    </footer>
  )
}
