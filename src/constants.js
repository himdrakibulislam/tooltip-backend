export const DB_NAME = "videotube";
export const IMAGE_TYPE = "image";
export const ADCOPY_TYPE = "adcopy";

export function adcopyPrompt(industry, website, product, social) {
  return `Act as a Copywriter and prepare Ad Copy for Facebook Ads in the below format with the following details: 

    Industry: ${industry} 
    Website:  ${website}
    Product:  ${product}
    Social platform: ${social}
    
    Format: 
    
    Headline: 
    Primary Text: 
    Link Description: 
    Creative Suggestions:`;
}
