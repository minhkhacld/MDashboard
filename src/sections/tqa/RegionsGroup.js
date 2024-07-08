import { Badge } from '@mui/material';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import styled from 'styled-components';
import mapMarkerIc from '../../assets/images/motive_logo_round.png';
import Image from '../../components/Image';

const RootStyled = styled('div', {
    shouldForwardProp: (prop) => true,
})(({ zoom, theme }) => {
    const size = zoom * 50 / 6;
    return {
        width: size,
        height: size,
        transform: 'translate(-50%,-50%)',
        '&:hover': {
            transform: 'translate(-50%,-50%) scale(1.2)',
            transition: 'all 1s ease',
        }
    }
})

const findMiddleItem = (arr) => {
    let lat = 0;
    let lng = 0;
    if (arr.length <= 2) {
        lat = Number(arr[0].lat);
        lng = Number(arr[0].lng);
    } else {
        lat = Number(arr[Math.floor(arr.length / 2)].lat);
        lng = Number(arr[Math.floor(arr.length / 2)].lng);
    }
    return {
        lat, lng
    }

}

export default function RegionsGroups({
    groups = [],
    zoom = 6,
    name = '',
    setMapDefault = () => { },
    lat = 0,
    lng = 0,
}) {


    const onOpenDetail = () => {
        const middleItem = findMiddleItem(groups);
        setMapDefault({
            zoom: 8,
            center: middleItem,
        })
    };

    return (
        <RootStyled zoom={zoom} onClick={onOpenDetail}>
            <Badge color="error" badgeContent={groups.length}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                }}
            >
                <Image src={mapMarkerIc} />
            </Badge>
        </RootStyled >
    )
}
