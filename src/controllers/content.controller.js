import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import openai from "../utils/openAI.js";
import { Content } from "../models/content.model.js";
import { ADCOPY_TYPE, IMAGE_TYPE, adcopyPrompt } from "../constants.js";
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
        type: IMAGE_TYPE,
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

const generateAdCopy = asyncHandler(async (req, res) => {
  const { industry, website, product, social } = req.body;
  if (
    [industry, website, product, social].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(401, "All fields are required");
  }
  const prompt = adcopyPrompt(industry, website, product, social);
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 2048,
      temperature: 0.5,
      top_p: 1.0,
      frequency_penalty: 0.52,
      presence_penalty: 0.5,
    });
    if (completion?.choices && completion?.choices?.length > 0) {
      await Content.create({
        userId: req.user._id,
        type: ADCOPY_TYPE,
        content: completion.choices[0].message.content,
      });
    }
    return res.json(
      new ApiResponse(
        200,
        { prompt: completion?.choices[0]?.message?.content },
        "Adcopy generated"
      )
    );
  } catch (error) {
    throw new ApiError(400, "An Error occurred while generating the adcopy.");
  }
});

export { generateAiImage, generateAdCopy };
