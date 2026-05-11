import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Plus, Navigation } from 'lucide-react';

interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  lat: number;
  lng: number;
}

interface ManualData {
  block: string;
  road: string;
  building: string;
  area: string;
  landmark: string;
}

interface LocationSearchInputProps {
  value: string;
  placeholder: string;
  colorScheme: 'purple' | 'red' | 'blue';
  onSelect: (address: string, coords: { lat: number; lng: number }) => void;
  onChange: (value: string) => void;
  onCurrentLocation?: () => void;
  showCurrentLocation?: boolean;
}

const BAHRAIN_AREAS = [
  'Manama','Seef','Juffair','Adliya','Gudaibiya','Hoora','Diplomatic Area',
  'Muharraq','Arad','Hidd','Dair','Busaiteen','Amwaj Islands',
  'Riffa','Isa Town','Hamad Town','Salmabad','Tubli','Zinj','Salmaniya',
  'Budaiya','Janabiya','Saar','Barbar','Bani Jamra','Diraz',
  'Bilad Al Qadeem','Naim','Sanabis','Segaya','Qudaibiya',
  'Awali','Zallaq','Askar','Jaw','Exhibition Area','Bahrain Bay',
  'Durrat Al Bahrain','Al Hidd','Hamala','Sakhir',
];

const DOT: Record<string, string> = {
  purple: 'bg-purple-600', red: 'bg-red-500', blue: 'bg-blue-500',
};
const RING: Record<string, string> = {
  purple: 'focus:ring-purple-500', red: 'focus:ring-red-500', blue: 'focus:ring-blue-500',
};
const ACCENT: Record<string, string> = {
  purple: 'text-purple-600', red: 'text-red-500', blue: 'text-blue-500',
};
const GRAD: Record<string, string> = {
  purple: 'from-purple-600 to-blue-500',
  red: 'from-red-500 to-orange-400',
  blue: 'from-blue-500 to-cyan-400',
};

export function LocationSearchInput({
  value, placeholder, colorScheme,
  onSelect, onChange, onCurrentLocation, showCurrentLocation,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState<ManualData>({ block:'', road:'', building:'', area:'', landmark:'' });
  const [geocoding, setGeocoding] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setShowDrop(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const search = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 2) {
      setPredictions([]); setShowDrop(false); return;
    }
    setSearching(true);
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=bh&limit=6`);
      const results = await response.json();
      
      setSearching(false);
      
      if (results && results.length > 0) {
        setPredictions(results.map((r: any) => {
          const parts = r.display_name.split(', ');
          const mainText = parts[0];
          const secondaryText = parts.slice(1).join(', ');
          return {
            placeId: r.place_id.toString(),
            mainText,
            secondaryText,
            fullText: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon)
          };
        }));
        setShowDrop(true);
      } else {
        setPredictions([]); setShowDrop(text.length >= 2);
      }
    } catch (error) {
      console.error("OSM Search Error:", error);
      setSearching(false);
      setPredictions([]);
      setShowDrop(text.length >= 2);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val); onChange(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 500);
  };

  const handlePick = (pred: PlacePrediction) => {
    setShowDrop(false);
    setQuery(pred.fullText); onChange(pred.fullText);
    onSelect(pred.fullText, { lat: pred.lat, lng: pred.lng });
  };

  const buildAddr = () => {
    const p: string[] = [];
    if (manual.building) p.push(`Building ${manual.building}`);
    if (manual.road) p.push(`Road ${manual.road}`);
    if (manual.block) p.push(`Block ${manual.block}`);
    if (manual.area) p.push(manual.area);
    p.push('Bahrain');
    return p.join(', ');
  };

  const handleManualSubmit = async () => {
    if (!manual.area) return;
    setGeocoding(true);
    const addrStr = buildAddr();
    
    try {
      // Basic geocoding attempt using Area + Bahrain
      const queryStr = `${manual.area}, Bahrain`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&countrycodes=bh&limit=1`);
      const results = await response.json();
      
      setGeocoding(false);
      let coords = { lat: 26.0667, lng: 50.5577 }; // Default Bahrain Center
      
      if (results && results.length > 0) {
        coords = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      }
      
      const display = manual.landmark ? `${addrStr} (near ${manual.landmark})` : addrStr;
      setQuery(display); onChange(display); onSelect(display, coords);
      setShowManual(false);
      setManual({ block:'', road:'', building:'', area:'', landmark:'' });
    } catch (error) {
      console.error("Geocoding Error:", error);
      setGeocoding(false);
      // Fallback to center if failed
      const display = manual.landmark ? `${addrStr} (near ${manual.landmark})` : addrStr;
      setQuery(display); onChange(display); onSelect(display, { lat: 26.0667, lng: 50.5577 });
      setShowManual(false);
      setManual({ block:'', road:'', building:'', area:'', landmark:'' });
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
            <div className={`w-2.5 h-2.5 rounded-full ${DOT[colorScheme]}`} />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            onFocus={() => { if (predictions.length > 0) setShowDrop(true); else if (query.length >= 2) search(query); }}
            className={`w-full pl-9 ${(query || showCurrentLocation) ? 'pr-16' : 'pr-4'} py-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 ${RING[colorScheme]} focus:border-transparent transition-all shadow-sm text-sm text-gray-800 placeholder-gray-400`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {searching && <div className="w-4 h-4 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin mr-1" />}
            {query && !searching && (
              <button onClick={() => { setQuery(''); onChange(''); setPredictions([]); setShowDrop(false); inputRef.current?.focus(); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {showCurrentLocation && (
              <button onClick={onCurrentLocation}
                className={`p-1.5 ${ACCENT[colorScheme]} hover:bg-gray-100 rounded-full transition-colors`}>
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown */}
        {showDrop && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden">
            {predictions.length > 0 ? (
              <>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                  {predictions.map(pred => (
                    <button key={pred.placeId} onClick={() => handlePick(pred)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50/60 transition-colors text-left">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${GRAD[colorScheme]} flex items-center justify-center flex-shrink-0`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{pred.mainText}</p>
                        {pred.secondaryText && <p className="text-xs text-gray-400 truncate mt-0.5">{pred.secondaryText}</p>}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => { setShowDrop(false); setShowManual(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50 hover:bg-purple-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${GRAD[colorScheme]} flex items-center justify-center flex-shrink-0`}>
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${ACCENT[colorScheme]}`}>Can't find your location?</p>
                    <p className="text-xs text-gray-400">Enter address manually</p>
                  </div>
                </button>
              </>
            ) : (
              <div className="p-5 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No results for "<span className="font-medium text-gray-700">{query}</span>"</p>
                <p className="text-xs text-gray-400 mb-4">Try different keywords or enter manually</p>
                <button onClick={() => { setShowDrop(false); setShowManual(true); }}
                  className={`w-full py-2.5 bg-gradient-to-r ${GRAD[colorScheme]} text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2`}>
                  <Plus className="w-4 h-4" /> Enter Location Manually
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[9999]"
          onClick={e => { if (e.target === e.currentTarget) setShowManual(false); }}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg shadow-2xl"
            style={{ animation: 'slideUp 0.3s ease-out' }}>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pb-8 pt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add Location Manually</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Enter your address in Bahrain</p>
                </div>
                <button onClick={() => setShowManual(false)}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Block & Road */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Block No.</label>
                    <input type="text" placeholder="e.g. 320"
                      value={manual.block}
                      onChange={e => setManual(d => ({ ...d, block: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Road No.</label>
                    <input type="text" placeholder="e.g. 1805"
                      value={manual.road}
                      onChange={e => setManual(d => ({ ...d, road: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-800" />
                  </div>
                </div>

                {/* Building */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Building No. / Name</label>
                  <input type="text" placeholder="e.g. 12 or Al-Noor Tower"
                    value={manual.building}
                    onChange={e => setManual(d => ({ ...d, building: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-800" />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Area / District <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={manual.area}
                      onChange={e => setManual(d => ({ ...d, area: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-800 appearance-none pr-8">
                      <option value="">Select area in Bahrain...</option>
                      {BAHRAIN_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
                  </div>
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nearby Landmark (Optional)</label>
                  <input type="text" placeholder="e.g. Near City Centre Mall"
                    value={manual.landmark}
                    onChange={e => setManual(d => ({ ...d, landmark: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-800" />
                </div>

                {/* Preview */}
                {(manual.area || manual.road || manual.block) && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-purple-600 mb-1">📍 Address Preview</p>
                    <p className="text-sm text-gray-700">{buildAddr()}</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleManualSubmit}
                disabled={!manual.area || geocoding}
                className={`w-full mt-5 py-4 rounded-2xl font-bold text-white text-base transition-all ${
                  manual.area && !geocoding
                    ? `bg-gradient-to-r ${GRAD[colorScheme]} shadow-lg hover:shadow-xl active:scale-[0.98]`
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {geocoding ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Finding on map...
                  </span>
                ) : 'Confirm Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
