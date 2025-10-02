import React, { useState, useEffect } from 'react'
import { LocationPicker } from '@/components/GoogleMaps'
import { LeafletLocationPicker } from '@/components/LeafletMaps'
import { Location } from '@/types/maps'

type MapProvider = 'google' | 'openstreetmap'

interface UniversalLocationPickerProps {
  onLocationSelect: (location: Location) => void
  initialLocation?: Location
  height?: string
  className?: string
  placeholder?: string
  showCurrentLocationButton?: boolean
  showMapToggle?: boolean
  defaultMapProvider?: MapProvider
}

export const UniversalLocationPicker: React.FC<UniversalLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  height = "400px",
  className = "",
  placeholder,
  showCurrentLocationButton = true,
  showMapToggle = true,
  defaultMapProvider = 'google'
}) => {
  const [mapProvider, setMapProvider] = useState<MapProvider>(defaultMapProvider)
  const [hasGoogleMapsKey, setHasGoogleMapsKey] = useState(false)

  // Check if Google Maps API key is available
  useEffect(() => {
    const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    setHasGoogleMapsKey(!!googleMapsKey)
    
    // If no Google Maps key is available, default to OpenStreetMap
    if (!googleMapsKey && mapProvider === 'google') {
      setMapProvider('openstreetmap')
    }
  }, [mapProvider])

  const currentPlaceholder = placeholder || 
    (mapProvider === 'google' 
      ? "Search with Google Maps or click on the map..."
      : "Search with OpenStreetMap or click on the map..."
    )

  return (
    <div className={className}>
      {showMapToggle && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Map Provider:</span>
          <div className="flex gap-2">
            {hasGoogleMapsKey && (
              <button
                type="button"
                onClick={() => setMapProvider('google')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mapProvider === 'google'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Google Maps
              </button>
            )}
            <button
              type="button"
              onClick={() => setMapProvider('openstreetmap')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                mapProvider === 'openstreetmap'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              OpenStreetMap (Free)
            </button>
          </div>
          {!hasGoogleMapsKey && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Google Maps API key not configured
            </div>
          )}
        </div>
      )}

      {mapProvider === 'google' && hasGoogleMapsKey ? (
        <LocationPicker
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
          height={height}
          placeholder={currentPlaceholder}
          showCurrentLocationButton={showCurrentLocationButton}
        />
      ) : (
        <LeafletLocationPicker
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
          height={height}
          placeholder={currentPlaceholder}
          showCurrentLocationButton={showCurrentLocationButton}
        />
      )}
    </div>
  )
}

export default UniversalLocationPicker