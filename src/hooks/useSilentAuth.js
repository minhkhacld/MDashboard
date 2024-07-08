import { useCallback, useEffect, useState } from "react";
import { HubConnectionBuilder, HubConnectionState, LogLevel, HttpTransportType, DefaultHttpClient, HttpRequest, HttpResponse, HttpClient, HttpError } from '@microsoft/signalr';
import { Network } from "@capacitor/network";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
/// util
import axios from "axios";
import axiosInstance from "../utils/axios";
// config
import { HOST_API, } from '../config';
import { PATH_AUTH } from "../routes/paths";
// redux
import { setComplianceSignalR } from '../redux/slices/compliance';
import { setSignalR as mqcSignalR } from '../redux/slices/mqc';
import { setSignalR } from '../redux/slices/qc';
import { dispatch, useSelector } from '../redux/store';
import {
    // setAccessToken, 
    setShowDialogSessionExpired
} from "../redux/slices/setting";
// hooks
import useAuth from "./useAuth";
import useIsOnline from "./useIsOnline";



function useSilentAuth() {
    // New Code
    const { login, logout, isAuthenticated, } = useAuth();
    const { online } = useIsOnline();

    // redux state
    const { deviceId } = useSelector(store => store.notification)

    // Implementation of the refreshToken function
    const handleRefreshToken = async () => {
        try {

            const refreshToken = localStorage.getItem('refreshToken');
            // console.log('SignalR handleRefreshToken start with refresh Token:');

            // Make a request to your backend server to refresh the access token
            const response = await axios.post(`${process.env.REACT_APP_STS_AUTHORITY}/connect/token`, new URLSearchParams({
                "grant_type": process.env.REACT_APP_GRANT_TYPE_REFRESH_TOKEN,
                "refresh_token": refreshToken,
                client_id: process.env.REACT_APP_CLIENT_ID,
                client_secret: process.env.REACT_APP_CLIENT_SECRET,
            }));

            // console.log('SignalR refreshToken success');

            const data = response.data;
            const newAccessToken = data.access_token;
            localStorage.setItem('refreshToken', data.refresh_token);
            localStorage.setItem('accessToken', newAccessToken);
            // dispatch(setAccessToken(newAccessToken));
            return newAccessToken;

        } catch (error) {
            // console.log(JSON.stringify(error.response));
            console.error('SignalR Error refreshing access token:', JSON.stringify(error.response, error.error));
            if (error?.error === "invalid_grant"
                || JSON.stringify(error).includes("invalid_grant")
                // || error?.response?.status === 400 || error?.response?.data?.error === "invalid_grant"
            ) {
                // alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
                window.localStorage.removeItem('accessToken');
                window.localStorage.removeItem('refreshToken');
                // window.location.href = PATH_AUTH.login;
                // dispatch(setAccessToken(null));
                dispatch(setShowDialogSessionExpired(true))
                return
            }
            // Handle token refresh error
            throw error;
        }
    };


    useEffect(() => {

        const initializeSignalR = async () => {

            // check network status
            // const network = await Network.getStatus()
            if (!isAuthenticated) {
                return
            }

            // console.log('1. Start initializeSignalR');

            // Initialize SignalR connection with the initial access token and auto refresh token when hub detect disconnected
            const newConnection = new HubConnectionBuilder()
                .withUrl(`${HOST_API}/notifyMobileHub?deviceId=${deviceId}`, {
                    withCredentials: false,
                    // accessTokenFactory: () => `${initialToken}`,
                    accessTokenFactory: () => handleRefreshToken(),
                })
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: retryContext => {
                        // console.log(retryContext)
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

            // QC notifycation and loading status
            await newConnection.on('SendNotifyMessageForMobile', async (data) => {
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

            // MQC notifycation and loading status
            await newConnection.on('SendNotifyMessageForMQCMobile', async (message) => {
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

            // Compliance notifycation and loading status
            await newConnection.on('SendNotifyMessageForComplianceMobile', async (data) => {
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

            // Reconnected
            await newConnection.onreconnected(async connectionId => {
                // console.log(connectionId, 'RECONECTED')

            });

            // Start the connection
            await newConnection.start().then(async () => {
                console.log('SignalR Connected.');
            });

        };

        initializeSignalR();

        // Clean up function
        // return () => {
        //     if (connection) {
        //         connection.stop();
        //     }
        // };

    }, [isAuthenticated]);


    return null

}

export default useSilentAuth;

