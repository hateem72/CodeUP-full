// src/utils/handleError.js
const handleError = (error) => {
    // Check if the error response exists and has a message
    if (error.response && error.response.data) {
      alert(error.response.data); // Display the error message from the backend
    } else {
      alert("An unexpected error occurred."); // Fallback message
    }
  };
  
  export default handleError;