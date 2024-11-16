import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface InvestorFormData {
  name: string;
  email: string;
  description: string;
  expertise: string;
  investmentRange: string;
}

const AddInvestors: React.FC = () => {
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    email: '',
    description: '',
    expertise: '',
    investmentRange: ''
  });
  const [images, setImages] = useState<FileList | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userID');
        if (!userId) {
          alert('User not logged in');
          return;
        } else {
            console.log(userId);
        }
        
        const response = await axios.get(`http://localhost:8081/users/${userId}`);
        setFormData(prev => ({
          ...prev,
          name: response.data.Username,
          email: response.data.Email
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);
  console.log(formData);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key as keyof InvestorFormData]);
    });
    
    const userId = localStorage.getItem('userID');
    if (!userId) {
      alert('User not logged in');
      return;
    }
    formDataToSend.append('userId', userId);
    
    if (images) {
      Array.from(images).forEach(image => {
        formDataToSend.append('images', image);
      });
    }

    try {
      const response = await axios.post('http://localhost:8081/investors', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 201) {
        alert('Investor added successfully!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          description: '',
          expertise: '',
          investmentRange: ''
        });
        setImages(null);
      }
    } catch (error) {
      console.error('Error adding investor:', error);
      alert('Error adding investor');
    }
  };

  return (
    <div className="container">
        <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Investor</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block mb-1">Description:</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={4}
                required
            />
            </div>

            <div>
            <label className="block mb-1">Expertise:</label>
            <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            />
            </div>

            <div>
            <label className="block mb-1">Investment Range:</label>
            <input
                type="text"
                name="investmentRange"
                value={formData.investmentRange}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
            />
            </div>

            <div>
            <label className="block mb-1">Images:</label>
            <input
                type="file"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="w-full p-2 border rounded"
            />
            </div>

            <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            Add Investor
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddInvestors;