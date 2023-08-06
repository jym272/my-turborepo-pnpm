export enum ImageCommands {
    CreateImage = 'create_image',
    UpdateToken = 'update_token'
}

export enum MintCommands {
    MintImage = 'mint_image'
}

export type Commands = ImageCommands | MintCommands;
