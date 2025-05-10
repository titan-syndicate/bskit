export declare function getOrder(id: string): Promise<{
    id: number;
    url: string;
    date: string;
    amount: {
        usd: string;
        cad: string;
        fee: string;
        net: string;
    };
    payment: {
        transactionId: string;
        card: {
            number: string;
            type: string;
            expiry: string;
        };
    };
    customer: {
        name: string;
        email: string;
        address: string;
        country: string;
        countryFlagUrl: string;
    };
    event: {
        id: number;
        name: string;
        url: string;
        date: string;
        time: string;
        location: string;
        totalRevenue: string;
        totalRevenueChange: string;
        ticketsAvailable: number;
        ticketsSold: number;
        ticketsSoldChange: string;
        pageViews: string;
        pageViewsChange: string;
        status: string;
        imgUrl: string;
        thumbUrl: string;
    };
}>;
export declare function getRecentOrders(): Promise<{
    id: number;
    url: string;
    date: string;
    amount: {
        usd: string;
        cad: string;
        fee: string;
        net: string;
    };
    payment: {
        transactionId: string;
        card: {
            number: string;
            type: string;
            expiry: string;
        };
    };
    customer: {
        name: string;
        email: string;
        address: string;
        country: string;
        countryFlagUrl: string;
    };
    event: {
        id: number;
        name: string;
        url: string;
        date: string;
        time: string;
        location: string;
        totalRevenue: string;
        totalRevenueChange: string;
        ticketsAvailable: number;
        ticketsSold: number;
        ticketsSoldChange: string;
        pageViews: string;
        pageViewsChange: string;
        status: string;
        imgUrl: string;
        thumbUrl: string;
    };
}[]>;
export declare function getOrders(): Promise<{
    id: number;
    url: string;
    date: string;
    amount: {
        usd: string;
        cad: string;
        fee: string;
        net: string;
    };
    payment: {
        transactionId: string;
        card: {
            number: string;
            type: string;
            expiry: string;
        };
    };
    customer: {
        name: string;
        email: string;
        address: string;
        country: string;
        countryFlagUrl: string;
    };
    event: {
        id: number;
        name: string;
        url: string;
        date: string;
        time: string;
        location: string;
        totalRevenue: string;
        totalRevenueChange: string;
        ticketsAvailable: number;
        ticketsSold: number;
        ticketsSoldChange: string;
        pageViews: string;
        pageViewsChange: string;
        status: string;
        imgUrl: string;
        thumbUrl: string;
    };
}[]>;
export declare function getEvent(id: string): Promise<{
    id: number;
    name: string;
    url: string;
    date: string;
    time: string;
    location: string;
    totalRevenue: string;
    totalRevenueChange: string;
    ticketsAvailable: number;
    ticketsSold: number;
    ticketsSoldChange: string;
    pageViews: string;
    pageViewsChange: string;
    status: string;
    imgUrl: string;
    thumbUrl: string;
}>;
export declare function getEventOrders(id: string): Promise<{
    id: number;
    url: string;
    date: string;
    amount: {
        usd: string;
        cad: string;
        fee: string;
        net: string;
    };
    payment: {
        transactionId: string;
        card: {
            number: string;
            type: string;
            expiry: string;
        };
    };
    customer: {
        name: string;
        email: string;
        address: string;
        country: string;
        countryFlagUrl: string;
    };
    event: {
        id: number;
        name: string;
        url: string;
        date: string;
        time: string;
        location: string;
        totalRevenue: string;
        totalRevenueChange: string;
        ticketsAvailable: number;
        ticketsSold: number;
        ticketsSoldChange: string;
        pageViews: string;
        pageViewsChange: string;
        status: string;
        imgUrl: string;
        thumbUrl: string;
    };
}[]>;
export declare function getEvents(): Promise<{
    id: number;
    name: string;
    url: string;
    date: string;
    time: string;
    location: string;
    totalRevenue: string;
    totalRevenueChange: string;
    ticketsAvailable: number;
    ticketsSold: number;
    ticketsSoldChange: string;
    pageViews: string;
    pageViewsChange: string;
    status: string;
    imgUrl: string;
    thumbUrl: string;
}[]>;
export declare function getCountries(): {
    name: string;
    code: string;
    flagUrl: string;
    regions: string[];
}[];
