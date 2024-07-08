import { Box } from '@mui/material';
import PieChart, {
    Connector,
    Export,
    Font,
    Label,
    Legend,
    Margin,
    Series,
    Size
} from 'devextreme-react/pie-chart';
import { mapColorPalette } from "../../../pages/tqa/mapStyle";

// ----------------------------------------------------------------

const mockData = [
    { category: "Pass", value: 5 },
    { category: "Fail", value: 3 },
    { category: "Pass with condition", value: 2 },
    { category: "N/A", value: 1 },
]

const customizeText = (arg) => {
    return `${arg.percentText}`;
}

const customPalette = [mapColorPalette.green, mapColorPalette.red, mapColorPalette.yellow, 'gray'];

// ----------------------------------------------------------------
export default function DxPieChart({ dataSource = [], isHovered = false, anchorEl = null, handlePopoverClose = () => { } }) {
    return (
        <Box
            component={'div'}
            p={isHovered ? 0 : 1}
            position={"absolute"}
            {...isHovered ? {
                // bottom: -170,
                bottom: anchorEl.mouseY,
                left: 0,
            } :
                {
                    right: -8,
                    top: 0,
                }
            }
            zIndex={(theme) => theme.zIndex.appBar}
            sx={{ backgroundColor: isHovered ? "white" : "none" }}
            borderRadius={1}
        >
            <PieChart
                dataSource={dataSource}
                // palette="Bright"
                palette={customPalette}
                title=""
                showZeroes
                resolveLabelOverlapping="shift"
                animation={{
                    // enabled: false,
                }}
            >
                <Series
                    argumentField="label"
                    valueField="value">
                    <Label
                        visible={isHovered}
                        position="column"
                        overlappingBehavior={"none"}
                        customizeText={customizeText}
                        radialOffset={0}
                    >
                        <Connector visible={isHovered} width={.2} />
                    </Label>
                </Series>
                <Legend
                    visible={isHovered}
                    orientation="horizontal"
                    verticalAlignment="bottom"
                    horizontalAlignment="center"
                    itemTextPosition="right"
                    rowCount={1}
                    paddingLeftRight={0} paddingTopBottom={0}
                    margin={{ top: 5, left: 0, right: 0, bottom: 5 }}
                    markerSize={10}
                >
                    <Font size={8} />
                </Legend>
                <Size height={isHovered ? 150 : 30} width={isHovered ? 260 : 30} />
                <Export enabled={false} />
                <Margin
                    top={2}
                    bottom={2}
                    left={2}
                    right={2}
                />
            </PieChart>
        </Box>

    )
}

// export default function DxPieChart({ dataSource = mockData, isHovered = false, anchorEl = null, handlePopoverClose = () => { } }) {
//     return (
//         <>
//             <Box
//                 component={'div'}
//                 p={0}
//                 position={"absolute"}
//                 right={0}
//                 top={1}
//                 zIndex={(theme) => theme.zIndex.appBar}
//                 sx={{ backgroundColor: "transparent" }}
//                 borderRadius={1}
//             >
//                 <PieChart
//                     dataSource={dataSource}
//                     // palette="Bright"
//                     palette={customPalette}
//                     title=""
//                     // onPointClick={pointClickHandler}
//                     // onLegendClick={legendClickHandler}
//                     showZeroes
//                     resolveLabelOverlapping="shift"
//                     animation={{ enabled: false }}
//                 >
//                     <Series
//                         argumentField="category"
//                         valueField="value">
//                         <Label visible={isHovered}
//                             position="columns"
//                             overlappingBehavior={"none"}
//                             customizeText={customizeText}
//                         >
//                             <Connector visible={isHovered} width={1} />
//                         </Label>
//                     </Series>
//                     <Legend visible={isHovered} verticalAlignment="bottom" horizontalAlignment="center" itemTextPosition="right"
//                         rowCount={2} />
//                     <Title text="" />
//                     <Size height={30} width={30} />
//                     <Export enabled={false} />
//                     <Margin
//                         top={2}
//                         bottom={2}
//                         left={2}
//                         right={2}
//                     />
//                 </PieChart>
//             </Box>
//             {
//                 isHovered && (
//                     <Popover
//                         open={isHovered}
//                         // anchorEl={anchorEl}
//                         // placement="top-end"
//                         onClose={handlePopoverClose}
//                         onMouseLeave={(e) => { console.log(e); }}
//                         disablePortal={false}
//                         anchorReference='anchorPosition'
//                         anchorOrigin={{ vertical: 'top', }}
//                         anchorPosition={{ top: anchorEl.mouseY, left: anchorEl.mouseX }}
//                         modifiers={[
//                             {
//                                 name: 'flip',
//                                 options: {
//                                     fallbackPlacements: []
//                                 },
//                                 enabled: false,
//                             },
//                             {
//                                 name: 'preventOverflow',
//                                 enabled: true,
//                                 options: {
//                                     altAxis: true,
//                                     altBoundary: true,
//                                     tether: true,
//                                     rootBoundary: 'document',
//                                     padding: 8,
//                                 },
//                             },
//                             {
//                                 name: 'arrow',
//                                 enabled: true,
//                                 element: anchorEl,
//                             },
//                         ]}
//                     >

//                         <Box
//                             component={'div'}
//                             p={1}
//                             // position={"absolute"}
//                             // right={1}
//                             // top={-230}
//                             zIndex={(theme) => theme.zIndex.appBar}
//                             sx={{ backgroundColor: "white" }}
//                             borderRadius={1}
//                         >
//                             <PieChart
//                                 dataSource={dataSource}
//                                 // palette="Bright"
//                                 palette={customPalette}
//                                 title=""
//                                 showZeroes
//                                 resolveLabelOverlapping="shift"
//                                 animation={{ enabled: false }}
//                             >
//                                 <Series
//                                     argumentField="category"
//                                     valueField="value">
//                                     <Label visible={isHovered}
//                                         position="columns"
//                                         overlappingBehavior={"none"}
//                                         customizeText={customizeText}
//                                     >
//                                         <Connector visible={isHovered} width={0.5} />
//                                     </Label>
//                                 </Series>
//                                 <Legend
//                                     visible={isHovered}
//                                     orientation="horizontal"
//                                     verticalAlignment="bottom"
//                                     horizontalAlignment="center"
//                                     itemTextPosition="right"
//                                     rowCount={1}
//                                     paddingLeftRight={0} paddingTopBottom={0}

//                                 />
//                                 <Size height={200} width={250} />
//                                 <Export enabled={false} />
//                                 <Margin
//                                     top={2}
//                                     bottom={2}
//                                     left={2}
//                                     right={2}
//                                 />
//                             </PieChart>
//                         </Box>
//                     </Popover>
//                 )

//             }
//         </>
//     )
// }