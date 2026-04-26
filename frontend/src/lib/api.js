const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const parseJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    // Handle validation errors from Pydantic (422 responses)
    if (data && Array.isArray(data.detail)) {
      const errorMessages = data.detail
        .map((err) => {
          if (typeof err === 'object' && err.msg) {
            return `${err.msg}${err.loc ? ` (${err.loc.join('.')})` : ''}`;
          }
          return typeof err === 'string' ? err : 'Validation error';
        })
        .join('; ');
      throw new Error(errorMessages || 'Validation failed');
    }

    // Handle single error message
    const detail = data && typeof data === 'object'
      ? data.detail || data.message
      : data;
    throw new Error(detail || 'Request failed');
  }

  return data;
};

export const buildAccountVpa = (mobileNumber, accountType = 'personal', accountIndex = 1) => {
  const base = String(mobileNumber || 'account')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
  const suffix = String(accountType || 'account')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '') || 'account';

  return `${base}.${suffix}${accountIndex}@upi`;
};

/**
 * Fetch all accounts for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of account objects
 */
export const fetchUserAccounts = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  return requestJson(`/api/accounts/${userId}`);
};

/**
 * Perform a money transfer
 * @param {object} transferData - { sender_vpa, receiver_vpa, amount, remarks? }
 * @returns {Promise<object>} Transfer response with transaction details
 */
export const transferMoney = async (transferData) => {
  return requestJson('/api/transactions/transfer', {
    method: 'POST',
    body: JSON.stringify(transferData),
  });
};

/**
 * Fetch transaction history for a VPA
 * @param {string} vpa - Sender/receiver VPA
 * @returns {Promise<Array>} Array of transaction records
 */
export const fetchTransactionHistory = async (vpa) => {
  if (!vpa) {
    throw new Error('VPA is required');
  }

  const params = new URLSearchParams({ vpa });
  return requestJson(`/api/transactions/history/?${params.toString()}`);
};

/**
 * Create a new account for a user
 * @param {object} accountData - { user_id, vpa, initial_balance? }
 * @returns {Promise<object>} Created account details
 */
export const createAccount = async (accountData) => {
  return requestJson('/api/accounts/create', {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
};

/**
 * Add balance to an account (testing feature)
 * @param {number} accountId - The account ID
 * @param {number} amount - Amount to add
 * @returns {Promise<object>} Updated account balance
 */
export const addBalanceToAccount = async (accountId, amount) => {
  if (!accountId || !amount) {
    throw new Error('Account ID and amount are required');
  }
  return requestJson(`/api/accounts/${accountId}/add-balance`, {
    method: 'POST',
    body: JSON.stringify({ account_id: accountId, amount }),
  });
};

/**
 * Fetch current account details including balance
 * @param {number} accountId - The account ID
 * @returns {Promise<object>} Account details with current balance
 */
export const getAccountDetails = async (accountId) => {
  if (!accountId) {
    throw new Error('Account ID is required');
  }
  return requestJson(`/api/accounts/${accountId}`);
};