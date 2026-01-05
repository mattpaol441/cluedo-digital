import type { SuspectID, WeaponID, RoomID, Card } from "@cluedo-digital/shared";

//Import avatar images
import greenAvatar from "../assets/suspectAvatars/greenAvatar.jpg";
import mustardAvatar from "../assets/suspectAvatars/mustardAvatar.jpg";
import orchidAvatar from "../assets/suspectAvatars/orchidAvatar.jpg";
import peacockAvatar from "../assets/suspectAvatars/peacockAvatar.jpg";
import plumAvatar from "../assets/suspectAvatars/plumAvatar.jpg";
import scarletAvatar from "../assets/suspectAvatars/scarletAvatar.jpg";

//Import weapon card images
import candlestickImage from "../assets/weaponCards/candlestickCluedo.png";
import daggerImage from "../assets/weaponCards/daggerCluedo.png";
import leadPipeImage from "../assets/weaponCards/leadpipeCluedo.png";
import revolverImage from "../assets/weaponCards/revolverCluedo.png";
import ropeImage from "../assets/weaponCards/ropeCluedo.png";
import wrenchImage from "../assets/weaponCards/wrenchCluedo.png";


// Import room card images
import ballroomImage from "../assets/roomCards/ballroomCluedo.jpg";
import billiardRoomImage from "../assets/roomCards/billiardroomCluedo.jpg";
import conservatoryImage from "../assets/roomCards/conservatoryCluedo.jpg";
import diningRoomImage from "../assets/roomCards/diningroomCluedo.jpg";
import hallImage from "../assets/roomCards/hallCluedo.jpg";
import kitchenImage from "../assets/roomCards/kitchenCluedo.jpg";
import libraryImage from "../assets/roomCards/libraryCluedo.jpg";
import loungeImage from "../assets/roomCards/loungeCluedo.jpg";
import studyImage from "../assets/roomCards/studyCluedo.jpg";

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