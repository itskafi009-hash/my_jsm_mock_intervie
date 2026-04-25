import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* --------------------------------- */
/*  Tailwind class merger function   */
/* --------------------------------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* --------------------------------- */
/*  Devicon Base URL                 */
/* --------------------------------- */
const techIconBaseURL =
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

/* --------------------------------- */
/*  Normalize Tech Name              */
/* --------------------------------- */
const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");

  return mappings[key as keyof typeof mappings];
};

/* --------------------------------- */
/*  Check If Icon Exists             */
/* --------------------------------- */
const checkIconExists = async (url: string) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

/* --------------------------------- */
/*  Get Tech Logos                   */


export interface TechIcon {
    tech: string;
    url: string;
}

export const getTechLogos = async (
    techArray: string[]
): Promise<TechIcon[]> => {
    const results = await Promise.all(
        ( techArray || []).map(async (tech) => {
            const normalized = normalizeTechName(tech);

            if (!normalized) return null;

            const url = `${techIconBaseURL}/${normalized}/${normalized}-original.svg`;

            const exists = await checkIconExists(url);

            if (exists) {
                return {
                    tech, // original tech name (for tooltip)
                    url,  // icon url
                };
            }

            return null;
        })
    );

    // Proper type-safe filtering
    return results.filter(
        (item): item is TechIcon => item !== null
    );
};

/* --------------------------------- */
/*  Get Random Interview Cover       */
/* --------------------------------- */
/*export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(
      Math.random() * interviewCovers.length
  );

  return `/covers${interviewCovers[randomIndex]}`;
};
export function getRandomInterviewCover(id: string) {
    const covers = [
        "/covers/cover1.png",
        "/covers/cover2.png",
        "/covers/cover3.png",
    ];


    // Convert string id into number safely
    const numericValue = id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const index = numericValue % covers.length;

    return covers[index];
}*/
export function getRandomInterviewCover(id: string) : string {
    const covers = [
        "/covers/adobe.png",
        "/covers/amazon.png",
        "/covers/facebook.png",
        "/covers/hostinger.png",
        "/covers/pinterest.png",
        "/covers/quora.png",
        "/covers/reddit.png",
        "/covers/skype.png",
        "/covers/spotify.png",
        "/covers/telegram.png",
        "/covers/tiktok.png",
        "/covers/yahoo.png",
    ];
    const safeId = id ?? "default"
    const numericValue = safeId
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const index = numericValue % covers.length;

    return covers[index];
}