import React, { useEffect, useRef, useState } from 'react'
import { Location } from '@/types/maps'

// Leaflet types (you'll need to install @types/leaflet and leaflet)
declare global {
  interface Window {
    L: any
  }
}

interface LeafletMapProps {
  center: Location
  zoom?: number
  height?: string
  onLocationSelect?: (location: Location) => void
  markers?: Location[]
  interactive?: boolean
  draggableMarker?: boolean
  selectedLocation?: Location | null
  className?: string
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  height = "400px",
  onLocationSelect,
  markers = [],
  interactive = true,
  draggableMarker = false,
  selectedLocation = null,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const draggableMarkerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        setIsLoaded(true)
        return
      }

      // Load CSS
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(css)

      // Load JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      
      script.onload = () => {
        setIsLoaded(true)
      }

      document.head.appendChild(script)
    }

    loadLeaflet()
  }, [])

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      return data.display_name || 'Unknown location'
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return 'Unknown location'
    }
  }

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      const L = window.L

      mapInstanceRef.current = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
      })

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      // Add click listener
      if (onLocationSelect && interactive) {
        mapInstanceRef.current.on('click', async (e: any) => {
          const { lat, lng } = e.latlng
          
          // Update draggable marker if it exists
          if (draggableMarkerRef.current) {
            draggableMarkerRef.current.setLatLng([lat, lng])
          }
          
          const address = await reverseGeocode(lat, lng)
          const location: Location = { lat, lng, address }
          onLocationSelect(location)
        })
      }

      // Add draggable marker if requested
      if (draggableMarker && selectedLocation) {
        draggableMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
          draggable: true,
          icon: L.divIcon({
            html: `
              <div style="
                width: 32px; 
                height: 32px; 
                background: #FF4444; 
                border: 2px solid white; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg);
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <div style="
                  position: absolute;
                  top: 6px;
                  left: 6px;
                  width: 16px;
                  height: 16px;
                  background: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                "></div>
              </div>
            `,
            className: 'custom-draggable-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          })
        }).addTo(mapInstanceRef.current)

        draggableMarkerRef.current.on('dragend', async (e: any) => {
          const { lat, lng } = e.target.getLatLng()
          const address = await reverseGeocode(lat, lng)
          const location: Location = { lat, lng, address }
          if (onLocationSelect) {
            onLocationSelect(location)
          }
        })
      }
    }
  }, [isLoaded, center, zoom, onLocationSelect, interactive, draggableMarker, selectedLocation])

  // Update markers
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      const L = window.L
      
      // Clear existing markers
      markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker))
      markersRef.current = []

      // Add new markers
      markers.forEach((location, index) => {
        const marker = L.marker([location.lat, location.lng], {
          icon: L.divIcon({
            html: `
              <div style="
                width: 24px; 
                height: 32px; 
                background: #4285F4; 
                border: 2px solid white; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg);
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <div style="
                  position: absolute;
                  top: 4px;
                  left: 4px;
                  width: 12px;
                  height: 12px;
                  background: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                "></div>
              </div>
            `,
            className: 'custom-marker',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          })
        }).addTo(mapInstanceRef.current)

        if (location.address) {
          marker.bindPopup(location.address)
        }

        markersRef.current.push(marker)
      })
    }
  }, [markers, isLoaded])

  // Update draggable marker position
  useEffect(() => {
    if (draggableMarkerRef.current && selectedLocation && mapInstanceRef.current) {
      draggableMarkerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng])
      mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng])
    }
  }, [selectedLocation])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className={`rounded-lg border border-gray-200 ${className}`}
    />
  )
}

// Location Search for OpenStreetMap (using Nominatim)
interface LeafletLocationSearchProps {
  onLocationSelect: (location: Location) => void
  placeholder?: string
  defaultValue?: string
  className?: string
}

export const LeafletLocationSearch: React.FC<LeafletLocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for a location...",
  defaultValue = "",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ke&addressdetails=1`
      )
      const data = await response.json()
      
      const locations: Location[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        placeId: item.place_id?.toString()
      }))
      
      setSuggestions(locations)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    searchLocations(value)
  }

  const handleSuggestionClick = (location: Location) => {
    setSearchQuery(location.address || '')
    setShowSuggestions(false)
    onLocationSelect(location)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(location)}
            >
              <div className="text-sm text-gray-900 truncate">
                {location.address}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Interactive Location Picker using OpenStreetMap
interface LeafletLocationPickerProps {
  onLocationSelect: (location: Location) => void
  initialLocation?: Location
  height?: string
  className?: string
  placeholder?: string
  showCurrentLocationButton?: boolean
}

export const LeafletLocationPicker: React.FC<LeafletLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  height = "400px",
  className = "",
  placeholder = "Search for a location or click on the map",
  showCurrentLocationButton = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  const [searchValue, setSearchValue] = useState('')
  const [mapCenter, setMapCenter] = useState<Location>(
    initialLocation || { lat: -1.2921, lng: 36.8219 } // Default to Nairobi
  )
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
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
      async (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`)
          const data = await response.json()
          location.address = data.display_name || 'Current location'
        } catch (error) {
          location.address = 'Current location'
        }
        
        handleLocationSelect(location)
        setMapCenter(location)
        setGettingLocation(false)
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
      }
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div>
        <div className="flex gap-2">
          <LeafletLocationSearch
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
        <LeafletMap
          center={mapCenter}
          zoom={15}
          height={height}
          onLocationSelect={handleLocationSelect}
          interactive={true}
          draggableMarker={!!selectedLocation}
          selectedLocation={selectedLocation}
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

export default { LeafletMap, LeafletLocationSearch, LeafletLocationPicker }