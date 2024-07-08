import React from 'react';

export default function TabPanel({ value, currentTab, height, children }) {
    return (
        <div
            role="tabpanel"
            hidden={currentTab !== value}
            id={`simple-tabpanel-${currentTab}-${value}`}
            aria-labelledby={`simple-tab-${currentTab}-${value}`}
            style={{ height: height || '100%', }}
        >
            {children}
        </div>
    )
}