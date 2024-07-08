/* eslint-disable */
export default function handleRequestError(error) {
    let message = ''
    if (typeof error?.response === 'object' || error?.status) {
        // The request was made and the server responded with a status code
        const status = error?.response?.status || error?.status;
        const errorMessage = error?.response?.data || error?.message;
        switch (status) {
            case 400:
                console.error("Bad request: ", errorMessage);
                message = `${status} Bad request: ${JSON.stringify(errorMessage) || ""}`
                break;
            case 401:
                console.error("Unauthorized: ", errorMessage);
                message = `${status} Unauthorized: ${JSON.stringify(errorMessage) || ""}`
                break;
            case 404:
                console.error("Resource not found: ", errorMessage);
                message = `${status} Resource not found: ${JSON.stringify(errorMessage) || ""}`
                break;
            case 500:
                console.error("Internal server error: ", errorMessage);
                message = `${status} Internal server error: ${JSON.stringify(errorMessage) || ""}`
                break;
            default:
                console.error("Unhandled error: ", errorMessage);
                message = `${status} Unhandled error: ${JSON.stringify(errorMessage) || ""}`
                break;
        }
    } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received: ", error.request);
        message = "No response received: " + JSON.stringify(error.request);
    } else {
        // Something happened in setting up the request that triggered an error
        console.error("Error setting up request: ", error.message);
        message = "Error setting up request: " + JSON.stringify(error.message) || "";
    }
    return message
}

