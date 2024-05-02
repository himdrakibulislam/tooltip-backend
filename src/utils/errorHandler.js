import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const { statusCode, message, errors } = err;

    return res
      .status(statusCode)
      .json(new ApiResponse(statusCode, {}, message));
  }
  res
    .status(500)
    .json(
      new ApiResponse(500, { error: err.message }, "Internal Server Error")
    );
};

export { errorHandler };
