import getAIResponse from "../services/aiService.js";

const getReview = async (req, res) => {
  const code = req.body.code;

  if (!code) {
    return res.status(400).send("Prompt Required");
  }

  const response = await getAIResponse(code);

  res.send(response);
};

export { getReview };
