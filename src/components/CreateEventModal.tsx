import { X, Calendar, Clock, MapPin, Music, Upload, AlignLeft, Tag } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreateEventModalProps {
  onClose: () => void;
}

export default function CreateEventModal({ onClose }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '',
    period: 'PM',
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Please select an image for the event');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to create an event');
        setIsSubmitting(false);
        return;
      }
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('events')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            image_url: publicUrl,
            location: formData.location,
            venue: '',
            event_date: formData.eventDate,
            event_time: `${formData.eventTime} ${formData.period}`,
            category: formData.category,
            user_id: user.id,
          },
        ]);

      if (insertError) throw insertError;

      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.4)] border border-purple-500/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-purple-500/50 hover:scale-110 group"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
        </button>

        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-8">
          <h2 className="text-4xl font-black text-white">Create New Event</h2>
          <p className="text-purple-100 mt-2">Share your event with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-12rem)] p-8">
          <div className="space-y-6">
            <div className="group">
              <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                <Music className="w-4 h-4" />
                Event Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                <AlignLeft className="w-4 h-4" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                placeholder="Describe your event"
                required
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                <Upload className="w-4 h-4" />
                Event Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 transition-all group"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <Upload className="w-8 h-8 text-white" />
                        <span className="ml-2 text-white font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Upload className="w-12 h-12 text-gray-500 mb-3" />
                      <p className="text-gray-400 font-medium mb-1">Click to upload image</p>
                      <p className="text-gray-600 text-sm">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="City, State"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-purple-300 text-sm font-bold mb-2 uppercase tracking-wide">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              >
                <option value="">Select a category</option>
                <option value="Rock">Rock</option>
                <option value="Jazz">Jazz</option>
                <option value="Electronic">Electronic</option>
                <option value="Indie">Indie</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Country">Country</option>
                <option value="Blues">Blues</option>
                <option value="Classical">Classical</option>
                <option value="Reggae">Reggae</option>
                <option value="Metal">Metal</option>
                <option value="Folk">Folk</option>
                <option value="Latin">Latin</option>
                <option value="R&B">R&B</option>
                <option value="Pop">Pop</option>
                <option value="Punk">Punk</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
