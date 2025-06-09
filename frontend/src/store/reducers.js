// frontend/src/store/reducers.js
import { LOGIN, LOGOUT, CREATE_TRANSACTION, FETCH_ANALYTICS } from './actions';

const initialState = {
    user: null,
    transactions: [],
    analytics: {},
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                user: action.payload,
            };
        case LOGOUT:
            return {
                ...state,
                user: null,
            };
        case CREATE_TRANSACTION:
            return {
                ...state,
                transactions: [...state.transactions, action.payload],
            };
        case FETCH_ANALYTICS:
            return {
                ...state,
                analytics: action.payload,
            };
        default:
            return state;
    }
};

export default rootReducer;
