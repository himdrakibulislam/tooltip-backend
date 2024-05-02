import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const imageToPDF = asyncHandler(async (req, res) => {
  
  return res.json(
    new ApiResponse(200, "Success", "Success.")
  );
});

export { imageToPDF };
