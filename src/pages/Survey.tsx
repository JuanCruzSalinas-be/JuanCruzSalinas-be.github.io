import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { PersonalInfo, FamilyMember, ImportantDate } from '../types';

const Survey: React.FC = () => {
  const navigate = useNavigate();
  const { user, updatePersonalInfo } = useAuth();
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
    // Initialize with existing data if available
    if (user?.personalInfo) {
      return {
        age: user.personalInfo.age || 0,
        interests: user.personalInfo.interests || [],
        familyMembers: user.personalInfo.familyMembers || [],
        dailyRoutine: user.personalInfo.dailyRoutine || [],
        importantDates: user.personalInfo.importantDates || [],
        favoriteLocations: user.personalInfo.favoriteLocations || []
      };
    }
    return {
      age: 0,
      interests: [],
      familyMembers: [],
      dailyRoutine: [],
      importantDates: [],
      favoriteLocations: []
    };
  });
  
  const [newInterest, setNewInterest] = useState('');
  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({ name: '', relation: '' });
  const [newRoutine, setNewRoutine] = useState('');
  const [newDate, setNewDate] = useState<ImportantDate>({ date: '', description: '', type: 'birthday' });
  const [newLocation, setNewLocation] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePersonalInfo(personalInfo);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="border-b">
            <h1 className="text-2xl font-bold text-gray-900">Personalize Your Experience</h1>
            <p className="text-gray-600">Help us create custom quizzes for you</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Age"
                  type="number"
                  value={personalInfo.age || ''}
                  onChange={(e) => setPersonalInfo({
                    ...personalInfo,
                    age: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newInterest.trim()) {
                        setPersonalInfo({
                          ...personalInfo,
                          interests: [...personalInfo.interests, newInterest.trim()]
                        });
                        setNewInterest('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalInfo.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {interest}
                      <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setPersonalInfo({
                          ...personalInfo,
                          interests: personalInfo.interests.filter((_, i) => i !== index)
                        })}
                      >
                        ×
                      </button>
                    </span>
                  )) || []}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Members
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newFamilyMember.name}
                    onChange={(e) => setNewFamilyMember({
                      ...newFamilyMember,
                      name: e.target.value
                    })}
                    placeholder="Name"
                  />
                  <Input
                    value={newFamilyMember.relation}
                    onChange={(e) => setNewFamilyMember({
                      ...newFamilyMember,
                      relation: e.target.value
                    })}
                    placeholder="Relation"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newFamilyMember.name.trim() && newFamilyMember.relation.trim()) {
                        setPersonalInfo({
                          ...personalInfo,
                          familyMembers: [...personalInfo.familyMembers, {
                            name: newFamilyMember.name.trim(),
                            relation: newFamilyMember.relation.trim()
                          }]
                        });
                        setNewFamilyMember({ name: '', relation: '' });
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalInfo.familyMembers?.map((member, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-md flex justify-between items-center"
                    >
                      <span>{member.name} - {member.relation}</span>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setPersonalInfo({
                          ...personalInfo,
                          familyMembers: personalInfo.familyMembers.filter((_, i) => i !== index)
                        })}
                      >
                        Remove
                      </button>
                    </div>
                  )) || []}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Routine
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newRoutine}
                    onChange={(e) => setNewRoutine(e.target.value)}
                    placeholder="Add a daily activity"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newRoutine.trim()) {
                        setPersonalInfo({
                          ...personalInfo,
                          dailyRoutine: [...personalInfo.dailyRoutine, newRoutine.trim()]
                        });
                        setNewRoutine('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalInfo.dailyRoutine?.map((routine, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-md flex justify-between items-center"
                    >
                      {routine}
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setPersonalInfo({
                          ...personalInfo,
                          dailyRoutine: personalInfo.dailyRoutine.filter((_, i) => i !== index)
                        })}
                      >
                        Remove
                      </button>
                    </div>
                  )) || []}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Important Dates
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="date"
                    value={newDate.date}
                    onChange={(e) => setNewDate({
                      ...newDate,
                      date: e.target.value
                    })}
                  />
                  <Input
                    value={newDate.description}
                    onChange={(e) => setNewDate({
                      ...newDate,
                      description: e.target.value
                    })}
                    placeholder="Description"
                  />
                  <select
                    value={newDate.type}
                    onChange={(e) => setNewDate({
                      ...newDate,
                      type: e.target.value as ImportantDate['type']
                    })}
                    className="rounded-md border-gray-300"
                  >
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                  <Button
                    type="button"
                    onClick={() => {
                      if (newDate.date.trim() && newDate.description.trim()) {
                        setPersonalInfo({
                          ...personalInfo,
                          importantDates: [...personalInfo.importantDates, {
                            date: newDate.date.trim(),
                            description: newDate.description.trim(),
                            type: newDate.type
                          }]
                        });
                        setNewDate({ date: '', description: '', type: 'birthday' });
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalInfo.importantDates?.map((date, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-md flex justify-between items-center"
                    >
                      <span>{date.description} - {date.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{date.type}</span>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => setPersonalInfo({
                            ...personalInfo,
                            importantDates: personalInfo.importantDates.filter((_, i) => i !== index)
                          })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add a location"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newLocation.trim()) {
                        setPersonalInfo({
                          ...personalInfo,
                          favoriteLocations: [...personalInfo.favoriteLocations, newLocation.trim()]
                        });
                        setNewLocation('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalInfo.favoriteLocations?.map((location, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {location}
                      <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setPersonalInfo({
                          ...personalInfo,
                          favoriteLocations: personalInfo.favoriteLocations.filter((_, i) => i !== index)
                        })}
                      >
                        ×
                      </button>
                    </span>
                  )) || []}
                </div>
              </div>
              
              <Button type="submit" fullWidth>
                Save and Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Survey;