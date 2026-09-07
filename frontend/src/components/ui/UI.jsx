import React from 'react';

export function PageHeader({
  eyebrow = 'BLUI',
  title,
  description,
  action,
  children,
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-base-ink md:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-base-ink/55">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  description,
  icon,
  trend,
  loading = false,
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-base-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-base-ink/50">{label}</p>

          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-base-fog" />
          ) : (
            <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-base-ink">
              {value ?? '—'}
            </p>
          )}

          {description && (
            <p className="mt-1 text-xs text-base-ink/40">{description}</p>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-fog text-base-ink/60">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 text-xs font-medium text-brand-600">
          {trend}
        </div>
      )}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-base-fog text-base-ink/60',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title = 'Ainda não existem dados',
  description = 'Quando houver atividade, ela aparecerá aqui.',
  action,
}) {
  return (
    <div className="rounded-xl border border-dashed border-black/10 bg-base-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-base-fog text-base-ink/40">
        —
      </div>

      <h3 className="mt-4 text-sm font-semibold text-base-ink">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-ink/50">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-xl bg-base-white border border-black/5"
        />
      ))}
    </div>
  );
}

export function ErrorState({
  message = 'Não foi possível carregar estes dados.',
  onRetry,
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6">
      <p className="text-sm font-medium text-red-700">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-base-white shadow-xl">
        <div className="border-b border-black/5 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-base-ink">
                {title}
              </h2>

              {description && (
                <p className="mt-1 text-sm text-base-ink/50">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-lg text-base-ink/40 hover:bg-base-fog hover:text-base-ink"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="border-t border-black/5 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}) {
  const variants = {
    primary:
      'bg-base-ink text-white hover:bg-black',
    secondary:
      'border border-black/10 bg-base-white text-base-ink hover:bg-base-fog',
    brand:
      'bg-brand-500 text-white hover:bg-brand-600',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
    ghost:
      'text-base-ink/60 hover:bg-base-fog hover:text-base-ink',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
