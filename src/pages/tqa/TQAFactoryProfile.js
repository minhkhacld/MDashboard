import Page from "../../components/Page";
// import MapFactoryProfile from './MapFactoryProfile.tsx';
import MapFactoryProfileRevise from "./MapFactoryProfileRevise.tsx";
// Utils

export default function TQAFactoryProfile() {
    return (
        <Page title="TQA - Factory Profile">
            <div style={{
                overflow: 'hidden',
                width: window.screen.width,
                height: window.screen.height,
                position: 'fixed',
            }}>
                <MapFactoryProfileRevise />
            </div>
        </Page>
    );
}
