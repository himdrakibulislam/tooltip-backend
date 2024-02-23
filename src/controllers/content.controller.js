import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import openai from "../utils/openAI.js";
import { Content } from "../models/content.model.js";
import {
  ADCOPY_TYPE,
  AI_BLOG,
  AUDIO_TRANSCRIPTION,
  adcopyPrompt,
} from "../constants.js";
import fs from "fs";
import mongoose from "mongoose";
import GoogleAI from "../utils/googleBard.js";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const generateAudioTranscript = asyncHandler(async (req, res) => {
  if (!req.file.path) {
    throw new ApiError(401, "Audio is required.");
  }
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
    });
    if (transcription.text) {
      await Content.create({
        userId: req.user._id,
        type: AUDIO_TRANSCRIPTION,
        content: transcription.text,
      });
    }
    return res.json(
      new ApiResponse(
        200,
        { transcription: transcription.text },
        "Transcription Created."
      )
    );
  } catch (error) {
    throw new ApiError(401, "An Error occurred while generating the Image.");
  } finally {
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }
  }
});

const generateAdCopy = asyncHandler(async (req, res) => {
  const { industry, website, product, social, productImageURL } = req.body;
  if (
    [industry, website, product, social, productImageURL].some(
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
      const adcopy = await Content.create({
        userId: req.user._id,
        type: ADCOPY_TYPE,
        content: completion.choices[0].message.content,
        adcopyProductImageURL: productImageURL,
      });
      return res.json(new ApiResponse(200, { adcopy }, "Adcopy generated"));
    }
  } catch (error) {
    throw new ApiError(400, "An Error occurred while generating the adcopy.");
  }
});
const generateAIBlog = asyncHandler(async (req, res) => {
  const { topic } = req.body; 
  if(!topic){
    throw new ApiError(401,"Topic is required.")
  }
  const model = GoogleAI.getGenerativeModel({ model: "gemini-1.0-pro" });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    {
      text: `Write a short, engaging blog post about ${topic}. It should include a description blog title keywords.`,
    },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });
    if(result.response){
      await Content.create({
        userId: req.user._id,
        type: AI_BLOG,
        content: result?.response?.text(),
      });
    }
    const blog = result?.response?.text();
  
    return res.json(new ApiResponse(200, { blog: blog }, "blog generated"));
  } catch (error) {
    throw new ApiError(401,"An Error occurred while generating the blog.");
  }
});

const deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) {
    throw new ApiError(401, "Invalid Object ID");
  }

  const content = await Content.findOneAndDelete({
    userId: req.user._id,
    _id: id,
  });
  return res.json(
    new ApiResponse(
      200,
      { isContentRemoved: content ? true : false },
      "Content Removed Successfully."
    )
  );
});
export {
  generateAudioTranscript,
  generateAdCopy,
  deleteContent,
  generateAIBlog,
};
