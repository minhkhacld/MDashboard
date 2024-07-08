import { Capacitor, Plugins } from '@capacitor/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { Toast } from '@capacitor/toast';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { setOpenForm, setSelectedEventId } from '../redux/slices/calendar';
import { getNotification } from '../redux/slices/notification';
import { setPushNotificationToken } from '../redux/slices/setting';
import { dispatch } from '../redux/store';
import { PATH_APP } from '../routes/paths';

const { LocalNotifications } = Plugins;

function PushNotificationsContainer() {

  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return
    PushNotifications.checkPermissions().then((res) => {
      if (res.receive !== 'granted') {
        PushNotifications.requestPermissions().then((res) => {
          if (res.receive === 'denied') {
            showToast('Push Notification permission denied');
          } else {
            // showToast('Push Notification permission granted');
            register();
          }
        });
      } else {
        register();
      }
    });
  }, []);

  const register = () => {
    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('token', token.value);
      dispatch(setPushNotificationToken(token.value));
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      alert(`Error on registration: ${JSON.stringify(error)}`);
    });

    // // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
      console.log('pushNotificationReceived', JSON.stringify(notification));
      const notifyType = notification.data.type;
      const location = window.localStorage.getItem('lastVisitPage');
      // console.log('pushNotificationActionPerformed notification.actionId === tap');
      switch (notifyType) {
        case "Calendar":
          // code block
          await new Promise((resolve) => setTimeout(resolve, 500));
          dispatch(setOpenForm(true));
          dispatch(setSelectedEventId(Number(notification.data.entityId)));
          dispatch(getNotification(notification))
          if (location !== '/calendar/activity') {
            window.localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.calendar.activity));
            // window.location.href = PATH_APP.calendar.activity;
            navigate(PATH_APP.calendar.activity)
          }
          break;
        default:
          window.localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.general.notification));
          // window.location.href = PATH_APP.general.notification;
          navigate(PATH_APP.general.notification)
        // code block
      }
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: notification?.title,
              body: notification?.body,
              id: parseInt(notification?.id, 10),
              schedule: { at: new Date(Date.now() + 1000 * 1) },
              badge: 1,
              autoClear: false,
              vibration: true,
              actionTypeId: 'TestPushNotification',
              // largeBody: true,
              // ongoing: true,
              iconColor: '#FF0000',
              smallIcon: 'ic_launcher',
              largeIcon: 'ic_launcher',
              extra: notification,
            },
          ],
        });
      }

    });

    // // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
      console.log(`pushNotificationActionPerformed ${JSON.stringify(notification)} `);
      // Line 2 - Msg: notification {"id":"0:1685002796161294%e7652b24e7652b24","data":{"startTime":"2023-05-25T15:24:56","entityId":"226","id":"542c659a-c8b3-4bd7-8403-f71658e5427e","type":"Calendar"},"title":"Motives Activity Calendar","body":"Test event \n 5/25/2023 3:24:56 PM \n "}
      const notifyType = notification.notification.data.type;
      if (notification.actionId === 'tap') {
        // console.log('pushNotificationActionPerformed notification.actionId === tap');
        switch (notifyType) {
          case "Calendar":
            await new Promise((resolve) => setTimeout(resolve, 500));
            // code block
            dispatch(setOpenForm(true));
            dispatch(setSelectedEventId(Number(notification.notification.data.entityId)));
            dispatch(getNotification(notification.notification));
            window.localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.calendar.activity));
            navigate(PATH_APP.calendar.activity)
            console.log('pushNotificationActionPerformed - case - Calendar', notification.notification.data.entityId, notifyType);
            break;
          default:
            window.localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.general.notification));
            navigate(PATH_APP.general.notification)
          // code block
        }
      }
    });

    LocalNotifications.addListener(
      'localNotificationActionRecieved',
      (notification: ActionPerformed) => {
        console.log(`localNotificationActionRecieved ${JSON.stringify(notification)} `);
      }
    )

    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        console.log(`localNotificationActionPerformed ${JSON.stringify(notification)} `);
        // Line 2 - Msg: notification {"id":"0:1685002796161294%e7652b24e7652b24","data":{"startTime":"2023-05-25T15:24:56","entityId":"226","id":"542c659a-c8b3-4bd7-8403-f71658e5427e","type":"Calendar"},"title":"Motives Activity Calendar","body":"Test event \n 5/25/2023 3:24:56 PM \n "}
        const notifyType = notification.notification.extra.data.type;
        const location = window.localStorage.getItem('lastVisitPage');
        if (notification.actionId === 'tap') {
          // console.log('pushNotificationActionPerformed notification.actionId === tap');
          switch (notifyType) {
            case "Calendar":
              await new Promise((resolve) => setTimeout(resolve, 500));
              // code block
              dispatch(setOpenForm(true));
              dispatch(setSelectedEventId(Number(notification.notification.extra.data.entityId)));
              dispatch(getNotification(notification.notification.extra))
              if (location !== '/calendar/activity') {
                window.localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.calendar.activity));
                navigate(PATH_APP.calendar.activity)
              }
              console.log('pushNotificationActionPerformed - case - Calendar', notification.notification.extra.data.entityId, notifyType);
              break;
            default:
              window.localStorage.setItem('lastVisitPage', JSON.stringify(PATH_APP.general.notification));
              navigate(PATH_APP.general.notification);
            // code block
          }
        }
      }
    )

    // PushNotifications.removeAllDeliveredNotifications();
  };

  const showToast = async (msg: string) => {
    await Toast.show({
      text: msg,
    });
  };

}
export default PushNotificationsContainer

// ⚡️  TO JS {"notification":{"id":"FFB005EE-B82B-4908-A25D-12FD1CD2D433","title":"Activity Reminder","data":{"type":"Calendar","aps":{"alert":{"body":"New Activity at 09:00 am","title":"Activity Reminder","badge":1},"sound":"default","apns-push-type":"notification"},"
// ⚡️  [log] - pushNotificationActionPerformed {"notification":{"id":"FFB005EE-B82B-4908-A25D-12FD1CD2D433","title":"Activity Reminder","data":{"type":"Calendar","aps":{"alert":{"body":"New Activity at 09:00 am","title":"Activity Reminder","badge":1},"sound":"default","apns-push-type":"notification"},"id":"ddf6e381-9e72-411e-aa0c-924cdf373d76"},"subtitle":"","body":"New Activity at 09:00 am","badge":1},"actionId":"tap"} 
// ⚡️  [log] - pushNotificationActionPerformed notification.actionId === tap

