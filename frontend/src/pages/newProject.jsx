import React, { useState, useEffect } from 'react';
import { createProject, searchMaterials } from '../api/api';
import './css/new.css';
import { useNavigate } from 'react-router-dom';

const AddProject = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    time_required: '',
    is_published: false,
    instruction: '',
    materials: [],
    thumbnail: null,
    images: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        searchMaterials(searchTerm)
          .then(data => setSearchResults(data))
          .catch(err => console.error('Failed to fetch materials', err));
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAddMaterial = (material) => {
    console.log(material)
    const exists = form.materials.some(m => m.id === material.material_id);
    if (!exists) {
      const newMaterial = {
        id: material.material_id,
        name: material.name,
        quantity: 1,
      };
      setForm(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }));
    }
  };

  const handleRemoveMaterial = (index) => {
    setForm(prev => {
      const updated = [...prev.materials];
      updated.splice(index, 1);
      return { ...prev, materials: updated };
    });
  };

  const handleQuantityChange = (index, quantity) => {
    setForm(prev => {
      const updated = [...prev.materials];
      updated[index].quantity = parseInt(quantity) || 1;
      return { ...prev, materials: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleThumbnailChange = (e) => {
    setForm({ ...form, thumbnail: e.target.files[0] });
  };

  const handleImagesChange = (e) => {
    setForm({ ...form, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const materialsPayload = form.materials.map(({ id, quantity }) => ({
      id: id,
      quantity,
    }));

    const payload = {
      ...form,
      materials: materialsPayload,
    };

    try {
      const response = await createProject(payload);

      if (response && response.project_id) {
        navigate(`/project/${response.project_id}`);
      } else {
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Add New Project</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="woodworking">Woodworking</option>
          <option value="electronics">Electronics</option>
          <option value="art">Art</option>
          <option value="home">Home Improvement</option>
        </select>
        <select name="difficulty" value={form.difficulty} onChange={handleChange} required>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="advanced">Advanced</option>
        </select>
        <input name="time_required" value={form.time_required} onChange={handleChange} placeholder="Time Required" required />
        <textarea name="instruction" value={form.instruction} onChange={handleChange} placeholder="Instruction" required />

        <label className='checkbox '>
          <input className='box' type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
          <p className='published'>Published</p>
        </label>

        <label>Thumbnail:</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} required />

        <label>Images:</label>
        <input type="file" accept="image/*" multiple onChange={handleImagesChange} />

        <div className="material-section">
          <h3>Search Materials</h3>
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="material-results">
            {searchResults.map((mat) => (
              <li key={`${mat.id}-${Math.random()}`}>
                {mat.name}
                <button type="button" onClick={() => handleAddMaterial(mat)}>Add</button>
              </li>
            ))}
          </ul>

          <h4>Selected Materials</h4>
          <ul className="selected-materials">
            {form.materials.map((mat, index) => (
              <li key={index}>
                {mat.name} - Quantity:
                <input
                  type="number"
                  value={mat.quantity}
                  min="1"
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                />
                <button type="button" onClick={() => handleRemoveMaterial(index)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit">Create Project</button>
      </form>
    </div>
  );
};

export default AddProject;
