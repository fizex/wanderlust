import React from 'react';
import { X, Settings, Map, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logOut } from '../../services/firebase';
import SavedItineraries from './SavedItineraries';
import AccountSettings from './AccountSettings';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuTab = 'itineraries' | 'settings';

export default function MenuPanel({ isOpen, onClose }: MenuPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<MenuTab>('itineraries');

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/signin');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleNewAdventure = () => {
    navigate('/');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center mt-4 space-x-2">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || user?.email}`}
                alt="Profile"
                className="w-10 h-10 rounded-full bg-gray-100"
              />
              <div>
                <div className="font-medium">{user?.displayName}</div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* New Adventure Button */}
          <div className="p-4 border-b">
            <button
              onClick={handleNewAdventure}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Generate a New Adventure</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('itineraries')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'itineraries'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Map className="w-4 h-4" />
                <span>My Itineraries</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'itineraries' ? (
              <SavedItineraries onClose={onClose} />
            ) : (
              <AccountSettings />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}