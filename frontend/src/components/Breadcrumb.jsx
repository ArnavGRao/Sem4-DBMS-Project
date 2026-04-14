import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-slate-300">/</span>}
          {item.href ? (
            <Link
              to={item.href}
              className="rounded-full border border-slate-200 bg-white/75 px-3 py-1 text-slate-600 transition-colors hover:border-cyan-300 hover:text-cyan-700"
            >
              {item.label}
            </Link>
          ) : (
            <span className="rounded-full bg-cyan-700 px-3 py-1 text-white shadow-sm">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
