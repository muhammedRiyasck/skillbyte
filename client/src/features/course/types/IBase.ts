export interface Ibase {
    _id: string;
    thumbnailUrl: string
    title: string;
    subText: string;
    category: string;
    customCategory: string;
    courseLevel: string;
    duration: string;
    language: string;
    price: string;
    description: string;
    tags: string;
    features: string[];
    status: 'draft' | 'list' | 'unlist';
    rating: number;
    reviews:number;
    isEnrolled?: boolean;
    isBlocked?: boolean;
}
