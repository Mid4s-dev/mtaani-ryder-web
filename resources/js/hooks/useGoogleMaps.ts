import { useState, useCallback } from 'react'

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

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const loadGoogleMaps = useCallback(async () => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)
  }, [])

  const createMap = useCallback((element: HTMLDivElement, options: MapOptions) => {
    if (!window.google || !isLoaded) return null

    const mapInstance = new google.maps.Map(element, {
      center: options.center,
      zoom: options.zoom || 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    setMap(mapInstance)

    // Add markers if provided
    if (options.markers) {
      options.markers.forEach((location, index) => {
        new google.maps.Marker({
          position: location,
          map: mapInstance,
          title: location.address || `Location ${index + 1}`,
        })
      })
    }

    // Add click listener for location selection
    if (options.onLocationSelect) {
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        const location: Location = {
          lat: event.latLng!.lat(),
          lng: event.latLng!.lng(),
        }
        
        // Get address from coordinates
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            location.address = results[0].formatted_address
            location.placeId = results[0].place_id
          }
          options.onLocationSelect!(location)
        })
      })
    }

    return mapInstance
  }, [isLoaded])

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        }
      )
    })
  }, [])

  const searchPlaces = useCallback(
    (query: string, location?: Location): Promise<google.maps.places.PlaceResult[]> => {
      return new Promise((resolve, reject) => {
        if (!window.google || !isLoaded) {
          reject(new Error('Google Maps not loaded'))
          return
        }

        const service = new google.maps.places.PlacesService(
          document.createElement('div')
        )

        const request: google.maps.places.TextSearchRequest = {
          query,
          ...(location && {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 50000, // 50km radius
          }),
        }

        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results)
          } else {
            reject(new Error(`Places search failed: ${status}`))
          }
        })
      })
    },
    [isLoaded]
  )

  const calculateDistance = useCallback(
    (origin: Location, destination: Location): Promise<google.maps.DistanceMatrixResponse> => {
      return new Promise((resolve, reject) => {
        if (!window.google || !isLoaded) {
          reject(new Error('Google Maps not loaded'))
          return
        }

        const service = new google.maps.DistanceMatrixService()
        
        service.getDistanceMatrix(
          {
            origins: [new google.maps.LatLng(origin.lat, origin.lng)],
            destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && response) {
              resolve(response)
            } else {
              reject(new Error(`Distance calculation failed: ${status}`))
            }
          }
        )
      })
    },
    [isLoaded]
  )

  return {
    isLoaded,
    map,
    loadGoogleMaps,
    createMap,
    getCurrentLocation,
    searchPlaces,
    calculateDistance,
  }
}

export default useGoogleMaps