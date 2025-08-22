import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceManagement from "./ServiceManagement";
import JobCardDetailsPage from "./jobCardDetailsPage";

const Service = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setActiveStep(1); 
  };

  console.log(activeStep,'activestep')

  // const handleNext = () => {
  //   setActiveStep(prev => prev + 1);
  // };

  return (
    <div>
      {activeStep === 0 && (
        <ServiceManagement onView={handleViewRequest} />
      )}
      {activeStep === 1 && (
        <JobCardDetailsPage 
          handleBack={handleBack} 
          request={selectedRequest}
        />
      )}
    </div>
  )
}

export default Service;