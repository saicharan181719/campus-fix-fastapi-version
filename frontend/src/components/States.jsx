import React from 'react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-container">
      <div className="spinner" />
      <span className="state-desc">{message}</span>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-container">
      <div className="state-icon">⚠️</div>
      <div className="state-title">Error</div>
      <div className="state-desc">{message}</div>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📋', title = 'Nothing here', desc = '', action }) {
  return (
    <div className="state-container">
      <div className="state-icon">{icon}</div>
      <div className="state-title">{title}</div>
      {desc && <div className="state-desc">{desc}</div>}
      {action}
    </div>
  );
}
