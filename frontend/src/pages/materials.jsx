import React, { useEffect, useState } from 'react';
import {
    fetchMaterials,
    addMaterial,
    deleteMaterial,
    updateMaterial
} from '../api/api';
import Container from '../component/container';
import './css/material.css'

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        const data = await fetchMaterials();
        setMaterials(data);
    };

    const handleInputChange = (e, setter) => {
        const { name, value, type, checked, files } = e.target;
        setter(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : files ? files[0] : value
        }));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(newMaterial).forEach(([key, value]) => {
            formData.append(key, value);
        });
        await addMaterial(formData);
        setNewMaterial({});
        setFileInputKey(Date.now());
        await loadMaterials();
    };

    const handleDelete = async (id) => {
        await deleteMaterial(id);
        await loadMaterials();
    };

    const handleEditToggle = (material) => {
        setEditingId(material.material_id);
        setEditValues(material);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(editValues).forEach(([key, value]) => {
            formData.append(key, value);
        });
        await updateMaterial(editingId, formData);
        setEditingId(null);
        await loadMaterials();
    };

    return (
        <Container>
            <div className="materials-container">
                <h2>Materials Management</h2>

                <form onSubmit={handleAdd} className="materials-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={newMaterial.name || ''}
                        onChange={(e) => handleInputChange(e, setNewMaterial)}
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={newMaterial.category || ''}
                        onChange={(e) => handleInputChange(e, setNewMaterial)}
                    />
                    <input
                        type="text"
                        name="unit"
                        placeholder="Unit"
                        value={newMaterial.unit || ''}
                        onChange={(e) => handleInputChange(e, setNewMaterial)}
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={newMaterial.description || ''}
                        onChange={(e) => handleInputChange(e, setNewMaterial)}
                    />
                    <input
                        key={fileInputKey}
                        type="file"
                        name="file"
                        onChange={(e) => handleInputChange(e, setNewMaterial)}
                    />
                    <label>
                        Eco:
                        <input
                            type="checkbox"
                            name="is_ecologically"
                            checked={newMaterial.is_ecologically || false}
                            onChange={(e) => handleInputChange(e, setNewMaterial)}
                        />
                    </label>
                    <label>
                        Sensitive:
                        <input
                            type="checkbox"
                            name="is_sensitive"
                            checked={newMaterial.is_sensitive || false}
                            onChange={(e) => handleInputChange(e, setNewMaterial)}
                        />
                    </label>
                    <button type="submit">Add Material</button>
                </form>

                <ul className="materials-list">
                    {materials.map(material => (
                        <li key={material.material_id}>
                            {editingId === material.material_id ? (
                                <form onSubmit={handleUpdate} className="materials-edit-form">
                                    <input type="text" name="name" value={editValues.name || ''} onChange={(e) => handleInputChange(e, setEditValues)} />
                                    <input type="text" name="category" value={editValues.category || ''} onChange={(e) => handleInputChange(e, setEditValues)} />
                                    <input type="text" name="unit" value={editValues.unit || ''} onChange={(e) => handleInputChange(e, setEditValues)} />
                                    <input type="text" name="description" value={editValues.description || ''} onChange={(e) => handleInputChange(e, setEditValues)} />
                                    <input type="file" name="file" onChange={(e) => handleInputChange(e, setEditValues)} />
                                    <label>
                                        Eco:
                                        <input type="checkbox" name="is_ecologically" checked={!!editValues.is_ecologically} onChange={(e) => handleInputChange(e, setEditValues)} />
                                    </label>
                                    <label>
                                        Sensitive:
                                        <input type="checkbox" name="is_sensitive" checked={!!editValues.is_sensitive} onChange={(e) => handleInputChange(e, setEditValues)} />
                                    </label>
                                    <button type="submit">Save</button>
                                </form>
                            ) : (
                                <div>
                                    <p><strong>{material.name}</strong> ({material.category})</p>
                                    <p>{material.description}</p>
                                    <img src={`http://88.200.63.148:12345${material.icon}`} alt={material.name} />
                                    <div className="materials-actions">
                                        <button onClick={() => handleEditToggle(material)}>Edit</button>
                                        <button onClick={() => handleDelete(material.material_id)}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    );
};

export default Materials;
