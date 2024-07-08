import templeOfLiteratureReal from "../../assets/images/map/temple-of-literature-real.jpeg";
import meridianGate from "../../assets/images/map/meridian-gate.jpeg";
import dragonBridge from "../../assets/images/map/dragon-bridge.jpeg";
import benThanhMarket from "../../assets/images/map/Ben_Thanh_market.jpeg";
import chuaMotCot from "../../assets/images/map/chua-mot-cot.jpg";
import mBuilding from "../../assets/images/map/m-building.jpeg";
import flagOfVN from "../../assets/images/map/Flag_of_Vietnam.png";
import roundedMLogo from "../../assets/images/motive_logo_round.png";


export const humbergerMenuStyles = {
    container: {
        height: 56,
        width: 56,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: 'primary.main',
            color: 'white',
        }
    },
};

export const mapThemeStyles = {
    container: {
        height: 56,
        width: 56,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: 'primary.main',
            color: 'white',
        }
    },
};

export const mapTypeStyles = {
    container: {
        height: 56,
        width: 56,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: 'primary.main',
            color: 'white',
        }
    },
};

export const resetButtonStyles = {
    container: {
        height: 56,
        width: 56,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: 'primary.main',
            color: 'white',
        }
    },
};


export const MapLocationConfigs = {
    HANOI: {
        lat: 21.028511,
        lng: 105.804817,
    },
    HUE: {
        lat: 16.463713,
        lng: 107.590866,
    },
    DANANG: {
        lat: 16.047079,
        lng: 108.206230,
    },
    HCM: {
        lat: 10.8231,
        lng: 106.6297,
    },
    MOTIVESHQ: {
        lat: 10.7506119,
        lng: 106.6537261,
    },
};

export const MapSpecialLocationConfigs = [
    {
        city: "Hà Nội",
        lat: 21.028511,
        lng: 105.804817,
        id: 1,
        icon: flagOfVN,
        transformLogo: "translate(-40%,-20%)",
        transformText: "translate(-20px,56px)",
        zIndex: 1000000,
        width: 50,
    },
    {
        city: "",
        lat: 21.028511,
        lng: 105.804817,
        id: 2,
        icon: templeOfLiteratureReal,
        transformLogo: "translate(50%,-100%)",
        transformText: "translate(0px,0px)",
        zIndex: 1000000,
        width: 40,

    },
    {
        city: "Huế",
        lat: 16.463713,
        lng: 107.590866,
        id: 3,
        icon: meridianGate,
        transformLogo: "translate(0%,-110%)",
        transformText: "translate(0px,8px)",
        zIndex: 1000000,
        width: 40,
    },
    {
        city: "Đà Nẵng",
        lat: 16.047079,
        lng: 108.206230,
        id: 4,
        icon: dragonBridge,
        transformLogo: "translate(0%,-110%)",
        transformText: "translate(0px,10px)",
        zIndex: 1000000,
        width: 40,
    },
    {
        city: "Hồ Chí Minh",
        lat: 10.8231,
        lng: 106.6297,
        id: 5,
        icon: benThanhMarket,
        transformLogo: "translate(-70%,0%)",
        transformText: "translate(-30%,220%)",
        zIndex: 1000000,
        width: 40,
    },
    {
        city: "Motives Headquarter",
        lat: 10.7506119,
        lng: 106.6537261,
        id: 6,
        icon: roundedMLogo,
        transformLogo: "translate(90%,-80%)",
        transformText: "translate(50%,90%)",
        zIndex: 1000000,
        width: 50,
    },
];

