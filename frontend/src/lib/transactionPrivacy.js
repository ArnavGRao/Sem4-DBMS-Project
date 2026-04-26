const buildHiddenKey = (userId, vpa) => (
  `hidden-transactions:${String(userId || 'anonymous')}:${String(vpa || 'all').toLowerCase()}`
);

export const getHiddenTransactionIds = (userId, vpa) => {
  if (!userId || !vpa) {
    return [];
  }

  try {
    const raw = localStorage.getItem(buildHiddenKey(userId, vpa));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
};

export const setHiddenTransactionIds = (userId, vpa, ids) => {
  if (!userId || !vpa) {
    return;
  }

  const normalized = Array.from(new Set((ids || []).map((id) => String(id))));
  localStorage.setItem(buildHiddenKey(userId, vpa), JSON.stringify(normalized));
};

export const hideTransactions = (userId, vpa, idsToHide) => {
  const current = getHiddenTransactionIds(userId, vpa);
  const next = Array.from(new Set([...current, ...(idsToHide || []).map((id) => String(id))]));
  setHiddenTransactionIds(userId, vpa, next);
  return next;
};

export const unhideTransaction = (userId, vpa, transactionId) => {
  const targetId = String(transactionId);
  const next = getHiddenTransactionIds(userId, vpa).filter((id) => id !== targetId);
  setHiddenTransactionIds(userId, vpa, next);
  return next;
};
