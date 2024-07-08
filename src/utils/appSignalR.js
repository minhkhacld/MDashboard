import { HubConnectionBuilder, LogLevel, } from '@microsoft/signalr';
import { HOST_API } from '../config';
import { setComplianceSignalR } from '../redux/slices/compliance';
import { setSignalR as mqcSignalR } from '../redux/slices/mqc';
import { setSignalR } from '../redux/slices/qc';
import { dispatch } from '../redux/store';


const startSignalRConnection = async (token, deviceId) => {
    try {

        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken === null || accessToken === undefined) {
            return;
        };

        const connection = new HubConnectionBuilder()
            .withUrl(`${HOST_API}/notifyMobileHub?deviceId=${deviceId}`, {
                withCredentials: false,
                accessTokenFactory: () => `${token}`,
            })
            .configureLogging(LogLevel.Information)
            // .withAutomaticReconnect([0, 2000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000])
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    if (retryContext.elapsedMilliseconds < 60000) {
                        // If we've been reconnecting for less than 60 seconds so far,
                        // wait between 0 and 10 seconds before the next reconnect attempt.
                        return Math.random() * 10000;
                    }
                    // If we've been reconnecting for more than 60 seconds so far, stop reconnecting.
                    return 10000;
                }
            })
            .build();



        await connection.on('SendNotifyMessageForMobile', async (data) => {
            console.log('SendNotifyMessageForMobile', data);
            // const { id, qcType, message, type, tempGuid, sysNo } = data;
            const { user, text, id, guid, type, sysNo, qcType, apiType } = data;
            dispatch(setSignalR({
                id,
                sysNo,
                qcType,
                message: text,
                type,
                guid,
            }));
        });

        await connection.on('SendNotifyMessageForMQCMobile', async (message) => {
            console.log('SendNotifyMessageForMQCMobile', message);
            const { user, text, id, guid, type, sysNo, qcType, apiType } = message;
            dispatch(mqcSignalR({
                user,
                message: text,
                id,
                guid,
                type,
                sysNo,
                qcType,
                apiType,
            }));
        })


        await connection.on('SendNotifyMessageForComplianceMobile', async (data) => {
            console.log('SendNotifyMessageForComplianceMobile', data);
            const { user, text, id, guid, type, sysNo, qcType, apiType } = data;
            dispatch(setComplianceSignalR({
                id,
                sysNo,
                qcType,
                message: text,
                type,
                guid,
            }));
        });


        await connection.onreconnected(async connectionId => {
            console.log(connectionId, 'RECONECTED')
            // await Toast.show({
            //     text: "SignalR Reconnected.", position: 'bottom'
            // })
        });

        await connection.start().then(async () => {
            console.log('SignalR Connected.');
            // await Toast.show({
            //     text: "SignalR Connected.", position: 'bottom'
            // })
        });

        // await connection.onclose(() => {
        //     console.log("SignalR: Connection closed");
        // });

        // console.log(connection);
        // await connection.onclose(async () => {
        //     try {
        //         await connection.start();
        //         console.log("SignalR Close Connected...");
        //     } catch (err) {
        //         console.log(err);
        //         setTimeout(async () => {
        //             await connection.start();
        //             console.log("SignalR Close Connected...");
        //         }, 5000);
        //     }
        // });

    } catch (e) {
        console.error(e);

    }
};

export default startSignalRConnection;



