import { Card, Step, StepLabel, Stepper } from '@mui/material';
import { useEffect, useState } from 'react';
import useResponsive from '../hooks/useResponsive';
// hook
import useLocales from '../hooks/useLocales';
// Redux
import { useSelector } from '../redux/store';
import Scrollbar from './Scrollbar';

const ProductStepper = ({ WFInstance }) => {
  // // Hooks
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  // Component states
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (WFInstance !== null) {
      const stepSorting = [...WFInstance.WFStatuses].sort((a, b) => Number(a.Order) - Number(b.Order));
      const currentStateIndex = stepSorting.findIndex((status) => status.Id === WFInstance?.CurrentStatus?.Id);
      const isLastStep = currentStateIndex === stepSorting.length - 1;
      let currentProgress = {};
      stepSorting.forEach((item, index) => {
        currentProgress = { ...currentProgress, [`${index}`]: isLastStep ? true : index < currentStateIndex };
      });
      setCompleted(currentProgress);
      setActiveStep(currentStateIndex);
    }
  }, [WFInstance]);

  useEffect(() => {
    const currentstep = document.getElementById(`stepper-${WFInstance?.CurrentStatus?.StatusName}`);
    if (currentstep) {
      currentstep.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
    }
  }, [completed, activeStep, WFInstance]);

  if (WFInstance === null) {
    return null;
  }

  const steps =
    [...WFInstance.WFStatuses].sort((a, b) => Number(a.Order) - Number(b.Order)).map((item) => item?.StatusName) || [];

  return (
    <Card sx={{ pt: 2, pb: 2, pl: 0, pr: 0 }}>
      <Scrollbar sx={{ px: 1, py: 0 }}>
        <Stepper nonLinear activeStep={activeStep} orientation="horizontal" alternativeLabel>
          {steps.length > 0 &&
            steps.map((label, index) => (
              <Step key={`${label}-${index}`} completed={completed[index]} sx={{ minWidth: 70 }} id={`stepper-${label}`}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: 10,
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
        </Stepper>
      </Scrollbar>
    </Card>
  );
};

export default ProductStepper;
