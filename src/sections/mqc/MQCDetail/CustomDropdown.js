import { memo, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
// dev-extreme
import { DropDownBox } from 'devextreme-react';
import DataGrid, { FilterRow, Scrolling, Selection } from 'devextreme-react/data-grid';
import Form, { Label, SimpleItem } from 'devextreme-react/form';
import DataSource from 'devextreme/data/data_source';
// mui
// dexie
import { useLiveQuery } from 'dexie-react-hooks';
import { mqcDB } from '../../../Db';
// redux
import { useSelector } from '../../../redux/store';


function CustomDropDown({ errors, isViewOnly, onChange }) {
  // state
  const [isTreeBoxOpened, setIsTreeBoxOpened] = useState(false);
  const platform = Capacitor.getPlatform();
  // others
  const values = useSelector((store) => store.mqc.values);
  const ArtCode = useLiveQuery(() => mqcDB?.Enums.where('Name').equals('ArtCode').toArray()) || [];

  const dropDownOptions = {
    position: {
      my: 'top', // Position the dropdown at the top
      at: 'top', // Align the top of the dropdown with the bottom of the input
      of: platform === 'web' ? document.getElementById('FabricHeader') : window, // Relative to the window
    },
    height: '100%',
    closeOnOutsideClick: true,
  };

  const selectArtCode = new DataSource({
    store: ArtCode[0]?.Elements,
    paginate: true,
    pageSize: 10,
    key: 'Id',
  });

  const onTreeBoxOpened = useCallback((e) => {
    if (e.name === 'opened') {
      setIsTreeBoxOpened(e.value);
    }
  }, []);

  return (
    <Form>
      <SimpleItem isRequired>
        <Label text={'Art'} location={'top'} />
        <DropDownBox
          id="ItemCode"
          dataSource={selectArtCode}
          showClearButton
          value={ArtCode[0]?.Elements?.find((d) => d?.Code === values?.ItemCode && d?.Code !== null)?.Id || null}
          valueExpr={'Id'}
          displayExpr={'Code'}
          // onFocusOut={(e) => {
          //   const dropDownBox = e.component;
          //   dropDownBox.close();
          // }}
          contentRender={(e) => {
            const dropDownBox = e.component;
            return (
              <DataGrid
                dataSource={selectArtCode}
                columns={['Code', 'Color']}
                onSelectionChanged={(event) => {
                  dropDownBox.close();
                  onChange({
                    ItemCode: event?.currentSelectedRowKeys[0]?.Code || '',
                    Color: event?.currentSelectedRowKeys[0]?.Color || '',
                    ColorId: event?.currentSelectedRowKeys[0]?.ColorId || '',
                  });
                }}
                // hoverStateEnabled
                // showBorders
                height={'100%'}
              >
                <Selection mode="single" />
                <Scrolling mode="virtual" />
                <FilterRow visible />
              </DataGrid>
            );
          }}
          readOnly={isViewOnly}
          // hoverStateEnabled
          dropDownOptions={dropDownOptions}
          isValid={errors?.ItemCode === undefined}
          opened={isTreeBoxOpened}
          onOptionChanged={onTreeBoxOpened}
          onValueChanged={(e) => {
            if (e.value === null) {
              onChange({
                ItemCode: '',
              });
            }
          }}
        />
      </SimpleItem>
    </Form>
  );
}

export default memo(CustomDropDown);
