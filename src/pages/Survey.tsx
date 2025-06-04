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
  const { user } = useAuth();
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    age: 0,
    interests: [],
    familyMembers: [],
    dailyRoutine: [],
    importantDates: [],
    favoriteLocations: []
  });
  
  const [newInterest, setNewInterest] = useState('');
  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({ name: '', relation: '' });
  const [newRoutine, setNewRoutine] = useState('');
  const [newDate, setNewDate] = useState<ImportantDate>({ date: '', description: '', type: 'birthday' });
  const [newLocation, setNewLocation] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be saved to a database
    localStorage.setItem(`${user?.id}_personalInfo`, JSON.stringify(personalInfo));
    navigate('/dashboard');
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
                    age: parseInt(e.target.value)
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
                      if (newInterest) {
                        setPersonalInfo({
                          ...personalInfo,
                          interests: [...personalInfo.interests, newInterest]
                        });
                        setNewInterest('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalInfo.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
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
                      if (newFamilyMember.name && newFamilyMember.relation) {
                        setPersonalInfo({
                          ...personalInfo,
                          familyMembers: [...personalInfo.familyMembers, newFamilyMember]
                        });
                        setNewFamilyMember({ name: '', relation: '' });
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalInfo.familyMembers.map((member, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-md flex justify-between items-center"
                    >
                      <span>{member.name} - {member.relation}</span>
                    </div>
                  ))}
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
                      if (newRoutine) {
                        setPersonalInfo({
                          ...personalInfo,
                          dailyRoutine: [...personalInfo.dailyRoutine, newRoutine]
                        });
                        setNewRoutine('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalInfo.dailyRoutine.map((routine, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-md"
                    >
                      {routine}
                    </div>
                  ))}
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
                      if (newDate.date && newDate.description) {
                        setPersonalInfo({
                          ...personalInfo,
                          importantDates: [...personalInfo.importantDates, newDate]
                        });
                        setNewDate({ date: '', description: '', type: 'birthday' });
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalInfo.importantDates.map((date, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-md flex justify-between items-center"
                    >
                      <span>{date.description} - {date.date}</span>
                      <span className="text-sm text-gray-500">{date.type}</span>
                    </div>
                  ))}
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
                      if (newLocation) {
                        setPersonalInfo({
                          ...personalInfo,
                          favoriteLocations: [...personalInfo.favoriteLocations, newLocation]
                        });
                        setNewLocation('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalInfo.favoriteLocations.map((location, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {location}
                    </span>
                  ))}
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