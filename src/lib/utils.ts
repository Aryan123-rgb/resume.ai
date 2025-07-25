import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const prepareLatexCode = (jsonData: any) => {
  console.log("jsonData", jsonData);
  let mainLatexCode = jsonData.main as string;
  Object.entries(jsonData).forEach(([key, value]) => {
    mainLatexCode = mainLatexCode.replaceAll(`{{${key}}}`, String(value || ""));
  })
  return mainLatexCode;
}