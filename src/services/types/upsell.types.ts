export interface IUpsellArgs {
    firstUpsellOption: "buy" | "skip";
    secondUpsellOption?: "buy" | "skip";
    specialOfferOption?: "buy" | "skip";
}

export interface IUpsellFeature {
    icon: string;
    title: string;
    description: string;
}

export interface IUpsellTitle {
    bold: boolean;
    text: string;
    highlight: string[];
    align?: string;
}

export interface IUpsellPriceTitle {
    bold?: boolean;
    text: string;
    highlight: string[];
}

export interface IUpsellSocialProof {
    title: string;
    subtitle: string;
    description: string;
}

export interface IUpsellSpecialOfferModal {
    title: {
        text: string;
        highlight: string[];
    };
    description: {
        text: string;
        highlight: string[];
    };
    image?: string;
    imageCapture?: string;
    aditionalDescription?: {
        text: string;
        highlight: string[];
    };
    buttonText?: string;
}

export interface IUpsellSettings {
    title: IUpsellTitle;
    priceTitle?: IUpsellPriceTitle;
    features?: IUpsellFeature[];
    socialProof?: IUpsellSocialProof;
    specialOfferModal?: IUpsellSpecialOfferModal;
    steps?: string[];
    showTimer?: boolean;
    paymentType?: string;
    productFeaturesDescription?: any;
    benefits?: Array<{
        text: string;
        highlight: string[];
        align: string;
    }>;
    header?: {
        hidden: boolean;
        backButton: boolean;
        proggres: boolean;
    };
    global?: {
        textureBg: boolean;
    };
}