import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { Avatar, Box, Chip, Divider, IconButton, List, ListItem, Stack, Typography, styled } from '@mui/material';
import { encode } from 'base64-arraybuffer';
import { Popup, ScrollView, } from 'devextreme-react';
import { useCallback, useEffect, useState } from 'react';
import MSGReader from '../../utils/msg.reader';
// Components
import Iconify from '../Iconify';
// Util
import axios from '../../utils/axios';
import createAvatar from '../../utils/createAvatar';
import { getFileFormat } from '../../utils/getFileFormat';
import IconName from '../../utils/iconsName';

const RootStylePopup = styled(Popup)(({
    theme,
    sx,
}) => {
    return {
        width: '100%',
        height: '100%',
        padding: '4px !important',
        zIndex: theme.zIndex.appBar + 10,
    }
});

const chipStyles = {
    '& .MuiChip-deleteIcon': {
        fontSize: '30px !important',
    },
    "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
        width: 50
    }, "& .MuiChip-label": {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        wordWrap: 'break-word',
    },
    "&.MuiChip-root": {
        py: 0.5,
        height: 'fit-content',
        my: 0.5,
    },
    ':hover': {
        backgroundColor: 'primary.main',
        color: 'white',
        '& .MuiChip-deleteIcon': {
            color: 'white'
        }
    },
    cursor: 'pointer',
};

const testUser = [].concat([{ name: 'kha', email: 'pmkha92@gmail.com' }, { name: 'kha', email: 'pmkha92@gmail.com' }, { name: 'kha', email: 'pmkha92@gmail.com' }, { name: 'kha', email: 'pmkha92@gmail.com' }, { name: 'kha', email: 'pmkha92@gmail.com' },]);



const waitForResume = () => {
    return new Promise((resolve) => {
        App.addListener('appStateChange', async (state) => {
            if (state.isActive) {
                resolve('appStateChange');
            }
        });
    });
};

export default function MsgFileViewer({ file, ...others }) {

    // hooks
    const isWebApp = Capacitor.getPlatform() === 'web';

    // states
    const [visible, setVisible] = useState(false);
    const [msgData, setMsgData] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [innerMsgContent, setInnerMsgContent] = useState([]);

    useEffect(() => {
        (async () => {
            const response = await axios.get(file.URL, { responseType: 'arraybuffer' });
            // console.log(response);
            const msgReader = new MSGReader(response.data);
            // console.log(msgReader);
            const fileData = msgReader.getFileData();
            // console.log('fileData', fileData,);
            setMsgData(fileData);
            const allAtt = fileData.attachments;
            if (allAtt.length > 0) {
                const getFiles = allAtt.filter(file => !file.innerMsgContent).map(file => {
                    // console.log(file)
                    const fileAtt = msgReader.getAttachment(file);
                    const { url, fileType, base64 } = downloadBlobURL(fileAtt.content, file, isWebApp);
                    return {
                        ...file,
                        url,
                        fileType,
                        base64,
                        ...fileAtt
                    }
                }).sort((a, b) => a.fileName.localeCompare(b.fileType, navigator.languages[0] || navigator.language, { numeric: true, ignorePunctuation: true }));
                setAttachments(getFiles)

                const innerMsgArr = allAtt.filter(file => file.innerMsgContent);
                if (innerMsgArr.length > 0) {
                    setInnerMsgContent(innerMsgArr)
                }
            }
        })();
    }, [])

    const handleViewMsg = useCallback(() => {
        setVisible(true);
    }, [])

    const onClose = useCallback(() => {
        setVisible(false);
    }, []);


    const handleDowloadAllFile = () => {
        if (attachments.length === 0) return;
        const temporaryDownloadLink = document.createElement("a");
        temporaryDownloadLink.style.display = 'none';
        document.body.appendChild(temporaryDownloadLink);
        attachments.forEach(att => {
            temporaryDownloadLink.setAttribute('href', att.url);
            temporaryDownloadLink.setAttribute('download', att.fileName);
            temporaryDownloadLink.click();
        });
        window.open(file.URL, "_blank")

        document.body.removeChild(temporaryDownloadLink);
    };

    const handleViewFile = async (url, fileType, base64, fileName) => {

        const response = await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Documents,
        })
        console.log('response write file', response)
        if (response.uri) {
            // window.open(response.url, "_system");
            await FileOpener.openFile({
                // path: 'file:///var/mobile/Containers/Data/Application/22A433FD-D82D-4989-8BE6-9FC49DEA20BB/Images/test.png'
                path: response.uri
            }).then(async res => {
                if (Capacitor.getPlatform() !== 'android') return;
                console.log('response open file', res)
                await waitForResume().then(async res => {
                    console.log('appStateChange', res)
                    const delResponse = await Filesystem.deleteFile({
                        // path: response.uri,
                        path: fileName,
                        directory: Directory.Documents,
                    })
                    console.log('delResponse', delResponse)
                })
            });
            // await Toast.show({
            //     text: `${fileName} has been saved to you Document directory!`
            // })
        }
    };

    // {
    //     "attachments": [
    //         {
    //             "name": "image001.png",
    //             "mimeType": "image/png",
    //             "dataId": 149,
    //             "contentLength": 1494,
    //             "fileNameShort": "image001.png",
    //             "extension": ".png",
    //             "fileName": "image001.png",
    //             "pidContentId": "image001.png@01D9DC20.4ED18B40"
    //         }
    //     ],
    //     "recipients": [
    //         {
    //             "name": "Ruby Ta",
    //             "email": "rubyta@motivesvn.com"
    //         }
    //     ],
    //     "senderName": "Sandra Nguyen",
    //     "bodyHTML": "\u0001�\u0000\u0000\b\u0000\b\u0000bu\u0015T\u0011\u0000!\u0000�6��\r\u0000F\u0000",
    //     "subject": "FW: CÂU LẠC BỘ BÓNG ĐÁ- BÁO CÁO HOẠT ĐỘNG THÁNG 8/2023",
    //     "headers": "Received: from TYZPR06MB4237.apcprd06.prod.outlook.com (2603:1096:400:8f::12)\r\n by SI2PR06MB4395.apcprd06.prod.outlook.com with HTTPS; Thu, 31 Aug 2023\r\n 08:33:33 +0000\r\nAuthentication-Results: dkim=none (message not signed)\r\n header.d=none;dmarc=none action=none header.from=motivesvn.com;\r\nReceived: from SL2PR06MB3146.apcprd06.prod.outlook.com (2603:1096:100:3e::20)\r\n by TYZPR06MB4237.apcprd06.prod.outlook.com (2603:1096:400:8f::12) with\r\n Microsoft SMTP Server (version=TLS1_2,\r\n cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.6699.35; Thu, 31 Aug\r\n 2023 08:33:32 +0000\r\nReceived: from SL2PR06MB3146.apcprd06.prod.outlook.com\r\n ([fe80::9882:6815:2b6b:53da]) by SL2PR06MB3146.apcprd06.prod.outlook.com\r\n ([fe80::9882:6815:2b6b:53da%4]) with mapi id 15.20.6699.034; Thu, 31 Aug 2023\r\n 08:33:27 +0000\r\nContent-Type: application/ms-tnef; name=\"winmail.dat\"\r\nContent-Transfer-Encoding: binary\r\nFrom: Sandra Nguyen <sandranguyen@motivesvn.com>\r\nTo: Ruby Ta <rubyta@motivesvn.com>\r\nSubject:\r\n =?utf-8?B?Rlc6IEPDglUgTOG6oEMgQuG7mCBCw5NORyDEkMOBLSBCw4FPIEPDgU8gSE8=?=\r\n =?utf-8?B?4bqgVCDEkOG7mE5HIFRIw4FORyA4LzIwMjM=?=\r\nThread-Topic:\r\n =?utf-8?B?Q8OCVSBM4bqgQyBC4buYIELDk05HIMSQw4EtIELDgU8gQ8OBTyBIT+G6oFQg?=\r\n =?utf-8?B?xJDhu5hORyBUSMOBTkcgOC8yMDIz?=\r\nThread-Index: AQHZ2yghU7nm3fdymUKUIjaC2Jh1jrADrrnggABR99CAABQ5oIAAAFmg\r\nDate: Thu, 31 Aug 2023 08:33:27 +0000\r\nMessage-ID:\r\n <SL2PR06MB31460C0AFFF599EF271172E7D7E5A@SL2PR06MB3146.apcprd06.prod.outlook.com>\r\nReferences:\r\n <TYZPR06MB5999E60AF9439A3A767DFB8CCB05A@TYZPR06MB5999.apcprd06.prod.outlook.com>\r\n <TYZPR06MB59995A899F6A7D4C2C646407CBE6A@TYZPR06MB5999.apcprd06.prod.outlook.com>\r\n <SEYPR06MB606132D3361893970EE8B627DCE5A@SEYPR06MB6061.apcprd06.prod.outlook.com>\r\n <SL2PR06MB314668F28714FBCC793904D0D7E5A@SL2PR06MB3146.apcprd06.prod.outlook.com>\r\n <SEYPR06MB60614F864A3137A576DF860ADCE5A@SEYPR06MB6061.apcprd06.prod.outlook.com>\r\nIn-Reply-To:\r\n <SEYPR06MB60614F864A3137A576DF860ADCE5A@SEYPR06MB6061.apcprd06.prod.outlook.com>\r\nAccept-Language: en-US\r\nContent-Language: en-US\r\nX-MS-Has-Attach: yes\r\nX-MS-Exchange-Organization-SCL: 1\r\nX-MS-TNEF-Correlator:\r\n <SL2PR06MB31460C0AFFF599EF271172E7D7E5A@SL2PR06MB3146.apcprd06.prod.outlook.com>\r\nMIME-Version: 1.0\r\nX-MS-Exchange-Organization-MessageDirectionality: Originating\r\nX-MS-Exchange-Organization-AuthSource: SL2PR06MB3146.apcprd06.prod.outlook.com\r\nX-MS-Exchange-Organization-AuthAs: Internal\r\nX-MS-Exchange-Organization-AuthMechanism: 04\r\nX-MS-Exchange-Organization-Network-Message-Id:\r\n 504706b1-422f-4b8e-61b0-08dba9fcf2ce\r\nX-MS-PublicTrafficType: Email\r\nX-MS-TrafficTypeDiagnostic:\r\n SL2PR06MB3146:EE_|TYZPR06MB4237:EE_|SI2PR06MB4395:EE_\r\nReturn-Path: sandranguyen@motivesvn.com\r\nX-MS-Exchange-Organization-ExpirationStartTime: 31 Aug 2023 08:33:33.1236\r\n (UTC)\r\nX-MS-Exchange-Organization-ExpirationStartTimeReason: OriginalSubmit\r\nX-MS-Exchange-Organization-ExpirationInterval: 1:00:00:00.0000000\r\nX-MS-Exchange-Organization-ExpirationIntervalReason: OriginalSubmit\r\nX-MS-Office365-Filtering-Correlation-Id: 504706b1-422f-4b8e-61b0-08dba9fcf2ce\r\nX-Microsoft-Antispam: BCL:0;\r\nX-Forefront-Antispam-Report:\r\n CIP:255.255.255.255;CTRY:;LANG:vi;SCL:1;SRV:;IPV:NLI;SFV:NSPM;H:SL2PR06MB3146.apcprd06.prod.outlook.com;PTR:;CAT:NONE;SFS:;DIR:INT;\r\nX-MS-Exchange-CrossTenant-OriginalArrivalTime: 31 Aug 2023 08:33:27.3403\r\n (UTC)\r\nX-MS-Exchange-CrossTenant-FromEntityHeader: Hosted\r\nX-MS-Exchange-CrossTenant-Id: 3a175834-843d-45e3-b86a-06a66d4dedd4\r\nX-MS-Exchange-CrossTenant-AuthSource: SL2PR06MB3146.apcprd06.prod.outlook.com\r\nX-MS-Exchange-CrossTenant-AuthAs: Internal\r\nX-MS-Exchange-CrossTenant-Network-Message-Id: 504706b1-422f-4b8e-61b0-08dba9fcf2ce\r\nX-MS-Exchange-CrossTenant-MailboxType: HOSTED\r\nX-MS-Exchange-CrossTenant-UserPrincipalName: rccHCrSIYtPQxdwCgOEgWAg+p1CVSKRXif2roTGMMzQ3imMWZXL58o4Zc9191qEfw+W5y+CW1dxyuX13xvlN/hStfeamMibGM56+H9+Gbz8=\r\nX-MS-Exchange-Transport-CrossTenantHeadersStamped: TYZPR06MB4237\r\nX-MS-Exchange-Transport-EndToEndLatency: 00:00:06.4357605\r\nX-MS-Exchange-Processed-By-BccFoldering: 15.20.6745.021\r\nX-Microsoft-Antispam-Mailbox-Delivery:\r\n\tucf:1;jmr:0;auth:0;dest:C;OFR:CustomRules;ENG:(910001)(944506478)(944626604)(920097)(425001)(930097)(140003);\r\nX-Microsoft-Antispam-Message-Info:\r\n\tf7zjXFvuzoUXmvzKoc8YWZOFQDqHy7JH6IhreTZHMBlTeyuLNADyvjbx+YkAiMLWL3c0t4pIENlcpiPKyyIGV/yvL3bbDnVb9qMfG4VySoIPOXSXfc2NGo2aWDbNXh9z+os9R095N07i2Tb0UCE7lObbE217+HxlEFX0H9tErRFUiO7Grbf1FJywToWBEqwJss9L6xnxQqoySo+b+8dWeQyEAaTPARc3d3Q/m4sreqAEOGf0hMj02T1NFnvPOajtm2tPMkDkuGEhGcUUV/DFnSG9B2J9JwFwg2JaDyBEsebd8z9BxIR0hH62nZDQaZLmLpNr8jm1NErHWCeUpn3kGVreywORGeCeLY0BPmOLnoKF8YXklwzEmKh+0bMMCdlqVdoSlIKdkOtTJ96b9n9BQUCAVXEBuy0MAYHLx5NcXPHQrnr7aYkOQHPNjS3JjCf3ZXPVapyE5m1yjzLAS2aRUQSBd6H7HfNxtzyehhRpHOPYDH7ypZOnHgDrfMn+SlT1E9sK6q1vSL1KBxhD8dQ3ssl4JMoHv2/6ZLz8yIoe89ntkhGgwcXYrNB+xxSJeEdDTnay0v1aY2ppExk+2m5bvTDnU3+H45xJ9ESqkusbDuhfuu3fdlfVv5HFfQN8d11/k/cPGoPcljyy1NbAX2uOERKyhRJ2OAjLvL8L45oG/canvSgEogCJOiDJT6S5AnzdNNYgWyHO8+LpyBswIW/fjAdv8lPu3sVGt0nuofe+k5UrgZLE4m+L1rkeQcUeXffo8pycsyCv8zTXQekeBjs2N7m9l8oM+7AEnaSbSkBDZ5Q=\r\n",
    //     "body": "FYI\r\n\r\n \r\n\r\nFrom: Lee Huynh <leehuynh@motivesvn.com> \r\nSent: Thursday, August 31, 2023 3:32 PM\r\nTo: Sandra Nguyen <sandranguyen@motivesvn.com>\r\nCc: Duc Le <ducle@motivesvn.com>\r\nSubject: RE: CÂU LẠC BỘ BÓNG ĐÁ- BÁO CÁO HOẠT ĐỘNG THÁNG 8/2023\r\n\r\n \r\n\r\nOK nhé\r\n\r\n \r\n\r\nBest regards,\r\n\r\nLee Huynh\r\n\r\nG. Director\r\n\r\n \r\n\r\n\r\n\r\nMotives VietNam\r\nFloors 7-8-9, M Building, 09 Street No.8, Zone A, South New Urban Area\r\nTan Phu Ward, District 7, Ho Chi Minh City, Vietnam\r\nEmail: leehuynh@motivesvn.com- <mailto:leehuynh@motivesvn.com->  Skype:longhtan\r\nPhone:(84 28) 54 135 137 - Fax:(84 28) 54 135 141\r\nWebsite:motivesinternational.io <http://www.motivesinternational.io/> \r\n\r\n \r\n\r\nFrom: Sandra Nguyen <sandranguyen@motivesvn.com <mailto:sandranguyen@motivesvn.com> > \r\nSent: Thursday, August 31, 2023 2:26 PM\r\nTo: Lee Huynh <leehuynh@motivesvn.com <mailto:leehuynh@motivesvn.com> >\r\nCc: Duc Le <ducle@motivesvn.com <mailto:ducle@motivesvn.com> >\r\nSubject: FW: CÂU LẠC BỘ BÓNG ĐÁ- BÁO CÁO HOẠT ĐỘNG THÁNG 8/2023\r\nImportance: High\r\n\r\n \r\n\r\nHi Anh Lee\r\n\r\n \r\n\r\nChi phí hàng tháng cho hoạt động thể thao như sau:\r\n\r\n \r\n\r\n-T7 = 70 triệu\r\n\r\n-T8 = 89 triệu\r\n\r\n \r\n\r\nTrước đó Admin chỉ tạm ứng 50 triệu , nay Admin xin đề xuất ỨNG THÊM 30 triệu nữa thì mới có tiền xoay ra cho các đội chi hàng tháng nhé Anh.\r\n\r\n \r\n\r\nThanks \r\n\r\nB,rgds\r\n\r\nSandra\r\n\r\n \r\n\r\n \r\n\r\n \r\n\r\nFrom: Lee Huynh <leehuynh@motivesvn.com <mailto:leehuynh@motivesvn.com> > \r\nSent: Thursday, August 31, 2023 9:30 AM\r\nTo: Tom Hoang <tomhoang@motivesvn.com <mailto:tomhoang@motivesvn.com> >\r\nCc: Adam Nguyen <adamnguyen@motivesvn.com <mailto:adamnguyen@motivesvn.com> >; Hook Pham <hookpham@motivesvn.com <mailto:hookpham@motivesvn.com> >; Sandra Nguyen <sandranguyen@motivesvn.com <mailto:sandranguyen@motivesvn.com> >\r\nSubject: RE: CÂU LẠC BỘ BÓNG ĐÁ- BÁO CÁO HOẠT ĐỘNG THÁNG 8/2023\r\n\r\n \r\n\r\nHI Tom\r\n\r\n \r\n\r\nOK duyệt chi phí này, \r\n\r\nTuy nhiên Em cần chú ý tập thể lực và chiến thuật cho đội hình tiêu biểu của Motives chuẩn bị cho giải Motives mở rộng nhé, các bạn nào nằm trong đội tuyển cần phải chú ý tập thường xuyên hơn\r\n\r\n \r\n\r\nHI Sandra\r\n\r\n \r\n\r\nEm chi cho đội bóng chi phí này dùm anh nhé, Thanks\r\n\r\n \r\n\r\nBest regards,\r\n\r\nLee Huynh\r\n\r\nG. Director\r\n\r\n \r\n\r\n\r\n\r\nMotives VietNam\r\nFloors 7-8-9, M Building, 09 Street No.8, Zone A, South New Urban Area\r\nTan Phu Ward, District 7, Ho Chi Minh City, Vietnam\r\nEmail: leehuynh@motivesvn.com- <mailto:leehuynh@motivesvn.com->  Skype:longhtan\r\nPhone:(84 28) 54 135 137 - Fax:(84 28) 54 135 141\r\nWebsite:motivesinternational.io <http://www.motivesinternational.io/> \r\n\r\n \r\n\r\nFrom: Tom Hoang <tomhoang@motivesvn.com <mailto:tomhoang@motivesvn.com> > \r\nSent: Wednesday, August 30, 2023 4:56 PM\r\nTo: Lee Huynh <leehuynh@motivesvn.com <mailto:leehuynh@motivesvn.com> >\r\nCc: Adam Nguyen <adamnguyen@motivesvn.com <mailto:adamnguyen@motivesvn.com> >; Hook Pham <hookpham@motivesvn.com <mailto:hookpham@motivesvn.com> >\r\nSubject: RE: CÂU LẠC BỘ BÓNG ĐÁ- BÁO CÁO HOẠT ĐỘNG THÁNG 8/2023\r\n\r\n \r\n\r\nDear Anh Lee,\r\n\r\n \r\n\r\nThay mặt CLB Bóng đá Motives em xin gửi báo cáo hoạt động T8/2023 như sau:\r\n\r\n \r\n\r\n*\tSố lượng thành viên câu CLB: 50 member (  số cũ 48)- chi tiết cập nhật như đính kèm\r\n*\tGiải M-league đã trải qua 8 trận đấu, chi tiết cập nhật như đính kèm\r\n*\tTất cả các thành viên vẫn tuân thủ tốt nội quy/ quy chế hoạt động của CLB\r\n\r\n \r\n\r\n*\tNhư trao đổi với anh về phương án thuê HLV để tập luyện thứ 5 hàng tuần, sau khi cân nhắc và đã tập thử nghiệm với 2 HLV  vào ngày 24/08/2023, em xin ý kiến và mong anh chấp thuận để thuê HLV (dự kiến đến hết năm 2023) nhằm nâng cao chất lượng chuyên môn/ kỹ- chiến thuật/ thể lực của các thành viên trong CLB và cũng để xây dựng 1 đội bóng có trình độ và năng lực cao hơn để tham gia các giải thi đấu giao hữu theo yêu cầu của công ty\r\n\r\n \r\n\r\n+ Thời gian tập luyện : 18h- 20h thứ 5 hàng tuần\r\n\r\n+ Chi phí thuê HLV: 600.000 (vnd)/ HLV/ buổi * 2 HLV* 19 buổi= 22.800.000 (vnd)\r\n\r\n \r\n\r\nEm cảm ơn\r\n\r\n \r\n\r\n \r\n\r\nBest regards,\r\n\r\n \r\n\r\n\r\n\r\nTom Hoang\r\n\r\n\r\nMotives VietNam\r\nM Building, Street C, Phu My Hung\r\nTan Phu Ward, District 7, Ho Chi Minh City, Vietnam\r\nEmail:tomhoang@motivesvn.com <mailto:tomhoang@motivesvn.com> \r\nPhone:(84 28) 54 135 137 - Fax:(84 28) 54 135 141\r\nWebsite:motivesinternational.io <http://www.motivesinternational.io/> \r\n\r\n \r\n\r\nFrom: Tom Hoang \r\nSent: Monday, July 31, 2023 11:48 AM\r\nTo: Lee Huynh <leehuynh@motivesvn.com <mailto:leehuynh@motivesvn.com> >\r\nCc: Adam Nguyen <adamnguyen@motivesvn.com <mailto:adamnguyen@motivesvn.com> >; Hook Pham <hookpham@motivesvn.com <mailto:hookpham@motivesvn.com> >\r\nSubject: CÂU LẠC BỘ BÓNG ĐÁ- BÁO CÁO HOẠT ĐỘNG THÁNG 7/2023\r\n\r\n \r\n\r\nDear Anh Lee,\r\n\r\n \r\n\r\nThay mặt CLB Bóng đá Motives em xin gửi báo cáo hoạt động T7/2023 như sau:\r\n\r\n \r\n\r\n*\tSố lượng thành viên câu CLB: 48 member (  số cũ 40)- chi tiết cập nhật như đính kèm\r\n*\tGiải M-league đã trải qua 3 trận đấu, chi tiết cập nhật như đính kèm\r\n*\tCLB vẫn tổ chức tập luyện thêm buổi thứ 5 hàng tuần. Tuy nhiên do vẫn chưa chốt được sân cố định nên phương án thuê HLV sẽ cập nhật lại vào cuối tháng 8/2023\r\n*\tTất cả các thành viên vẫn tuân thủ tốt nội quy/ quy chế hoạt động \r\n*\tMục tiêu trong tháng 8/2023 sẽ tiếp tục vận động thêm thành viên tham gia CLB ( ít nhất 2 member) và sẽ vận động thêm sự cổ vũ nhiều hơn từ khán giả để giải M-League tiếp tục được lan tỏa rộng rãi hơn\r\n\r\n \r\n\r\nEm cảm ơn\r\n\r\n \r\n\r\nBest regards,\r\n\r\n \r\n\r\n\r\n\r\nTom Hoang\r\n\r\n\r\nMotives VietNam\r\nM Building, Street C, Phu My Hung\r\nTan Phu Ward, District 7, Ho Chi Minh City, Vietnam\r\nEmail:tomhoang@motivesvn.com <mailto:tomhoang@motivesvn.com> \r\nPhone:(84 28) 54 135 137 - Fax:(84 28) 54 135 141\r\nWebsite:motivesinternational.io <http://www.motivesinternational.io/> \r\n\r\n \r\n\r\n",
    //     "senderEmail": "sandranguyen@motivesvn.com"
    // }

    // console.log('attachments', JSON.stringify(attachments));

    return (
        <Box component={'div'}>

            <ListItem sx={{ px: 0.5 }} onClick={handleViewMsg}>
                <Box>
                    <Chip
                        icon={<Iconify icon={IconName.outlook} sx={{ fontSize: 28 }} />}
                        sx={chipStyles}
                        tabIndex={-1}
                        label={file?.Name}
                        {...(others?.showDeleteButton && {
                            onDelete: () => others?.onDelete(file)
                        })}
                    />
                </Box>
            </ListItem>

            {visible &&
                <Popup
                    onHiding={onClose}
                    visible={visible}
                    title={file?.Name}
                    closeOnOutsideClick
                    showTitle
                    showCloseButton
                    width={'100%'}
                    height={'100%'}
                >
                    <ScrollView width={'100%'} height={'100%'}>
                        <Stack spacing={2}>

                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>{msgData?.subject} </Typography>

                            <Divider />

                            <Stack justifyContent={'flex-start'} sx={{ p: 0 }}>
                                <Stack spacing={1} direction={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                                    <Box sx={{ width: 50, justifyContent: 'center', alignItems: 'center' }}>
                                        <MyAvatar senderName={msgData?.senderName} />
                                    </Box>
                                    <Stack>
                                        <Typography variant='title' sx={{
                                            fontWeight: 'bold', fontSize: 20, ':hover': {
                                                backgroundColor: 'info.main',
                                                color: 'white',
                                            },
                                            cursor: 'pointer',
                                        }}>{`${msgData?.senderName ? msgData?.senderName : ""}`}</Typography>
                                        <Typography variant='title' sx={{
                                            fontWeight: 'bold', fontSize: 20, ':hover': {
                                                backgroundColor: 'info.main',
                                                color: 'white',
                                            },
                                            cursor: 'pointer',
                                        }}>{`${msgData?.senderEmail ? `<${msgData?.senderEmail}>` : ""}`}</Typography>
                                    </Stack>
                                </Stack>
                                <Stack direction={'row'} spacing={1} flexWrap={'wrap'} justifyContent={'flex-start'} alignItems={'center'} >
                                    <Box sx={{ minWidth: 50, justifyContent: 'center', alignItems: 'center' }} />
                                    <Typography sx={{ fontWeight: 'bold' }}>To:</Typography>  {
                                        (msgData?.recipients || []).map((rec, index) => (
                                            <Chip key={`${rec?.name}-${rec?.email}-${index}`} label={`${rec?.name ? rec.name : ""}${rec?.email ? ` <${rec.email}>` : ""}`}
                                                sx={chipStyles}
                                            />
                                        ))
                                    }
                                </Stack>

                            </Stack>

                            <Divider />

                            <Stack justifyContent={'flex-start'} alignItems={'center'}>
                                <List disablePadding sx={{ width: '100%', bgcolor: 'background.paper', }}>
                                    {
                                        attachments.length > 0 && (attachments || []).map((att, index) => {
                                            const { url, fileType, base64, fileName } = att
                                            // console.log('url, fileType', url, fileType, base64);
                                            if (fileType === 'pdf') {
                                                return (
                                                    <ListItem sx={{ px: 0.5 }}
                                                        key={att?.fileName}
                                                        // onClick={() => handleViewFile(url, fileType, base64, fileName)}
                                                        {...(!isWebApp && {
                                                            onClick: () => handleViewFile(url, fileType, base64, fileName)
                                                        })}
                                                    >
                                                        <Box
                                                            // component='a' href={base64} target='_blank'
                                                            // download={att?.fileName}
                                                            {...(isWebApp && {
                                                                component: 'a',
                                                                href: url,
                                                                target: '_blank'
                                                            })}
                                                        >
                                                            <Chip
                                                                icon={<Iconify icon={IconName.pdf} sx={{ fontSize: 28 }} />}
                                                                sx={chipStyles}
                                                                label={att?.fileName}
                                                            />
                                                        </Box>
                                                    </ListItem>
                                                )
                                            }

                                            if (fileType === 'image') {
                                                return (
                                                    <ListItem sx={{ px: 0.5 }} key={att?.fileName}
                                                        {...(!isWebApp && {
                                                            onClick: () => handleViewFile(url, fileType, base64, fileName)
                                                        })}
                                                    >
                                                        <Box
                                                            // component='a' href={url} target='_blank'
                                                            {...(isWebApp && {
                                                                component: 'a',
                                                                href: url,
                                                                target: '_blank'
                                                            })}
                                                        >
                                                            <Chip
                                                                icon={<Iconify icon={IconName.image} sx={{ fontSize: 28 }} />}
                                                                sx={chipStyles}
                                                                label={att?.fileName}
                                                            />
                                                        </Box>
                                                    </ListItem>
                                                )
                                            }

                                            if (fileType === 'excel') {
                                                return (
                                                    <ListItem sx={{ px: 0.5 }} key={att?.fileName}
                                                        {...(!isWebApp && {
                                                            onClick: () => handleViewFile(url, fileType, base64, fileName)
                                                        })}
                                                    >
                                                        <Box
                                                            // component='a' href={url} target='_blank' download={att?.fileName}
                                                            {...(isWebApp && {
                                                                component: 'a',
                                                                href: url,
                                                                target: '_blank'
                                                            })}
                                                        >
                                                            <Chip
                                                                icon={<Iconify icon={IconName.excel} sx={{ fontSize: 28 }} />}
                                                                sx={chipStyles}
                                                                label={att?.fileName}
                                                            />
                                                        </Box>
                                                    </ListItem>
                                                )
                                            }


                                            if (fileType === 'word') {
                                                return (
                                                    <ListItem sx={{ px: 0.5 }} key={att?.fileName}
                                                        {...(!isWebApp && {
                                                            onClick: () => handleViewFile(url, fileType, base64, fileName)
                                                        })}
                                                    >
                                                        <Box
                                                            // component='a' href={url} target='_blank' rel="noopener noreferrer" download={att?.fileName}
                                                            {...(isWebApp && {
                                                                component: 'a',
                                                                href: url,
                                                                target: '_blank'
                                                            })}
                                                        >
                                                            <Chip
                                                                icon={<Iconify icon={IconName.word} sx={{ fontSize: 28 }} />}
                                                                sx={chipStyles}
                                                                label={att?.fileName}
                                                            />
                                                        </Box>
                                                    </ListItem>
                                                )
                                            }


                                            return (
                                                <ListItem sx={{ px: 0.5 }} key={att?.fileName}
                                                    {...(!isWebApp && {
                                                        onClick: () => handleViewFile(url, fileType, base64, fileName)
                                                    })}
                                                >
                                                    <Box
                                                        // component='a' href={url} target='_blank' download={att?.fileName} rel="noopener noreferrer"
                                                        {...(isWebApp && {
                                                            component: 'a',
                                                            href: url,
                                                            target: '_blank'
                                                        })}
                                                    >
                                                        <Chip
                                                            icon={<Iconify icon={'flat-color-icons:file'} sx={{ fontSize: 28 }} />}
                                                            sx={chipStyles}
                                                            label={att?.fileName}
                                                        />
                                                    </Box>
                                                </ListItem>
                                            )
                                        })
                                    }

                                    {
                                        innerMsgContent.length > 0 &&
                                        innerMsgContent.map((att) => {
                                            return (
                                                <ListItem sx={{ px: 0.5 }} key={att?.name} >
                                                    <Box>
                                                        <Chip
                                                            icon={<Iconify icon={IconName.outlook} sx={{ fontSize: 28 }} />}
                                                            sx={chipStyles}
                                                            label={att?.name}
                                                        />
                                                    </Box>
                                                </ListItem>
                                            )
                                        })
                                    }
                                </List>
                            </Stack>

                            <Divider />

                            <div dangerouslySetInnerHTML={{ __html: msgData?.body.toString().replaceAll(/\n\s*\n\s*\n/g, '\n\n') }} style={{ whiteSpace: 'pre-line' }} />

                        </Stack>
                    </ScrollView>

                    <IconButton sx={{
                        position: 'fixed',
                        zIndex: 1000000,
                        bottom: 20,
                        right: 20,
                        width: 50,
                        height: 50,
                        bgcolor: theme => theme.palette.primary.main,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                        onClick={() => handleDowloadAllFile()}
                    >
                        <Iconify icon={IconName.arrowDown} sx={{ fontSize: 30, color: 'white' }} />
                    </IconButton>

                </Popup>
            }
        </Box >
    )
}

const downloadBlobURL = (content, file, isWebApp) => {
    // console.log(data)
    let mimeType = "image/png";
    const fileType = getFileFormat(file.fileName)
    // console.log(data.content, fileType);
    switch (fileType) {
        case 'pdf':
            // code block
            mimeType = 'application/pdf'
            break;
        case 'image':
            // code block
            mimeType = `image/${file.extension.split('.')[1]}`
            break;
        case 'word':
            // code block
            mimeType = `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
            break;
        case 'excel':
            // code block
            mimeType = `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
            break;
        default:

        // code block
    }
    // console.log(mimeType)
    const blob = new Blob([content], {
        type: mimeType
    })

    const url = window.URL.createObjectURL(blob);

    // console.log(base64String);

    if (!isWebApp) {
        const base64String = encode(content);
        return {
            url,
            fileType,
            base64: `data:${mimeType};base64,${base64String}`,
        }
    }

    return {
        url,
        fileType,
        // base64: `data:${mimeType};base64,${base64String}`,
        base64: null,
    }
}

function MyAvatar({ senderName, ...other }) {
    return (
        <Avatar
            src={null}
            alt={'sender'}
            color={createAvatar(senderName).color}
            {...other}
        >
            {createAvatar(senderName).name}
        </Avatar>
    );
}


// const blobToImage = (binaryUrl) => {
//     console.log(binaryUrl)
//     const canvas = document.createElement("canvas")
//     const img = document.createElement('img');
//     img.src = binaryUrl;
//     img.width = '100%';
//     img.height = '100%';
//     const context = canvas.getContext("2d")
//     context.drawImage(img, 0, 0);
//     return canvas.toDataURL();
// }

// let link=document.createElement('a');
// const mimeType = "application/pdf";
// link.href=`data:${mimeType};base64,${base64Str}`;
// link.download="myFileName.pdf";
// link.click();

// const fileConvert = new File([blobImage], `Image-${Attachments.length + 1}.jpeg`, {
//     lastModified: moment().unix(),
//     type: blobImage.type,
//   });