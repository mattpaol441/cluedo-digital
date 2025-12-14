# Analisi Architettura Componenti (React)

In questo documento analizzo l'albero delle componenti pagina per pagina.

---

## 1. Home Page (`Home.tsx`)
Schermata di benvenuto con le card di navigazione.

```mermaid
graph TD
    %% PADRE
    Page["Home.tsx"] --> Menu[HamburgerMenu]
    Page --> Grid[CardContainer]

    %% Ramo Menu
    Menu --> Btn[HamburgerButton]
    Menu --> Profile[ProfileView]
    Menu --> List1["MenuList (Nav)"]
    Menu --> List2["MenuList (Altro)"]
    
    Profile --> Avatar[UserImage]
    List1 --> Item1["MenuButton (x2)"]
    List2 --> Item2["MenuButton (x4)"]

    %% Ramo Griglia
    Grid --> Card1["Card (Nuova)"]
    Grid --> Card2["Card (Unisciti)"]
    Grid --> Card3["Card (Risultati)"]
    Grid --> Card4["Card (Amici)"]
```

---

## 2. Profile Page (`Profile.tsx`)
Gestione utente e modifica avatar. Notare il riutilizzo di `UserImage`.

```mermaid
graph TD
    %% PADRE
    Page["Profile.tsx"] --> Menu[HamburgerMenu]
    Page --> AvatarComp[Avatar]
    Page --> EditComp[EditProfile]

    %% Ramo Menu (Uguale a Home)
    Menu --> HamBtn[HamburgerButton]
    Menu --> ProfileView[ProfileView]
    Menu --> Lists[MenuList]
    
    ProfileView --> UserImgShared[UserImage]

    %% Ramo Centrale
    AvatarComp --> UserImg[UserImage]
    AvatarComp --> PicBtn[EditPicButton]

    %% Ramo Edit
    EditComp --> Form[Form]
    EditComp --> Buttons["EditProfileButton (x2)"]
```

---

## 3. JoinGame (`JoinGame.tsx`)
Pagina per entrare in una partita tramite codice.

```mermaid
graph TD
    %% PADRE
    Page["JoinGame.tsx"] --> Menu[HamburgerMenu]
    Page --> EditComp[JoinGame]

    %% Ramo Menu (Uguale a Home)
    Menu --> HamBtn[HamburgerButton]
    Menu --> ProfileView[ProfileView]
    Menu --> Lists[MenuList]
    

   %% Ramo Edit
    EditComp --> Form[Form]
    EditComp --> Buttons["JoinButton"]
```


---

## 4. Notification Page (`Notification.tsx`)
Pagina che mostra la lista degli inviti e avvisi.

```mermaid
graph TD
    %% PADRE
    Page["Notification.tsx"] --> Menu[HamburgerMenu]
    Page --> List[NotificationList]

    %% Ramo Menu (Uguale a Home)
    Menu --> HamBtn[HamburgerButton]
    Menu --> ProfileView[ProfileView]
    Menu --> Lists[MenuList]
    

    %% Ramo Lista
    List --> Item["NotificationItem (xN)"]

    %% Ramo Item
    Item --> Action[JoinButton]
```

---

## 5. Friends Page (`Friends.tsx`)
Gestione amici e ricerca.
*Nota: UserItemList e UserItem sono riutilizzati in due contesti diversi, cambiando solo il bottone d'azione.*

```mermaid
graph TD
    %% PADRE
    Page["Friends.tsx"] --> Menu[HamburgerMenu]
    Page --> AddSec[AddFriendsSection]
    Page --> ListSec[FriendList]

    %% Ramo Menu (Standard)
    Menu --> HamBtn[HamburgerButton]
    Menu --> ProfView[ProfileView]
    Menu --> Lists[MenuList]
    
    %% SEZIONE 1: Aggiungi Amici
    AddSec --> Search[SearchBar]
    AddSec --> List1[UserItemList]
    
    List1 --> Item1["UserItem (Context: Search)"]
    Item1 --> ProfView1[ProfileView]
    Item1 --> ReqBtn[RequestButton]

    %% SEZIONE 2: I Miei Amici
    ListSec --> List2[UserItemList]
    
    List2 --> Item2["UserItem (Context: Friends)"]
    Item2 --> ProfView2[ProfileView]
    Item2 --> ViewBtn[ViewProfileButton]

    %% ATOMI CONDIVISI (Il riutilizzo vero!)
    ProfView --> UserImg[UserImage]
    ProfView1 --> UserImg
    ProfView2 --> UserImg
```

---

## 6. New Game Page (`NewGame.tsx`)
Pagina per scegliere la modalità di gioco.
*Nota: Esempio perfetto di riutilizzo. Usiamo lo stesso CardContainer della Home, passandogli solo 2 card invece di 4.*

```mermaid
graph TD
    %% PADRE
    Page["NewGame.tsx"] --> Menu[HamburgerMenu]
    Page --> Grid[CardContainer]

    %% Ramo Menu (Standard)
    Menu --> HamBtn[HamburgerButton]
    Menu --> ProfView[ProfileView]
    Menu --> Lists[MenuList]
    
    %% Ramo Griglia
    Grid --> CardBot["Card (VS Bot)"]
    Grid --> CardMulti["Card (VS Amici)"]

    %% ATOMI CONDIVISI
    ProfView --> UserImg[UserImage]
```

---

## 7. Lobby Page (`LobbyPage`)
Pagina di attesa pre-partita.
*Nota: Riutilizzo di componenti. AddFriendSection qui serve per invitare alla partita, mentre in Friends.tsx serviva per aggiungere amici (inviare richies di amicizia).*

```mermaid
graph TD
    %% PADRE
    Page["LobbyPage"] --> Menu[HamburgerMenu]
    Page --> CodeSec[MatchCode]
    Page --> UsersSec[LobbyUsers]
    Page --> StartBtn[StartButton]
    Page --> InviteSec[AddFriendSection]

    %% Ramo Menu (Standard)
    Menu --> HamBtn[HamburgerButton]
    Menu --> ProfView[ProfileView]
    Menu --> Lists[MenuList]

    %% Ramo Codice Partita
    CodeSec --> CodeText[MatchCodeItem]
    CodeSec --> CopyBtn[CopyButton]

    %% Ramo Utenti Lobby
    UsersSec --> LobbyProfile["ProfileView [1,6]"]
    
    %% Ramo Invita Amici (RIUTILIZZATO)
    InviteSec --> Search[SearchBar]
    InviteSec --> UserList[UserItemList]

    UserList --> Item1["UserItem"]
    Item1 --> ProfView1[ProfileView]
    Item1 --> ReqBtn[InviteButton]

    %% ATOMI CONDIVISI
    ProfView --> UserImg[UserImage]
    LobbyProfile --> UserImg
    ProfView1 --> UserImg
```

---

## 8. Board Page (`Board.tsx`)
La schermata di gioco vera e propria.
*Nota: ProfileView qui viene usato in modo ibrido: mostra l'immagine del PERSONAGGIO (pedina) ma il nome dell'UTENTE, mentre nelle altre pagine mostra l'immagine dell'utente e il nome dell'utente.*
Il componente visivo è sempre lo stesso (ProfileView: un tondo con un testo sotto), ma il dato che gli passiamo cambia:
In Home/Lobby: Immagine Utente + Nome Utente.
In Board: Immagine Personaggio (es. Miss Scarlett) + Nome Utente.

```mermaid
graph TD
    %% PADRE
    Page["Board.tsx"] --> PList[ProfileViewList]
    PList --> PView["ProfileView (x3-6)"]
    PView --> CharImg["UserImage (Asset Personaggio)"]
    Page --> GameMap[Board]
    Page --> Note[Taccuino]
    
    %% IL MANAGER (Il vigile urbano)
    Page --> Manager{GameModalsManager}

    %% 1. INIZIO TURNO
    Manager -.-> ModAction[SelectAction]
    ModAction --> ActGrid[CardContainer]
    ActGrid --> ActCard["Card (Dadi vs Ipotesi, come quelle in Home.tsx)"]

    %% 2. FASE IPOTESI (Normale e Finale)
    Manager -.-> ModHypo[MakeHypothesis]
    Manager -.-> ModFinal[FinalAccuse]
    
    %% Nota: Condividono la struttura interna
    ModHypo --> ProgBar[ProgressBar]
    ModHypo --> HypoGrid[CardContainer]
    ModHypo --> Confirm1[ModalButton]
    
    ModFinal --> ProgBar
    ModFinal --> HypoGrid
    ModFinal --> Confirm1

    %% Le carte dentro l'ipotesi (diverse da quelle del menu in Home.tsx e in NewGame.tsx), sono selezionabili.
    HypoGrid --> GameCard["SelectableCard (Item)"]

    %% 3. RISPOSTA DEGLI ALTRI
    Manager -.-> ModAns[CardAnswer]
    ModAns --> AnsGrid[CardContainer]
    ModAns --> AnsBtn[ModalButton]
    
    AnsGrid --> GameCardShared["SelectableCard (Item)"]

    %% 4. FEEDBACK VISIVI 
    Manager -.-> ModShown[CardShown]
    ModShown --> ShownCard["DisplayCard (Solo visualizzazione)"]
    ModShown --> OkBtn[ModalButton]

    Manager -.-> ModAlert[CardAlert]
    ModAlert --> Btn[ModalButton]

    %% 5. STANZA CENTRALE (notifica che si è lì)
    Manager -.-> ModCenter[CentralRoom]
    ModCenter --> AccuseBtn[ModalButton]
```