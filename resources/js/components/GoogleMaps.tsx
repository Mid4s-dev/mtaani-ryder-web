import React, { useEffect, useRef, useState } from 'react'
import { Location } from '@/types/maps'

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  placeholder?: string
  defaultValue?: string
  className?: string
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for a location...",
  defaultValue = "",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadGoogleMaps = async () => {
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
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['geometry', 'formatted_address', 'place_id'],
        types: ['establishment', 'geocode']
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        
        if (place?.geometry?.location) {
          const location: Location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || '',
            placeId: place.place_id || ''
          }
          onLocationSelect(location)
        }
      })
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onLocationSelect])

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className={className}
    />
  )
}

interface MapViewProps {
  center: Location
  markers?: Location[]
  zoom?: number
  height?: string
  onLocationSelect?: (location: Location) => void
  showCurrentLocation?: boolean
  interactive?: boolean
  draggableMarker?: boolean
  selectedLocation?: Location | null
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  markers = [],
  zoom = 13,
  height = "400px",
  onLocationSelect,
  showCurrentLocation = false,
  interactive = true,
  draggableMarker = false,
  selectedLocation = null
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const draggableMarkerRef = useRef<google.maps.Marker | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsLoaded(true)
      }

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Your current location'
          })
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }, [showCurrentLocation])

  const reverseGeocode = (location: Location, callback: (address: string, placeId?: string) => void) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        callback(results[0].formatted_address, results[0].place_id || undefined)
      } else {
        callback('Unknown location')
      }
    })
  }

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: interactive ? 'auto' : 'none',
        zoomControl: interactive,
      })

      // Add click listener for location selection
      if (onLocationSelect && interactive) {
        mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const location: Location = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            }
            
            // Update draggable marker if it exists
            if (draggableMarkerRef.current) {
              draggableMarkerRef.current.setPosition(event.latLng)
            }
            
            // Get address from coordinates
            reverseGeocode(location, (address, placeId) => {
              location.address = address
              location.placeId = placeId
              onLocationSelect(location)
            })
          }
        })
      }

      // Add draggable marker if requested
      if (draggableMarker && selectedLocation) {
        draggableMarkerRef.current = new google.maps.Marker({
          position: selectedLocation,
          map: mapInstanceRef.current!,
          draggable: true,
          title: 'Drag to adjust location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L20 12H26L21 17L23 27L16 22L9 27L11 17L6 12H12L16 2Z" fill="#FF4444" stroke="#FFFFFF" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32),
          }
        })

        draggableMarkerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng && onLocationSelect) {
            const location: Location = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            }
            
            reverseGeocode(location, (address, placeId) => {
              location.address = address
              location.placeId = placeId
              onLocationSelect(location)
            })
          }
        })
      }
    }
  }, [isLoaded, center, zoom, onLocationSelect, interactive, draggableMarker, selectedLocation])

  // Update markers when they change
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      
      // Add new markers (excluding the draggable marker)
      markers.forEach((location, index) => {
        const marker = new google.maps.Marker({
          position: location,
          map: mapInstanceRef.current!,
          title: location.address || `Location ${index + 1}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 32),
            anchor: new google.maps.Point(12, 32),
          }
        })
        markersRef.current.push(marker)
      })

      // Add current location marker
      if (currentLocation) {
        const currentMarker = new google.maps.Marker({
          position: currentLocation,
          map: mapInstanceRef.current!,
          title: 'Your current location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#4285F4"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
                <circle cx="12" cy="12" r="1" fill="#4285F4"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12),
          }
        })
        markersRef.current.push(currentMarker)
      }
    }
  }, [markers, currentLocation])

  // Update draggable marker position when selectedLocation changes
  useEffect(() => {
    if (draggableMarkerRef.current && selectedLocation && mapInstanceRef.current) {
      draggableMarkerRef.current.setPosition(selectedLocation)
      mapInstanceRef.current.setCenter(selectedLocation)
    }
  }, [selectedLocation])

  // Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null))
      if (draggableMarkerRef.current) {
        draggableMarkerRef.current.setMap(null)
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg border border-gray-200"
    />
  )
}

// Interactive Location Picker Component
interface LocationPickerProps {
  onLocationSelect: (location: Location) => void
  initialLocation?: Location
  height?: string
  className?: string
  placeholder?: string
  showCurrentLocationButton?: boolean
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  height = "400px",
  className = "",
  placeholder = "Click on the map or search to select a location",
  showCurrentLocationButton = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  const [searchValue, setSearchValue] = useState('')
  const [mapCenter, setMapCenter] = useState<Location>(
    initialLocation || { lat: -1.2921, lng: 36.8219 } // Default to Nairobi
  )
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    // Get user's current location as default
    if (!initialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setMapCenter(location)
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }, [initialLocation])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSearchValue(location.address || '')
    onLocationSelect(location)
  }

  const handleSearchSelect = (location: Location) => {
    handleLocationSelect(location)
    setMapCenter(location)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        
        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            location.address = results[0].formatted_address
            location.placeId = results[0].place_id || undefined
          } else {
            location.address = 'Current location'
          }
          
          handleLocationSelect(location)
          setMapCenter(location)
          setGettingLocation(false)
        })
      },
      (error) => {
        setGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied by user.')
            break
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.')
            break
          case error.TIMEOUT:
            alert('Location request timed out.')
            break
          default:
            alert('An unknown error occurred while retrieving location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div>
        <div className="flex gap-2">
          <LocationSearch
            onLocationSelect={handleSearchSelect}
            placeholder={placeholder}
            defaultValue={searchValue}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {showCurrentLocationButton && (
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center gap-2"
              title="Use my current location"
            >
              {gettingLocation ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m16.2 7.8-2 6.3-6.3 2 2-6.3 6.3-2z"/>
                </svg>
              )}
              <span className="hidden sm:inline">
                {gettingLocation ? 'Getting...' : 'My Location'}
              </span>
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Search for a location above, click on the map, or use your current location
        </p>
      </div>

      {/* Interactive Map */}
      <div className="relative">
        <MapView
          center={mapCenter}
          zoom={15}
          height={height}
          onLocationSelect={handleLocationSelect}
          interactive={true}
          draggableMarker={!!selectedLocation}
          selectedLocation={selectedLocation}
          showCurrentLocation={true}
        />
        
        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Selected Location
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Drag the marker to adjust or click elsewhere on the map
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default { LocationSearch, MapView, LocationPicker }