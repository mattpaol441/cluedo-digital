import type { SuspectID } from "@cluedo-digital/shared";

//Import avatar images
import greenAvatar from "../assets/greenAvatar.jpg";
import mustardAvatar from "../assets/mustardAvatar.jpg";
import orchidAvatar from "../assets/orchidAvatar.jpg";
import peacockAvatar from "../assets/peacockAvatar.jpg";
import plumAvatar from "../assets/plumAvatar.jpg";
import scarletAvatar from "../assets/scarletAvatar.jpg";

// Mapping 
const AVATAR_MAP: Record<SuspectID, string> = {
    green: greenAvatar,
    mustard: mustardAvatar,
    orchid: orchidAvatar,
    peacock: peacockAvatar,
    plum: plumAvatar,
    scarlet: scarletAvatar,
};

//Helper function to get avatar by SuspectID
export const getCharacterAvatar = (characterId: SuspectID): string => {
    return AVATAR_MAP[characterId];
};