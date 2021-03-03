export interface E {
    target: {
        value: string
    }
}

export interface Location {
    id:number,
    name:string,
    mapSection: {
        center: {
            latitude: number,
            longitude: number
        },
        lowerRight: {
            latitude: number,
            longitude: number
        },
        upperLeft: {
            latitude: number,
            longitude: number
        }
    }
}

export interface Response {
    data:{
        data: Array<Location>
    }
}

export interface ResponseCar {
    data:{
        data: Array<Car>
    }
}

export interface Locations extends Array<Location>{}

export interface Cars extends Array<Car>{}

export interface Car {
    position: {
        latitude: number,
        longitude: number
    },
    model:string,
    fuel: number
}
