import React, { useState } from 'react';
import List from 'devextreme-react/list';

const SwipeSelectList = ({ items }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [startY, setStartY] = useState(null);

    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (startY !== null) {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            const threshold = 50; // Adjust as needed

            if (deltaY > threshold) {
                // Select items based on the swipe distance
                const selected = items.filter((item, index) => index < deltaY / threshold);
                setSelectedItems(selected);
            }
        }
    };

    const handleTouchEnd = () => {
        setStartY(null);
    };

    const toggleItem = (item) => {
        const isSelected = selectedItems.includes(item);
        if (isSelected) {
            setSelectedItems(selectedItems.filter(selectedItem => selectedItem !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ height: '100%', overflowY: 'scroll' }}
        >
            <List
                dataSource={items}
                height={'auto'}
                onItemRendered={({ itemData }) => (
                    <div
                        onClick={() => toggleItem(itemData)}
                        style={{ backgroundColor: selectedItems.includes(itemData) ? 'lightblue' : 'white' }}
                    >
                        {itemData.name}
                    </div>
                )}
            />
        </div>
    );
};

export default SwipeSelectList;
