import React, { useState } from 'react';
import { User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { addToast('Name cannot be empty.', 'error'); return; }
    setIsSaving(true);
    try {
      await updateUser(formData);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-[#141d33] flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Candidate Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your personal details and account information.</p>
        </div>
        <Button onClick={handleSave} variant="primary" size="md" loading={isSaving} icon={Save}>
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt={formData.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/40 shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#11192e] border-2 border-sky-500/40 flex items-center justify-center">
                  <User className="w-10 h-10 text-sky-400/50" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-sky-400 font-medium capitalize">{user?.role}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" />
            <span>Account Information</span>
          </h3>

          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={User}
          />

          <Input
            label="Email Address"
            type="email"
            value={user?.email || ''}
            icon={Mail}
            disabled
            className="opacity-60 cursor-not-allowed"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            icon={Phone}
          />

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Profile Image URL</label>
            <input
              type="url"
              value={formData.profileImage}
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-[#080c16] border border-[#1b2640] focus:border-sky-400 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" loading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
