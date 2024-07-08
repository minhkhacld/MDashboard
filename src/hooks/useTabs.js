import { useState } from 'react';
import { dispatch } from '../redux/store';
import { setCurrentTabs } from '../redux/slices/approval';

// ----------------------------------------------------------------------

export default function useTabs(defaultValues) {
  const [currentTab, setCurrentTab] = useState(defaultValues || '');
  return {
    currentTab,
    onChangeTab: (event, newValue, key) => {
      switch (key) {
        case 'APPROVAL_PENDING':
          dispatch(setCurrentTabs({ pending: newValue }));
          break;
        case 'APPROVAL_ALL':
          dispatch(setCurrentTabs({ all: newValue }));
          break;
        case 'APPROVAL_RECALL':
          dispatch(setCurrentTabs({ recall: newValue }));
          break;
        default:
          setCurrentTab(newValue);
      }
    },
    setCurrentTab,
  };
}
