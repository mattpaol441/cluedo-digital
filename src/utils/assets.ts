import type { SuspectID, WeaponID, RoomID, Card } from "@cluedo-digital/shared";

//Import avatar images
import greenAvatar from "../assets/suspectAvatars/greenAvatar.jpg";
import mustardAvatar from "../assets/suspectAvatars/mustardAvatar.jpg";
import orchidAvatar from "../assets/suspectAvatars/orchidAvatar.jpg";
import peacockAvatar from "../assets/suspectAvatars/peacockAvatar.jpg";
import plumAvatar from "../assets/suspectAvatars/plumAvatar.jpg";
import scarletAvatar from "../assets/suspectAvatars/scarletAvatar.jpg";

//Import weapon card images
import candlestickImage from "../assets/weaponCard/candlestickCluedo.png";
import daggerImage from "../assets/weaponCard/daggerCluedo.png";
import leadPipeImage from "../assets/weaponCard/leadpipeCluedo.png";
import revolverImage from "../assets/weaponCard/revolverCluedo.png";
import ropeImage from "../assets/weaponCard/ropeCluedo.png";
import wrenchImage from "../assets/weaponCard/wrenchCluedo.png";


// Import room card images
import ballroomImage from "../assets/roomCard/ballroomCluedo.jpg";
import billiardRoomImage from "../assets/roomCard/billiardroomCluedo.jpg";
import conservatoryImage from "../assets/roomCard/conservatoryCluedo.jpg";
import diningRoomImage from "../assets/roomCard/diningroomCluedo.jpg";
import hallImage from "../assets/roomCard/hallCluedo.jpg";
import kitchenImage from "../assets/roomCard/kitchenCluedo.jpg";
import libraryImage from "../assets/roomCard/libraryCluedo.jpg";
import loungeImage from "../assets/roomCard/loungeCluedo.jpg";
import studyImage from "../assets/roomCard/studyCluedo.jpg";

// Mapping 
const AVATAR_MAP: Record<SuspectID, string> = {
    green: greenAvatar,
    mustard: mustardAvatar,
    orchid: orchidAvatar,
    peacock: peacockAvatar,
    plum: plumAvatar,
    scarlet: scarletAvatar,
};

const WEAPON_MAP: Record<WeaponID, string> = {
    candlestick: candlestickImage,
    dagger: daggerImage,
    lead_pipe: leadPipeImage,
    revolver: revolverImage,
    rope: ropeImage,
    wrench: wrenchImage,
};

const ROOM_MAP: Record<RoomID, string> = {
    ballroom: ballroomImage,
    billiard_room: billiardRoomImage,
    conservatory: conservatoryImage,
    dining_room: diningRoomImage,
    hall: hallImage,
    kitchen: kitchenImage,
    library: libraryImage,
    lounge: loungeImage,
    study: studyImage,
};

//Helper function to get avatar by SuspectID
export const getCharacterAvatar = (characterId: SuspectID): string => {
    return AVATAR_MAP[characterId];
};

export const getCardImage = (card: Card): string => {
    if (card.type === 'SUSPECT') {
        return AVATAR_MAP[card.id as SuspectID];
    } else if (card.type === 'WEAPON') {
        return WEAPON_MAP[card.id as WeaponID];
    } else if (card.type === 'ROOM') {
        return ROOM_MAP[card.id as RoomID];
    }
    return "";
}