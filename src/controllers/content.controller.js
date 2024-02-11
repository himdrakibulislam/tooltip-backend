import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import openai from "../utils/openAI.js";
import { Content } from "../models/content.model.js";
const generateAiImage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    throw new ApiError(401, "Prompt is required.");
  }
  try {
    const image = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
    });
    if (image.data && image.data.length > 0) {
      await Content.create({
        userId: req.user._id,
        type: "image",
        content: image.data[0].url,
      });
    }
    return res.json(
      new ApiResponse(200, { image: image.data[0].url }, "AI Image generated.")
    );
  } catch (error) {
    throw new ApiError(401, "An Error occurred while generating the Image.");
  }
});

export { generateAiImage };
