/// <reference types="google.maps" />

declare global {
  interface Window {
    google: typeof google
  }
}

export interface Location {
  lat: number
  lng: number
  address?: string
  placeId?: string
}

export interface MapOptions {
  center: Location
  zoom?: number
  markers?: Location[]
  onLocationSelect?: (location: Location) => void
}

export interface RiderInfo {
  id: number
  name: string
  rating: number
  vehicle_type: string
  distance?: number
  is_online: boolean
  current_latitude?: number
  current_longitude?: number
}

export interface DeliveryLocation {
  pickup: Location
  delivery: Location
}

export {}