import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';


// ----------------------------------------------------------------------

const initialState = {
    error: null,
    loading: null,
    menuBadge: null,
};

const slice = createSlice({
    name: 'menuBadge',
    initialState,
    reducers: {
        // HAS ERROR
        hasError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
        },
        // set Loading,
        // START LOADING
        startLoading(state, action) {
            state.loading = action.payload;
        },
        // SET pending counst basge
        setPendingBadge(state, action) {
            state.menuBadge = action.payload;
            state.isLoading = false;
        }
    },
});

// Reducer
export default slice.reducer;

// get Customer List
export const getMenuBadge = (LoginUser) => {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading(true))
            // acounting pending
            const accountingPending = await axios.get(`/api/FRApprovalPendingApi/Get?CurrentEmplId=${LoginUser?.EmpId}`, {
                params: {
                    filter: JSON.stringify([['CurrentEmplId', '=', LoginUser?.EmpId], 'and', ['WFStep', '<>', 'Accountant']]),
                    requireTotalCount: true,
                    group: JSON.stringify([{ selector: 'Legal', desc: false, isExpanded: false }]),
                    skip: 0,
                    take: 0,
                },
            });
            // accounting recall
            const accountingRecall = await axios.get('/api/FRApprovalAllApi/Get', {
                params: {
                    filter: JSON.stringify([
                        ['SubmitterEmplId', '=', LoginUser?.EmpId],
                        'and',
                        ['CurrentEmplId', '=', LoginUser?.EmpId],
                        'and',
                        ['WaitingFor', '<>', LoginUser?.EmpKnowAs],
                    ]),
                    requireTotalCount: true,
                    group: JSON.stringify([{ selector: 'Legal', desc: false, isExpanded: false }]),
                    skip: 0,
                    take: 0,
                },
            });

            const shipmentPending = await axios.get('/api/ShipmentStatementReviewPendingApi/Get', {
                params: {
                    filter: JSON.stringify([['WaitingForId', '=', LoginUser?.EmpId], 'and', ['WFStep', '<>', 'Finance Dep.']]),
                    requireTotalCount: true,
                    group: JSON.stringify([{ selector: 'Legal', desc: false, isExpanded: false }]),
                    skip: 0,
                    take: 0,
                },
            });

            const shipmentRecall = await axios.get('/api/ShipmentStatementReviewPendingApi/Get', {
                params: {
                    filter: JSON.stringify(['SubmitterEmplId', '=', LoginUser?.EmpId]),
                    requireTotalCount: true,
                    group: JSON.stringify([{ selector: 'Legal', desc: false, isExpanded: false }]),
                    skip: 0,
                    take: 0,
                },
            });

            const bankAccountPending = await axios.get('/api/BankAccountApi/Get', {
                params: {
                    filter: JSON.stringify([
                        [['WaitingFor', '=', LoginUser?.EmpKnowAs], 'and', ['Status', '<>', 'Done']],
                        'and',
                        ['Status', '=', 'Pending'],
                    ]),
                    requireTotalCount: true,
                    skip: 0,
                    take: 0,
                },
            });

            const bankAccountRecall = await axios.get('/api/BankAccountApi/GetApprovalAll', {
                params: {
                    filter: JSON.stringify([
                        ['SubmitterEmplId', '=', LoginUser?.EmpId],
                        'and',
                        ['Status', '<>', 'Done'],
                        'and',
                        ['WaitingFor', '<>', LoginUser?.EmpKnowAs],
                    ]),
                    requireTotalCount: true,
                    skip: 0,
                    take: 0,
                },
            });

            Promise.all([accountingPending, accountingRecall, shipmentPending, shipmentRecall, bankAccountPending, bankAccountRecall,]).then(res => {
                // console.log(res);
                dispatch(slice.actions.setPendingBadge({
                    pending: {
                        accounting: res[0].data.totalCount,
                        shipment: res[2].data.totalCount,
                        bankAccount: res[4].data.totalCount,
                    },
                    recall: {
                        accounting: res[1].data.totalCount,
                        shipment: res[3].data.totalCount,
                        bankAccount: res[5].data.totalCount,
                    }
                }));
            })

        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };

};

