// components
import Page from "../../components/Page";
// import MapMonthlyPlan from './MapMonthlyPlan.tsx';
import MapMonthlyPlanRevise from "./MapMonthlyPlanningRevise.tsx";
// Utils

export default function TQAMonthlyPlan() {
    return (
        <Page title="TQA - Monthly Production">
            <div style={{
                overflow: 'hidden',
                width: window.screen.width,
                height: window.screen.height,
                position: 'fixed',
            }}
                id="map-container"
            >
                {/* <MapMonthlyPlan /> */}
                <MapMonthlyPlanRevise />
            </div>
        </Page>
    );
}
