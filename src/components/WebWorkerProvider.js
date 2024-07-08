// WebWorkerContext.js
import { createContext, useContext, useEffect, useMemo } from 'react';
import useAccessToken from '../hooks/useAccessToken';
import { setDisableResubmit, setUploadProgress, setUploadingItem } from '../redux/slices/qc';
import { dispatch, useSelector } from '../redux/store';


const WebWorkerContext = createContext();

const CompressImgContext = createContext();

export const WebWorkerProvider = ({ children, worker, compressImageWorker }) => (
    <WebWorkerContext.Provider value={worker}>
        <CompressImgContext.Provider value={compressImageWorker}>
            {children}
        </CompressImgContext.Provider>
    </WebWorkerContext.Provider>
);

export const useWebWorker = () => useContext(WebWorkerContext);

export const useImgCompressWorker = () => useContext(CompressImgContext);

export default function CustomWebWorkerProvider({ children }) {


    const worker: Worker = useMemo(
        () => new Worker(new URL("../sections/qc/inspection/resumableWorker.js", import.meta.url)),
        []
    );

    const compressImageWorker: Worker = useMemo(
        () => new Worker(new URL("../utils/worker.compressImage.js", import.meta.url)),
        []
    );

    const { signalR, } = useSelector(store => store.qc)
    // const { accessToken } = useSelector(store => store.setting);
    const accessToken = useAccessToken();

    useEffect(() => {

        worker.onmessage = (e: MessageEvent<string>) => {
            console.log(e.data)
            const percentage = Number(e.data)
            if (percentage === 100) {
                dispatch(setDisableResubmit(false));
            }
            if (percentage === 100 && signalR.message === '4') {
                dispatch(setUploadingItem(null));
            }
            else {
                dispatch(setUploadProgress(percentage));
            }

        };

        worker.onerror = (error) => {
            console.error('Worker error:', error);
        };

        return () => {
            worker.terminate();
            dispatch(setUploadProgress(0));
        };

    }, [worker,]);

    useEffect(() => {

        compressImageWorker.onmessage = (e: MessageEvent<string>) => {
            console.log('s', e)
        };

        compressImageWorker.onerror = (error) => {
            console.error('Worker error:', error);
        };

        return () => {
            compressImageWorker.terminate();
        };

    }, [compressImageWorker]);


    // useEffect(() => {

    //     if (accessToken === null) return;
    //     worker.postMessage(JSON.stringify(
    //         {
    //             newAccessToken: accessToken,
    //             type: 'changeToken'
    //         })
    //     );

    // }, [accessToken,]);

    return (
        <WebWorkerProvider worker={worker} compressImageWorker={compressImageWorker}>
            {/* Your other components */}
            {children}
        </WebWorkerProvider>
    )
}