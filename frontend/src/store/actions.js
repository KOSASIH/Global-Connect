// frontend/src/store/actions.js
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const CREATE_TRANSACTION = 'CREATE_TRANSACTION';
export const FETCH_ANALYTICS = 'FETCH_ANALYTICS';

export const login = (user) => ({
    type: LOGIN,
    payload: user,
});

export const logout = () => ({
    type: LOGOUT,
});

export const createTransaction = (transaction) => ({
    type: CREATE_TRANSACTION,
    payload: transaction,
});

export const fetchAnalytics = (analyticsData) => ({
    type: FETCH_ANALYTICS,
    payload: analyticsData,
});
