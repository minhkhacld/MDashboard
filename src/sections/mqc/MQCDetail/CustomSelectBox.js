import { memo, useEffect, useState } from 'react';
// dev-extreme
import { SelectBox } from 'devextreme-react';
import Form, { Label, SimpleItem } from 'devextreme-react/form';
import DataSource from 'devextreme/data/data_source';
// mui
import { Box } from '@mui/material';
// dexie
import { useLiveQuery } from 'dexie-react-hooks';
import { mqcDB } from '../../../Db';
// redux
import { useSelector } from '../../../redux/store';

function CustomSelectBox({ errors, isViewOnly, methods, onChange }) {
  const [selectBoxValue, setSelectBoxValue] = useState(null);
  const values = useSelector((store) => store.mqc.values);
  const ColorOpt = useLiveQuery(() => mqcDB?.Enums.where('Name').equals('Color').toArray()) || [];

  const selectColor = new DataSource({
    store: ColorOpt[0]?.Elements || [],
    paginate: true,
    pageSize: 10,
    key: 'Value',
  });

  useEffect(() => {
    setSelectBoxValue(values?.ColorId);
  }, [values]);

  return (
    <Form>
      <SimpleItem isRequired>
        <Label text={'Color'} location={'top'} />
        <SelectBox
          id="ColorId"
          dataSource={selectColor}
          itemRender={(data) => {
            return <Box>{data?.Caption}</Box>;
          }}
          showClearButton
          value={selectBoxValue}
          valueExpr={'Value'}
          displayExpr={'Caption'}
          onSelectionChanged={(event) => {
            setSelectBoxValue(event?.selectedItem?.Value || '');
            onChange({
              Color: event?.selectedItem?.Caption || '',
              ColorId: event?.selectedItem?.Value || '',
            });
            document.getElementById('sync-button-mqc').style.display = 'inline-flex';
          }}
          readOnly={isViewOnly}
          searchEnabled
          searchMode="contains"
          searchExpr={['Caption']}
          placeholder=""
          isValid={errors?.ColorId === undefined}
          onFocusIn={() => {
            document.getElementById('sync-button-mqc').style.display = 'none';
          }}
          onFocusOut={() => {
            document.getElementById('sync-button-mqc').style.display = 'inline-flex';
          }}
        />
      </SimpleItem>
    </Form>
  );
}

export default memo(CustomSelectBox);
