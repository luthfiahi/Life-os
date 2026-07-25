/**
 * Life OS — Module Placeholder Page
 * Used for all modules not yet implemented.
 * AppShell is provided by the (dashboard)/layout.tsx
 */

interface ModulePlaceholderProps {
  moduleName: string
  description: string
  sprintNumber: number
}

export default function ModulePlaceholderPage({
  moduleName,
  description,
  sprintNumber,
}: ModulePlaceholderProps) {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="rounded-[var(--radius-xl)] border border-[var(--c-border)] bg-[var(--c-card)] p-8 max-w-md shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-accent)]/10">
            <span className="text-lg font-bold text-[var(--c-accent)]">
              {sprintNumber}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--c-text)] mb-2">{moduleName}</h2>
          <p className="text-sm text-[var(--c-text-muted)] mb-4">
            {description}
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--c-surface)] px-3 py-1 text-xs text-[var(--c-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-accent)]" />
            Akan tersedia di Sprint {sprintNumber}
          </div>
        </div>
      </div>
    </div>
  )
}