import Language from "../models/languageModel.js";
const getLanguages = async (req, res, next) => {
  try {
    const language = await Language.find();
    res.status(200).json(language);
  } catch (e) {
    return next(e);
  }
};
export { getLanguages };
