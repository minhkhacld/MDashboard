import { useState } from 'react';
import { setCurrentPaymentFilterValue } from '../redux/slices/payment';
import { setCurrentProductNoteFilterValue } from '../redux/slices/productNote';
import { setCurrentBusinessFilterValue } from '../redux/slices/statement';
import { dispatch } from '../redux/store';

// ----------------------------------------------------------------------

export default function useFilter(defaultValues) {
  // const [currentFilter, setCurrentFilter] = useState(defaultValues || '');

  return {
    // currentFilter,
    onChangeFilter: (newValue, page) => {
      // console.log(newValue, page)
      if (page === 'payment') {
        dispatch(setCurrentPaymentFilterValue(newValue));
      } else if (page === 'invoice') {
        dispatch(setCurrentProductNoteFilterValue(newValue));
      } else {
        dispatch(setCurrentBusinessFilterValue(newValue));
        // setCurrentFilter(newValue);
      }
    },
    // setCurrentFilter,
  };
}
