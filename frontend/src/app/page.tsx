"use client";

import React, { useState, useEffect } from 'react';

const TherapyNotesInterface = () => {
  const [sessionInfo, setSessionInfo] = useState({
    title: '',
    session_type: '',
    session_duration: '',
    observation: '',
  });
  const [generatedNote, setGeneratedNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8000/notes/');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      // sort previous notes in descending order
      const sortedNotes = data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotes(sortedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`http://localhost:8000/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      if (noteId === currentNoteId) {
        setSessionInfo({
          title: '',
          session_type: '',
          session_duration: '',
          observation: '',
        });
        setGeneratedNote('');
        setCurrentNoteId(null);
      }

      fetchNotes();
      alert('Note deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete note');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSessionInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateNote = async () => {
    try {
      setIsLoading(true);
      
      const createNoteResponse = await fetch('http://localhost:8000/notes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionInfo,
          session_duration: parseFloat(sessionInfo.session_duration),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!createNoteResponse.ok) {
        throw new Error('Failed to create note');
      }

      const noteData = await createNoteResponse.json();
      setCurrentNoteId(noteData.id);

      const generateResponse = await fetch(`http://localhost:8000/generate-content/${noteData.id}`, {
        method: 'POST',
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate content');
      }

      const { generated_content } = await generateResponse.json();
      setGeneratedNote(generated_content);
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNoteId) return;

    try {
      const noteData = {
        title: sessionInfo.title,
        session_type: sessionInfo.session_type,
        session_duration: parseFloat(sessionInfo.session_duration),
        observation: sessionInfo.observation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        generated_content: generatedNote
      };

      console.log('Sending data:', noteData);

      const response = await fetch(`http://localhost:8000/notes/${currentNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.detail || 'Failed to save note');
      }

      const savedNote = await response.json();
      console.log('Note saved:', savedNote);
      alert('Note saved successfully!');
      setIsEditing(false);
      fetchNotes();
    } catch (error: any) {
      console.error('Error:', error);
      alert((error as Error)?.message || 'Failed to save note. Please try again.');
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Previous Notes</h2>
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSessionInfo({
                  title: note.title,
                  session_type: note.session_type,
                  session_duration: note.session_duration.toString(),
                  observation: note.observation,
                });
                setGeneratedNote(note.generated_content || '');
                setCurrentNoteId(note.id);
              }}
            >
              <div className="font-medium truncate">{note.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                  {note.session_type.charAt(0).toUpperCase() + note.session_type.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Therapy Session Notes</h1>
            <button 
              onClick={() => {
                setSessionInfo({
                  title: '',
                  session_type: '',
                  session_duration: '',
                  observation: '',
                });
                setGeneratedNote('');
                setCurrentNoteId(null);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              New Note
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Session Information</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Session Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter session title..."
                value={sessionInfo.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Session Duration (minutes)</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={sessionInfo.session_duration}
                onChange={(e) => handleInputChange('session_duration', e.target.value)}
              >
                <option value="">Select duration</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Session Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={sessionInfo.session_type}
                onChange={(e) => handleInputChange('session_type', e.target.value)}
              >
                <option value="">Select type</option>
                <option value="individual">Individual Therapy</option>
                <option value="group">Group Therapy</option>
                <option value="family">Family Therapy</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Session Observations</label>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter your observations in bullet points or short form..."
                value={sessionInfo.observation}
                onChange={(e) => handleInputChange('observation', e.target.value)}
              />
            </div>

            <button 
              onClick={handleGenerateNote}
              disabled={isLoading || !sessionInfo.title || !sessionInfo.session_duration || !sessionInfo.session_type || !sessionInfo.observation}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Professional Note"}
            </button>
          </div>

          {/* Generated Note Section */}
          {generatedNote && (
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Generated Professional Note</h2>
              <textarea
                value={generatedNote}
                onChange={(e) => setGeneratedNote(e.target.value)}
                className="w-full h-64 p-2 border rounded-md"
                disabled={!isEditing}
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  {isEditing ? "Done Editing" : "Edit Note"}
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={!isEditing && !currentNoteId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Save Note
                </button>
                {currentNoteId && (
                  <button 
                    onClick={() => handleDeleteNote(currentNoteId)}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    Delete Note
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapyNotesInterface;