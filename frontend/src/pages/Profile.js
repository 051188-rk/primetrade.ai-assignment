import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { FiEdit2, FiSave, FiX, FiUser, FiMail, FiCalendar } from 'react-icons/fi';

function Profile() {
  const { user: currentUser, updateUser } = useAuth();
  const { theme } = useTheme();
  const [user, setUser] = useState({
    name: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        setUser({
          name: response.data.name,
          email: response.data.email
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error(error.response?.data?.msg || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]); // Add currentUser to dependency array to refresh when auth state changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile({
        name: user.name,
        email: user.email
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Update the auth context with the new user data
      updateUser({ 
        ...currentUser, 
        name: response.data.name, 
        email: response.data.email 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-neon' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm shadow-2xl' : 'bg-white/90 backdrop-blur-sm shadow-xl'}`}>
          <div className="p-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                {user.name}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {user.email}
              </p>
            </div>

            {/* Edit Toggle */}
            <div className="flex justify-end mb-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-inner"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      setUser({
                        name: currentUser.name,
                        email: currentUser.email
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-500/10 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-inner"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <label htmlFor="name" className={`block text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={user.name}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-3 rounded-lg border-0 ${theme === 'dark' ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none transition-all duration-200`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <label htmlFor="email" className={`block text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={user.email}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-3 rounded-lg border-0 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 cursor-not-allowed`}
                        disabled
                      />
                    </div>
                    <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Contact support to change your email address
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Info Card */}
                <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white'} shadow-sm`}>
                  <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Personal Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Name */}
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center`}>
                        <FiUser className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'} flex items-center justify-center`}>
                        <FiMail className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</p>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'} flex items-center justify-center`}>
                        <FiCalendar className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</p>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {currentUser?.createdAt 
                            ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
