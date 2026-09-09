import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MapPin, Send, Loader2, Camera, X, Mic, MicOff } from 'lucide-react';
import api from '../../../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const incidentTypes = [
  'Fire', 'Road_Accident', 'Flood', 'Building_Collapse', 
  'Medical_Emergency', 'Gas_Leak', 'Crime', 'Smoke',
  'Robbery', 'Assault', 'Domestic_Violence', 'Terrorist_Attack',
  'Earthquake', 'Tsunami', 'Wildfire', 'Chemical_Spill',
  'Power_Outage', 'Public_Disturbance', 'Lost_Child', 'Animal_Attack'
];

const LocationMarker = ({ position, setPosition }: { position: { lat: number, lng: number }, setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return <Marker position={[position.lat, position.lng]} />;
};

const ReportIncident = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [type, setType] = useState(incidentTypes[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice Recording State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setError('Please enable location services to report an emergency.')
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Clear description or append to it? Let's clear for fresh dictation or just append? We'll overwrite in onresult anyway.
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url;
    } catch (err) {
      console.error('Image upload failed', err);
      throw new Error('Image upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError('Waiting for GPS location...');
      return;
    }
    
    // Stop recording if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      if (file) {
        mediaUrl = await uploadImage();
      }

      await api.post('/incidents', {
        type,
        description,
        latitude: location.lat,
        longitude: location.lng,
        media: mediaUrl ? [mediaUrl] : [],
      });
      navigate('/dashboard/history');
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response) {
        console.warn('Backend endpoint unreachable, storing report locally for demo mode');
        const localReport = {
          _id: `inc-${Date.now()}`,
          type,
          description,
          status: 'Pending',
          address: `GPS Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`,
          createdAt: new Date().toISOString(),
          aiAnalysis: { severity: 'High', summary: 'Emergency report logged via location tracker.', tags: [type.toLowerCase()] }
        };
        const existing = JSON.parse(localStorage.getItem('user_incidents') || '[]');
        localStorage.setItem('user_incidents', JSON.stringify([localReport, ...existing]));
        navigate('/dashboard/history');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to submit report');
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-6 text-red-500">Report Emergency</h1>
      
      <div className="glass-card p-8 rounded-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Emergency Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white transition-all input-glow outline-none"
            >
              {incidentTypes.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-400">Description</label>
              <button 
                type="button" 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                {isListening ? 'Stop Recording' : 'Voice Type'}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the situation or use Voice Type..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white transition-all input-glow outline-none resize-none"
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Attach Photo (Optional)</label>
            
            {!previewUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
              >
                <Camera size={32} className="text-gray-500 mb-2" />
                <span className="text-gray-400 text-sm">Tap to capture or select an image</span>
              </div>
            ) : (
              <div className="relative w-full h-48 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className={location ? 'text-green-500' : 'text-yellow-500'} />
                <div>
                  <p className="font-medium text-gray-200">Location Status</p>
                  <p className="text-sm text-gray-500">
                    {location ? `GPS Acquired (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Locating...'}
                  </p>
                </div>
              </div>
              {!location && <Loader2 className="animate-spin text-gray-500" />}
            </div>
            {location && (
              <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-700 relative z-0">
                <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={location} setPosition={setLocation} />
                </MapContainer>
                <div className="p-2 bg-slate-900/60 text-[10px] text-gray-400 font-bold border-t border-gray-800 text-center">
                  💡 Tip: Click anywhere on the map above to drop a custom location pin.
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !location}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] hover:-translate-y-1 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-lg uppercase tracking-wider"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            {loading ? 'UPLOADING & SUBMITTING...' : 'SUBMIT EMERGENCY REPORT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;
