import { yupResolver } from "@hookform/resolvers/yup";
import Proptypes from 'prop-types'
import { LoadingButton } from "@mui/lab";
import { Card, Grid, Stack } from "@mui/material";
import { Popup } from "devextreme-react";
import ScrollView from "devextreme-react/scroll-view";
import { useSnackbar } from "notistack";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import * as Yup from 'yup';
// hooks
import useLocales from "../../../../hooks/useLocales";
import useResponsive from "../../../../hooks/useResponsive";
// components
import { FormProvider, RHFTextField } from "../../../../components/hook-form";
import PackingAndLabelImagesUpload from './ImageUpload';
import LoadingBackDrop from '../../../../components/BackDrop';
// db
import { attachmentsDB, db } from '../../../../Db';
// utils
import { saveAttachment } from '../../../../utils/handleDbAttachment';

// POPUP SET DETAIL INSPECTION

PopUpContents.propTypes = {
    modalContent: Proptypes.object,
    setModalContent: Proptypes.func,
    currentInspection: Proptypes.object,
    isViewOnly: Proptypes.bool,
    dataSource: Proptypes.array,
    setImages: Proptypes.func,
}


function PopUpContents({
    modalContent,
    setModalContent,
    currentInspection,
    isViewOnly,
    dataSource,
    setImages = () => { },
}) {

    // hooks
    const isKeyboardOpen = useDetectKeyboardOpen();
    const { translate } = useLocales();
    const mdUp = useResponsive('up', 'md');

    const defaultValues = useMemo(() => ({
        ...modalContent.item,
        Images: modalContent.item.Images,
        Description: modalContent.item.Description,
    }),
        [currentInspection, modalContent.item]
    );

    const stepScheme = Yup.object().shape({
        Images: Yup.array().required('Image is required'),
    });

    const methods = useForm({
        resolver: yupResolver(stepScheme),
        defaultValues,
    });

    const {
        watch,
        setValue,
    } = methods;

    // HOOKS
    const values = watch();
    const { enqueueSnackbar } = useSnackbar();

    // COMPONENTS STATE
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    // CLOSE MODAL
    const onClose = useCallback(() => {
        setModalContent({ visible: false, item: null, isAddNew: false });
    }, []);

    // SAVE OR ADD DEFECT
    const handleSave = async () => {
        try {
            setLoading(true)
            // console.log(values)
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            // const PackingAndLabelingList = [...currentInspection.PackingAndLabelings];
            // store image to index db and clear image form state object
            await saveAttachment(attachmentsDB.qc, values.Images.filter(d => d.Id < 0), currentInspection.Id);
            const deleteBase64 = [...values.Images].map(d => ({ ...d, Data: null })).filter(d => {
                if (d.Id < 0 && d.Action === 'Delete') {
                    return false
                }
                return true
            })

            // const currentItem = { ...modalContent?.item, Images: values.Images };
            const currentItem = { ...modalContent?.item, Images: deleteBase64 };

            setImages(values.Images.filter(d => {
                if (d.Id < 0 && d.Action === 'Delete') {
                    return false
                }
                return true
            }));

            await db.MqcInspection.where('Id')
                .equals(currentInspection?.Id)
                .modify((x, ref) => {
                    ref.value.PackingAndLabelings = dataSource?.map((pnl) => {
                        if (pnl?.Id === currentItem?.Id) {
                            return currentItem;
                        }
                        return pnl;
                    })
                });

            onClose();
            setLoading(false)
        } catch (error) {
            console.error(error);
            setLoading(false)
            enqueueSnackbar(JSON.stringify(error), {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    };

    const isStepCompleted = currentInspection?.Status?.PackingAndLabeling || false
    // console.log(values);

    return (
        <Popup
            visible={modalContent?.visible}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={false}
            closeOnOutsideClick={false}
            showCloseButton
            wrapperAttr={{ class: 'packing-and-label' }}
            title={`${modalContent?.item?.Title}`}
            width={mdUp ? 700 : '100%'}
            height={mdUp ? '100%' : '100%'}
            animation={{
                show: {
                    type: 'fade',
                    duration: 400,
                    from: 0,
                    to: 1
                },
                hide: {
                    type: 'fade',
                    duration: 400,
                    from: 1,
                    to: 0
                }
            }}
        >
            <FormProvider methods={methods}>
                <ScrollView id="list-item" style={{
                    paddingBottom: 8, paddingTop: 8,
                    height: '85vh',
                }} width="100%">
                    <Card
                        sx={{
                            px: 1,
                            py: 2,
                            // height: '82vh',
                        }}
                    >
                        <Stack spacing={2}>
                            <RHFTextField name="Description" label="Description"
                                InputProps={{ readOnly: true }}
                            />
                            <PackingAndLabelImagesUpload
                                values={values}
                                setValue={setValue}
                                isViewOnly={isViewOnly}
                                inspectionId={currentInspection.Id}
                                isStepCompleted={isStepCompleted}
                                setLoading={setLoading}
                                loading={loading}
                                setProgress={setProgress}
                            />
                        </Stack>
                    </Card>
                </ScrollView>

                {!isKeyboardOpen &&
                    <Grid
                        container
                        id="button-group"
                        sx={{
                            position: {
                                xs: 'fixed',
                                sm: 'fixed',
                                md: 'absolute',
                                lg: 'absolute',
                            },
                            bottom: {
                                xs: 3,
                                sm: 3,
                                md: 0,
                                lg: 0
                            },
                            left: 1,
                            right: 1,
                            p: 1,
                        }}
                        spacing={2}
                    >

                        <Grid item xs={12} sm={6} md={3}>
                            <LoadingButton
                                variant="contained"
                                fullWidth
                                disabled={isViewOnly || currentInspection.IsFinished || currentInspection.Status?.PackingAndLabeling}
                                onClick={handleSave}
                            >
                                {translate('button.save')}
                            </LoadingButton>
                        </Grid>

                    </Grid>
                }
            </FormProvider>

            <LoadingBackDrop
                loading={loading}
                variant='determinate'
                progress={progress}
                setProgress={setProgress}
                width='100%'
                height='100%'
            />

        </Popup >
    );
}



export default PopUpContents


