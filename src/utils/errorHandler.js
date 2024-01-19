import { ApiError } from './apiError.js'; 
import { ApiResponse } from './apiResponse.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const { statusCode, message, errors } = err;
    
    return res.status(statusCode).json( new ApiResponse(
        statusCode,
        {},
        message
    ));
  }
 
  console.error(err);

  res.status(500).json(new ApiResponse(
    500,
    {},
    "Internal Server Error"
));
  
};

export { errorHandler };
